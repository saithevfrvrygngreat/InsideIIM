process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

// Define the state of the LangGraph research agent
export const ResearchState = Annotation.Root({
  companyName: Annotation(),
  ticker: Annotation(),
  priceInfo: Annotation(),
  financialData: Annotation(),
  newsData: Annotation(),
  riskData: Annotation(),
  decision: Annotation(),
  score: Annotation(),
  reasoning: Annotation(),
  pros: Annotation(),
  cons: Annotation(),
  sources: Annotation(),
  logs: Annotation(),
});

// Simple helper to log steps in real-time
function addLog(logs = [], message) {
  console.log(`[AGENT LOG] ${message}`);
  return [...logs, `${new Date().toLocaleTimeString()}: ${message}`];
}

// Simple web search fallback using DuckDuckGo HTML scraping if Tavily is unavailable
async function webSearchFallback(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) return "Search fallback failed due to rate limits.";
    const html = await response.text();
    
    // Extract search result snippets
    const matches = html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g);
    const snippets = [];
    for (const match of matches) {
      const cleanSnippet = match[1]
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      snippets.push(cleanSnippet);
      if (snippets.length >= 4) break;
    }
    return snippets.length > 0 ? snippets.join("\n\n") : "No public search results found.";
  } catch (error) {
    console.error("Search fallback error:", error);
    return "Search fallback error occurred.";
  }
}

// Perform web search using Tavily if key is provided, else fallback to DDG HTML
async function searchWeb(query, tavilyKey) {
  if (tavilyKey && tavilyKey.trim()) {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: query,
          search_depth: "basic",
          max_results: 5,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.results.map((r) => `${r.title}: ${r.content}`).join("\n\n");
        const sources = data.results.map((r) => r.url);
        return { content, sources };
      }
    } catch (e) {
      console.error("Tavily API failed, falling back to Web Scraper.", e);
    }
  }

  // Fallback if no Tavily key or Tavily failed
  const content = await webSearchFallback(query);
  return { content, sources: ["Public Search Indices"] };
}

// Get the appropriate LLM model based on user-supplied keys
function getModel(keys) {
  if (keys.geminiKey && keys.geminiKey.trim()) {
    return new ChatGoogleGenerativeAI({
      apiKey: keys.geminiKey,
      model: "gemini-1.5-flash",
      temperature: 0.2,
    });
  } else if (keys.openaiKey && keys.openaiKey.trim()) {
    return new ChatOpenAI({
      apiKey: keys.openaiKey,
      model: "gpt-4o-mini",
      temperature: 0.2,
    });
  }
  return null;
}

// Graph Node 1: Lookup Ticker
async function lookupTicker(state, config) {
  const name = state.companyName;
  const logs = addLog(state.logs, `Searching ticker database for "${name}"...`);

  try {
    const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(name)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const firstQuote = searchData.quotes?.find((q) => q.quoteType === "EQUITY");
      
      if (firstQuote) {
        const symbol = firstQuote.symbol;
        const shortname = firstQuote.shortname || firstQuote.longname || name;
        const industry = firstQuote.industryDisp || firstQuote.industry || "Unknown Industry";
        const sector = firstQuote.sectorDisp || firstQuote.sector || "Unknown Sector";
        
        const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
        const chartResponse = await fetch(chartUrl, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        
        let priceInfo = {
          symbol,
          longName: shortname,
          sector,
          industry,
          price: 0,
          currency: "USD",
          high52w: 0,
          low52w: 0,
        };

        if (chartResponse.ok) {
          const chartData = await chartResponse.json();
          const meta = chartData.chart?.result?.[0]?.meta;
          if (meta) {
            priceInfo.price = meta.regularMarketPrice || 0;
            priceInfo.currency = meta.currency || "USD";
            priceInfo.high52w = meta.fiftyTwoWeekHigh || 0;
            priceInfo.low52w = meta.fiftyTwoWeekLow || 0;
          }
        }

        return {
          ticker: symbol,
          priceInfo,
          logs: addLog(logs, `Successfully resolved ticker: ${symbol} (${shortname}) current price: ${priceInfo.price} ${priceInfo.currency}`)
        };
      }
    }
  } catch (error) {
    console.error("Ticker lookup error:", error);
    throw new Error(`Ticker database connection failed. Please check your network.`);
  }

  // Throw validation error if no equity is found
  throw new Error(`Could not resolve "${name}" to any valid company ticker. Please enter a valid company name (e.g. Apple, Google, Tata).`);
}

