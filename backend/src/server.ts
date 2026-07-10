process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from "express";
import cors from "cors";
import { runResearchAgent } from "./agent.ts";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Main Research SSE API endpoint
app.post("/api/research", async (req: express.Request, res: express.Response) => {
  const { companyName, geminiKey, openaiKey, tavilyKey } = req.body;

  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    res.status(400).json({ error: "Company name is required." });
    return;
  }

  // Resolve keys from parameters, falling back to server environment variables
  const activeKeys = {
    geminiKey: geminiKey?.trim() || process.env.GEMINI_API_KEY || "",
    openaiKey: openaiKey?.trim() || process.env.OPENAI_API_KEY || "",
    tavilyKey: tavilyKey?.trim() || process.env.TAVILY_API_KEY || "",
  };

  // Set SSE Headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent("log", { message: `[Express Node.js Backend] Spawning research pipeline for "${companyName}"...` });

    const finalResult = await runResearchAgent(
      companyName.trim(),
      activeKeys,
      (stepId, state) => {
        sendEvent("step", {
          stepId,
          logs: state.logs,
          ticker: state.ticker,
          priceInfo: state.priceInfo,
          decision: state.decision,
          score: state.score,
          pros: state.pros,
          cons: state.cons,
          reasoning: state.reasoning,
        });
      }
    );

    sendEvent("done", finalResult);
  } catch (error: any) {
    console.error("Express backend runResearchAgent error:", error);
    sendEvent("error", { message: error.message || "An unknown error occurred during research." });
  } finally {
    res.end();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  InsideIIM Express Backend is running on port ${PORT}`);
  console.log(`  Route: POST http://localhost:${PORT}/api/research`);
  console.log(`===================================================`);
});
