process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { runResearchAgent } from "../backend/src/agent.js";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { companyName, geminiKey, openaiKey, tavilyKey } = req.body;

  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    res.status(400).json({ error: "Company name is required." });
    return;
  }

  // Resolve keys from parameters or env variables
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

  const sendEvent = (eventName, data) => {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent("log", { message: `[Vercel Serverless Backend] Spawning research pipeline for "${companyName}"...` });

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
  } catch (error) {
    console.error("Vercel Serverless error:", error);
    sendEvent("error", { message: error.message || "An error occurred during search." });
  } finally {
    res.end();
  }
}