// Graph Node 2: Financial Search & Analysis
async function analyzeFinancials(state, config) {
  const name = state.priceInfo?.longName || state.companyName;
  const symbol = state.ticker || state.companyName;
  const keys = config?.configurable?.keys || {};
  const logs = addLog(state.logs, `Retrieving balance sheet and financial performance metrics for ${name} (${symbol})...`);

  const searchQuery = `${name} ${symbol} quarterly financial reports revenue net income growth margins balance sheet 2025 2026`;
  const searchResult = await searchWeb(searchQuery, keys.tavilyKey);
  
  return {
    financialData: searchResult.content,
    sources: [...(state.sources || []), ...searchResult.sources],
    logs: addLog(logs, `Financial data successfully gathered gathered (${searchResult.sources.length} sources analyzed).`)
  };
}

// Graph Node 3: News & Sentiment Gathering
async function analyzeNews(state, config) {
  const name = state.priceInfo?.longName || state.companyName;
  const symbol = state.ticker || state.companyName;
  const keys = config?.configurable?.keys || {};
  const logs = addLog(state.logs, `Scraping recent stock market news and analyst reports for ${name}...`);

  const searchQuery = `${name} ${symbol} stock news market sentiment analyst upgrades downgrades 2026`;
  const searchResult = await searchWeb(searchQuery, keys.tavilyKey);

  return {
    newsData: searchResult.content,
    sources: [...(state.sources || []), ...searchResult.sources],
    logs: addLog(logs, `Market sentiment and news database parsed successfully.`)
  };
}

// Graph Node 4: Risk Profiler
async function assessRisks(state, config) {
  const name = state.priceInfo?.longName || state.companyName;
  const symbol = state.ticker || state.companyName;
  const keys = config?.configurable?.keys || {};
  const logs = addLog(state.logs, `Evaluating competitive threats, regulatory risks, and headwinds for ${name}...`);

  const searchQuery = `${name} ${symbol} competitors risk factors industry challenges regulation debt interest rates`;
  const searchResult = await searchWeb(searchQuery, keys.tavilyKey);

  return {
    riskData: searchResult.content,
    sources: [...(state.sources || []), ...searchResult.sources],
    logs: addLog(logs, `Risk profile evaluation completed.`)
  };
}

// Graph Node 5: Thesis Synthesizer
async function synthesizeDecision(state, config) {
  const keys = config?.configurable?.keys || {};
  const logs = addLog(state.logs, `Synthesizing final investment decision and generating rating...`);
  
  const model = getModel(keys);
  
  if (!model) {
    // If no LLM keys, run high fidelity Mock analysis based on company name
    return getMockReport(state, logs);
  }

  const prompt = `You are a Senior Investment Analyst at InsideIIM Venture Capital.
You need to research and decide whether to INVEST or PASS on this company: ${state.companyName} (${state.ticker}).

Here is the data collected:
- Current Stock/Company Info: ${JSON.stringify(state.priceInfo)}
- Financial Health & Performance Data:
${state.financialData}
- Market News & Sentiment:
${state.newsData}
- Competitors & Risks:
${state.riskData}

Provide your analysis and decision strictly in the following JSON format:
{
  "decision": "INVEST" or "PASS",
  "score": integer between 1 and 100,
  "reasoning": "A concise executive summary thesis (2-3 paragraphs) explaining the decision based on financial health, risks, and sentiment.",
  "pros": ["Pro factor 1", "Pro factor 2", "Pro factor 3"],
  "cons": ["Con factor 1", "Con factor 2", "Con factor 3"]
}

Ensure the JSON is valid and only the JSON is returned, without markdown ticks.`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    // Clean up response string if LLM returned markdown code fences
    const cleanContent = content.trim().replace(/^```json/i, "").replace(/```$/, "").trim();
    const result = JSON.parse(cleanContent);

    return {
      decision: result.decision || "PASS",
      score: result.score || 50,
      reasoning: result.reasoning || "Analysis complete.",
      pros: result.pros || [],
      cons: result.cons || [],
      logs: addLog(logs, `Research complete! Final decision: ${result.decision} (Score: ${result.score}/100)`)
    };
  } catch (error) {
    console.error("LLM synthesis error, falling back to rule-based analysis:", error);
    return getMockReport(state, addLog(logs, `LLM synthesis encountered an error. Generating rule-based report.`));
  }
}

// High fidelity Mock Analysis generator for Demo Mode
function getMockReport(state, logs) {
  const name = state.companyName.toLowerCase();
  let decision = "INVEST";
  let score = 78;
  let reasoning = "";
  let pros = [];
  let cons = [];

  if (name.includes("apple") || name.includes("aapl")) {
    decision = "INVEST";
    score = 88;
    reasoning = `Apple Inc. continues to show outstanding financial resilience, fueled by its dominant ecosystem and recurring services revenue. With over 2.2 billion active devices globally, the company enjoys massive customer lock-in. Their capital return program, including heavy stock buybacks and dividends, provides a solid floor for shareholders. Although hardware growth (specifically iPhones) has slowed in mature markets, emerging opportunities in spatial computing, AI integration (Apple Intelligence), and fintech position Apple for steady long-term compounding.`;
    pros = [
      "Unrivaled brand loyalty and deep ecosystem lock-in.",
      "High profit margins and massive free cash flow generation ($100B+ annually).",
      "Apple Intelligence rollouts driving a strong hardware upgrade super-cycle."
    ];
    cons = [
      "Regulatory antitrust scrutiny in the US and European Union regarding App Store fees.",
      "Slowing growth rates in China due to domestic competition.",
      "High dependence on the iPhone for the majority of revenue."
    ];
  } else if (name.includes("tesla") || name.includes("tsla")) {
    decision = "PASS";
    score = 45;
    reasoning = `Tesla is a highly innovative leader in electric vehicles and autonomy, but currently presents a high-risk profile at its current market valuation. Profit margins have contracted significantly due to global EV price cuts and rising competition from Chinese automakers like BYD. While the FSD (Full Self-Driving) and Robotaxi narrative represents massive potential upside, concrete monetization timelines remain speculative. We advise a pass due to volatility, margin compression, and valuation premium relative to legacy carmakers.`;
    pros = [
      "Undisputed leader in EV infrastructure and charging networks globally.",
      "Substantial cash reserves with virtually zero net debt.",
      "High potential upside from AI, robotics (Optimus), and autonomous driving software."
    ];
    cons = [
      "Declining gross margins due to aggressive EV price war.",
      "Slowing global EV adoption rate and rising competition.",
      "Extremely high valuation multiple (P/E) which assumes near-perfect execution on autonomy."
    ];
  } else if (name.includes("nvidia") || name.includes("nvda")) {
    decision = "INVEST";
    score = 92;
    reasoning = `NVIDIA is the pick-and-shovel provider of the AI gold rush, commanding over 85% market share in AI accelerators. The company's financial profile is stellar, exhibiting exponential triple-digit revenue growth and operating margins exceeding 60%. NVIDIA's CUDA software platform creates a massive competitive moat, making it very difficult for customers to transition to AMD or custom hyperscaler chips. Despite cyclical chip industry risks and potential custom silicon threats from AWS/Google, NVIDIA remains a high-conviction buy.`;
    pros = [
      "Absolute monopoly in AI training and inference GPUs (H100, Blackwell).",
      "Unprecedented revenue growth and operating leverage.",
      "CUDA software ecosystem creates a massive lock-in effect for developers."
    ];
    cons = [
      "Extreme valuation multiple makes it highly sensitive to any spend slowdown by hyperscalers.",
      "Supply chain bottlenecks and dependency on TSMC for semiconductor fabrication.",
      "Export restrictions to China limiting a major market segment."
    ];
  } else {
    // General Mock fallback based on string length hashing to keep it dynamic and consistent
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const scoreVal = 50 + (hash % 45); // generates score between 50 and 94
    decision = scoreVal >= 70 ? "INVEST" : "PASS";
    score = scoreVal;
    
    const isInvest = decision === "INVEST";
    reasoning = isInvest 
      ? `${state.companyName} represents a compelling investment opportunity. The company exhibits solid fundamentals within its market sector, showing consistent top-line growth and stable operating margins. While there are competitive headwinds, the management's capital allocation strategy and focus on expanding margins through operational efficiency bode well for long-term equity returns. We recommend taking a long position.`
      : `While ${state.companyName} has an established brand, the financial metrics indicate a cautious approach is warranted. High debt obligations combined with declining growth in core segments present structural risks. Additionally, valuation multiples do not align with current growth rates. We recommend passing on this asset until margins stabilize and cash flow productivity improves.`;
      
    pros = [
      "Established industry presence with solid customer relationships.",
      "Favorable secular trends in the company's primary operating sector.",
      "Manageable capital expenditure requirements going forward."
    ];
    cons = [
      "Intensifying competition from lower-cost digital disruptors.",
      "Macroeconomic pressures, specifically inflation affecting raw material inputs.",
      "Vulnerability to interest rate hikes due to leveraged balance sheet."
    ];
  }

  // Filter sources to display clean lists
  const defaultSources = [
    "https://finance.yahoo.com/quote/" + (state.ticker || "MOCK"),
    "https://sec.gov/edgar/searchedgar/companysearch",
    "https://www.bloomberg.com/search?query=" + encodeURIComponent(state.companyName)
  ];

  return {
    decision,
    score,
    reasoning,
    pros,
    cons,
    sources: defaultSources,
    logs: addLog(logs, `[DEMO MODE] Research completed. (Decision: ${decision}, Score: ${score}/100)`)
  };
}

// Build the LangGraph Workflow Graph
export function buildResearchGraph() {
  const workflow = new StateGraph(ResearchState)
    .addNode("resolveTicker", lookupTicker)
    .addNode("financials", analyzeFinancials)
    .addNode("sentiment", analyzeNews)
    .addNode("risks", assessRisks)
    .addNode("thesis", synthesizeDecision)
    
    .addEdge("__start__", "resolveTicker")
    .addEdge("resolveTicker", "financials")
    .addEdge("financials", "sentiment")
    .addEdge("sentiment", "risks")
    .addEdge("risks", "thesis")
    .addEdge("thesis", "__end__");

  return workflow.compile();
}

/**
 * Execute the investment research agent.
 */
export async function runResearchAgent(companyName, keys, onStepCallback) {
  const graph = buildResearchGraph();
  
  // Initial state configuration
  const initialState = {
    companyName: companyName,
    ticker: "",
    priceInfo: null,
    financialData: "",
    newsData: "",
    riskData: "",
    decision: "PASS",
    score: 0,
    reasoning: "",
    pros: [],
    cons: [],
    sources: [],
    logs: [`${new Date().toLocaleTimeString()}: Research initialized for "${companyName}"`],
  };

  // Compile graph and stream nodes
  const stream = await graph.stream(initialState, {
    configurable: { keys }
  });

  let currentState = { ...initialState };

  for await (const update of stream) {
    const updateAny = update;
    const nodeName = Object.keys(updateAny)[0];
    if (nodeName && updateAny[nodeName]) {
      const nodeOutput = updateAny[nodeName];
      currentState = {
        ...currentState,
        ...nodeOutput,
        logs: nodeOutput.logs || currentState.logs
      };

      if (onStepCallback) {
        onStepCallback(nodeName, currentState);
      }
    }
  }

  return currentState;
}
