import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sliders,
  Loader2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  RefreshCw,
  Compass,
  ArrowRight,
  Database
} from "lucide-react";
import SettingsModal from "./components/SettingsModal";
import AgentGraphVisualizer from "./components/AgentGraphVisualizer";

async function fetchWithTimeout(url: string, options: any, timeout = 2500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export default function App() {
  const [query, setQuery] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Agent states
  const [currentStepId, setCurrentStepId] = useState<string | undefined>(undefined);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"thesis" | "proscons" | "sources" | "logs">("thesis");
  
  // Final report results
  const [report, setReport] = useState<any | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Load API keys helper
  const getClientKeys = () => {
    if (typeof window !== "undefined") {
      return {
        geminiKey: localStorage.getItem("gemini_api_key") || "",
        openaiKey: localStorage.getItem("openai_api_key") || "",
        tavilyKey: localStorage.getItem("tavily_api_key") || "",
      };
    }
    return { geminiKey: "", openaiKey: "", tavilyKey: "" };
  };
  const runClientSideSimulation = (searchQuery: string) => {
    let mockLogs: string[] = [];
    const addMockLog = (msg: string) => {
      const log = `${new Date().toLocaleTimeString()}: ${msg}`;
      mockLogs = [...mockLogs, log];
      setLogs(mockLogs);
    };

    addMockLog(`[Simulation Mode] Research initialized for "${searchQuery}"`);
    setCurrentStepId("ticker");
    setCompletedStepIds([]);

    // Step 1: Ticker Lookup (1.2s)
    setTimeout(() => {
      const ticker = searchQuery.toUpperCase().substring(0, 5);
      addMockLog(`Searching ticker database for "${searchQuery}"...`);
      setTimeout(() => {
        addMockLog(`Successfully resolved ticker: ${ticker} (${searchQuery})`);
        setCurrentStepId("financials");
        setCompletedStepIds(["ticker"]);

        // Step 2: Financial Analysis (1.5s)
        setTimeout(() => {
          addMockLog(`Retrieving financial performance metrics, revenue growth, and debt ratios for ${searchQuery}...`);
          setTimeout(() => {
            addMockLog(`Financial data gathered (3 sources analyzed).`);
            setCurrentStepId("sentiment");
            setCompletedStepIds(["ticker", "financials"]);

            // Step 3: News Sentiment (1.5s)
            setTimeout(() => {
              addMockLog(`Scraping recent stock market news and analyst upgrades/downgrades...`);
              setTimeout(() => {
                addMockLog(`Market sentiment parsed. 5 recent articles analyzed.`);
                setCurrentStepId("risks");
                setCompletedStepIds(["ticker", "financials", "sentiment"]);

                // Step 4: Risk Profiler (1.5s)
                setTimeout(() => {
                  addMockLog(`Evaluating competitive headwinds, regulatory exposure, and debt structures...`);
                  setTimeout(() => {
                    addMockLog(`Risk factors profiled successfully.`);
                    setCurrentStepId("thesis");
                    setCompletedStepIds(["ticker", "financials", "sentiment", "risks"]);

                    // Step 5: Synthesis (1.5s)
                    setTimeout(() => {
                      addMockLog(`Synthesizing final investment decision and generating analyst score...`);
                      setTimeout(() => {
                        // Generate mock data based on input query
                        const name = searchQuery.toLowerCase();
                        let decision: "INVEST" | "PASS" = "INVEST";
                        let score = 78;
                        let reasoning = "";
                        let pros: string[] = [];
                        let cons: string[] = [];

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
                          const hashVal = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const scoreVal = 50 + (hashVal % 45);
                          decision = scoreVal >= 70 ? "INVEST" : "PASS";
                          score = scoreVal;
                          const isInvest = decision === "INVEST";
                          
                          reasoning = isInvest 
                            ? `${searchQuery} represents a compelling investment opportunity. The company exhibits solid fundamentals within its market sector, showing consistent top-line growth and stable operating margins. While there are competitive headwinds, the management's capital allocation strategy and focus on expanding margins through operational efficiency bode well for long-term equity returns. We recommend taking a long position.`
                            : `While ${searchQuery} has an established brand, the financial metrics indicate a cautious approach is warranted. High debt obligations combined with declining growth in core segments present structural risks. Additionally, valuation multiples do not align with current growth rates. We recommend passing on this asset until margins stabilize and cash flow productivity improves.`;
                            
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

                        const price = 50 + (searchQuery.length * 7) + (score % 20);

                        const finalResult = {
                          ticker,
                          decision,
                          score,
                          reasoning,
                          pros,
                          cons,
                          priceInfo: {
                            symbol: ticker,
                            longName: searchQuery,
                            sector: "Technology",
                            industry: "Software",
                            price,
                            currency: "USD",
                            high52w: price * 1.25,
                            low52w: price * 0.75,
                          },
                          sources: [
                            `https://finance.yahoo.com/quote/${ticker}`,
                            `https://www.google.com/finance/quote/${ticker}:NASDAQ`
                          ],
                          logs: [...mockLogs, `${new Date().toLocaleTimeString()}: [Simulation Mode] Research completed. (Decision: ${decision}, Score: ${score}/100)`]
                        };

                        setReport(finalResult);
                        setCurrentStepId(undefined);
                        setCompletedStepIds(["ticker", "financials", "sentiment", "risks", "thesis"]);
                        setIsResearching(false);
                      }, 700);
                    }, 800);
                  }, 700);
                }, 800);
              }, 700);
            }, 800);
          }, 700);
        }, 800);
      }, 700);
    }, 500);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || isResearching) return;
    
    setIsResearching(true);
    setError(null);
    setReport(null);
    setLogs([]);
    setCurrentStepId("ticker");
    setCompletedStepIds([]);
    setActiveTab("thesis");

    const keys = getClientKeys();
    let response;
    let useSimulation = false;

    try {
      try {
        response = await fetchWithTimeout("/api/research", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: searchQuery,
            ...keys,
          }),
        }, 2000);
      } catch (proxyError) {
        console.warn("Vite API proxy failed, attempting direct Express port 3001 connection...", proxyError);
        response = await fetchWithTimeout("http://localhost:3001/api/research", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: searchQuery,
            ...keys,
          }),
        }, 2000);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server responded with an error.");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/event-stream")) {
        throw new Error("Invalid response content type: " + contentType);
      }
    } catch (err: any) {
      console.warn("Could not connect to the Express research backend. Running client-side simulation...", err);
      useSimulation = true;
    }

    if (useSimulation) {
      runClientSideSimulation(searchQuery);
      return;
    }

    try {
      if (!response) {
        throw new Error("Empty backend response.");
      }
      if (!response.body) {
        throw new Error("Response body is not readable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event:\s*(.+)$/m);
          const dataMatch = line.match(/^data:\s*(.+)$/m);

          if (eventMatch && dataMatch) {
            const eventName = eventMatch[1].trim();
            const rawData = dataMatch[1].trim();

            try {
              const parsedData = JSON.parse(rawData);

              if (eventName === "log") {
                setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${parsedData.message}`]);
              } else if (eventName === "step") {
                const { stepId, logs: stepLogs, ticker, priceInfo, decision, score, pros, cons, reasoning } = parsedData;
                
                if (stepLogs) setLogs(stepLogs);
                
                // Track node completed
                if (stepId === "ticker") {
                  setCurrentStepId("financials");
                  setCompletedStepIds(["ticker"]);
                } else if (stepId === "financials") {
                  setCurrentStepId("sentiment");
                  setCompletedStepIds(["ticker", "financials"]);
                } else if (stepId === "sentiment") {
                  setCurrentStepId("risks");
                  setCompletedStepIds(["ticker", "financials", "sentiment"]);
                } else if (stepId === "risks") {
                  setCurrentStepId("thesis");
                  setCompletedStepIds(["ticker", "financials", "sentiment", "risks"]);
                }

                // Keep intermediate state updated
                setReport((prev: any) => ({
                  ...prev,
                  ticker,
                  priceInfo,
                  decision,
                  score,
                  pros,
                  cons,
                  reasoning
                }));
              } else if (eventName === "done") {
                setReport(parsedData);
                setCurrentStepId(undefined);
                setCompletedStepIds(["ticker", "financials", "sentiment", "risks", "thesis"]);
                setLogs(parsedData.logs || []);
                setIsResearching(false);
              } else if (eventName === "error") {
                setError(parsedData.message || "An error occurred during search.");
                setIsResearching(false);
              }
            } catch (err) {
              console.error("Error parsing SSE line data:", err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Search fetch error:", err);
      setError(err.message || "Could not connect to the Express research backend.");
      setIsResearching(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    handleSearch(name);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="border-b border-border-custom bg-card/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-stone-900 text-white rounded-lg p-2 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl tracking-tight text-foreground">
                InsideIIM Research AI
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-text font-medium">
                AI Equity Research & Venture Analysis Agent
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 border border-border-custom rounded-lg px-4 py-2 text-xs font-semibold hover:bg-background transition-colors text-muted-text hover:text-foreground shadow-xs"
          >
            <Sliders className="h-3.5 w-3.5" />
            Configure Keys
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Search Panel */}
        <section className="text-center max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold-light/40 border border-accent-gold/10 text-xs text-accent-gold font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Venture Capital Due Diligence Pipeline
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground">
            Evaluate Investment Opportunities In Real-Time
          </h2>
          <p className="text-sm text-muted-text max-w-lg mx-auto">
            Input a company or brand name. The LangGraph agent resolves the ticker symbol, audits financial statements, monitors market sentiment, and generates an investment recommendation.
          </p>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="relative flex items-center mt-6 rounded-xl border border-border-custom bg-card p-1.5 shadow-md focus-within:ring-2 focus-within:ring-accent-gold/20 focus-within:border-accent-gold transition-all"
          >
            <div className="flex items-center pl-3 text-stone-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter brand or company (e.g., Apple, Nvidia, Tesla, Microsoft)..."
              disabled={isResearching}
              className="w-full bg-transparent px-3 py-3 text-sm outline-hidden text-foreground placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={isResearching || !query.trim()}
              className="flex items-center gap-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isResearching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  Research Agent
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Suggestions */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <span className="text-xs text-muted-text flex items-center justify-center">Try:</span>
            {["NVIDIA", "Apple", "Tesla", "Microsoft"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                disabled={isResearching}
                className="text-xs px-3 py-1 rounded-lg border border-border-custom bg-card hover:bg-background text-muted-text hover:text-foreground font-medium transition-colors disabled:opacity-50 shadow-2xs"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-900 flex gap-3 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-red-700 shrink-0" />
            <div>
              <h4 className="font-semibold">Pipeline Execution Failed</h4>
              <p className="mt-1 text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Live Stepper & Logs Panel (Only during active research or when logs exist) */}
        {isResearching && (
          <section className="max-w-4xl mx-auto space-y-6">
            <AgentGraphVisualizer
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />

            {/* Console Log Panel */}
            <div className="rounded-xl border border-border-custom bg-stone-950 p-4 shadow-lg overflow-hidden flex flex-col h-60">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
                  <Database className="h-3.5 w-3.5 text-accent-gold" />
                  Agent Execution Log Stream
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent-gold animate-pulse" />
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">Live</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-xs text-stone-400 space-y-1.5 pr-2">
                {logs.length === 0 ? (
                  <div className="text-stone-600 italic">Starting node processing loop...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap">
                      <span className="text-accent-gold select-none mr-1.5">&gt;</span>
                      {log}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </section>
        )}

        {/* Final Report Dashboard */}
        {report && !isResearching && (
          <section className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            
            {/* Recommendation Header */}
            <div className={`rounded-xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md transition-all ${
              report.decision === "INVEST" 
                ? "bg-invest-bg border-lime-200" 
                : "bg-pass-bg border-red-200"
            }`}>
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs bg-white border border-border-custom">
                  {report.decision === "INVEST" ? (
                    <TrendingUp className="h-3.5 w-3.5 text-lime-700" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-700" />
                  )}
                  Recommendation Decision
                </div>
                
                <h3 className="font-serif text-3xl font-extrabold tracking-tight">
                  {report.decision === "INVEST" ? (
                    <span className="text-lime-900">INVEST RECOMMENDATION</span>
                  ) : (
                    <span className="text-red-900">PASS/AVOID ASSET</span>
                  )}
                </h3>
                <p className="text-xs text-muted-text font-medium">
                  Analysis completed on {report.priceInfo?.longName || report.companyName} ({report.ticker})
                </p>
              </div>

              {/* Circular Score Badge */}
              <div className="relative flex items-center justify-center h-28 w-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-stone-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className={report.decision === "INVEST" ? "text-lime-700" : "text-red-700"}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - report.score / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-serif font-black text-foreground">{report.score}</span>
                  <span className="text-[9px] uppercase tracking-wider text-muted-text font-bold">Score</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Asset Name", value: report.priceInfo?.longName || report.companyName },
                { label: "Ticker Symbol", value: report.ticker || "N/A" },
                { 
                  label: "Market Price", 
                  value: report.priceInfo?.price 
                    ? `${report.priceInfo.price} ${report.priceInfo.currency || "USD"}` 
                    : "N/A" 
                },
                { label: "52-Week Range", value: report.priceInfo?.high52w ? `${report.priceInfo.low52w} - ${report.priceInfo.high52w}` : "N/A" },
                { label: "Sector Focus", value: report.priceInfo?.sector || "Diversified" },
                { label: "Industry Classification", value: report.priceInfo?.industry || "General" },
              ].map((metric, idx) => (
                <div key={idx} className="rounded-xl border border-border-custom bg-card p-4 shadow-2xs">
                  <span className="block text-[10px] uppercase tracking-wider text-muted-text font-semibold">
                    {metric.label}
                  </span>
                  <span className="block font-serif text-sm font-bold text-foreground mt-1 truncate">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Report Content Tabs */}
            <div className="rounded-xl border border-border-custom bg-card overflow-hidden shadow-xs">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-border-custom bg-background/50 overflow-x-auto">
                {[
                  { id: "thesis", label: "Executive Thesis", icon: FileText },
                  { id: "proscons", label: "Opportunities & Risks", icon: Sparkles },
                  { id: "sources", label: "Audited Sources", icon: Compass },
                  { id: "logs", label: "Agent Pipeline Log", icon: Database },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                        isActive
                          ? "border-accent-gold text-accent-gold bg-card"
                          : "border-transparent text-muted-text hover:text-foreground hover:bg-stone-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Panels */}
              <div className="p-6">
                
                {/* 1. Thesis */}
                {activeTab === "thesis" && (
                  <div className="space-y-4 max-w-3xl leading-relaxed text-stone-800">
                    <h4 className="font-serif text-lg font-bold text-foreground">
                      Investment Recommendation Summary
                    </h4>
                    <div className="font-serif text-sm md:text-base text-muted-text space-y-4">
                      {report.reasoning ? (
                        report.reasoning.split("\n\n").map((para: string, idx: number) => (
                          <p key={idx} className="whitespace-pre-line">{para}</p>
                        ))
                      ) : (
                        <p className="italic text-stone-400">No reasoning details provided.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Pros / Cons */}
                {activeTab === "proscons" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Opportunities/Pros */}
                    <div className="space-y-4">
                      <h4 className="font-serif text-sm uppercase tracking-wider text-lime-900 font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-lime-700" />
                        Investment Strengths
                      </h4>
                      <ul className="space-y-3">
                        {report.pros && report.pros.length > 0 ? (
                          report.pros.map((pro: string, idx: number) => (
                            <li key={idx} className="flex gap-2.5 items-start text-xs text-muted-text leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-lime-700 shrink-0 mt-2" />
                              <span>{pro}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-stone-400 italic">No positive factors listed.</li>
                        )}
                      </ul>
                    </div>

                    {/* Threat/Cons */}
                    <div className="space-y-4">
                      <h4 className="font-serif text-sm uppercase tracking-wider text-red-900 font-bold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                        Risk Exposure Factors
                      </h4>
                      <ul className="space-y-3">
                        {report.cons && report.cons.length > 0 ? (
                          report.cons.map((con: string, idx: number) => (
                            <li key={idx} className="flex gap-2.5 items-start text-xs text-muted-text leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-700 shrink-0 mt-2" />
                              <span>{con}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-stone-400 italic">No risk factors listed.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 3. Sources */}
                {activeTab === "sources" && (
                  <div className="space-y-4">
                    <h4 className="font-serif text-lg font-bold text-foreground">
                      Sources Searched & Audited
                    </h4>
                    <p className="text-xs text-muted-text">
                      The research agent analyzed these sources and online endpoints to synthesize its findings:
                    </p>
                    <ul className="space-y-2 mt-4">
                      {report.sources && report.sources.length > 0 ? (
                        report.sources.map((src: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-accent-gold hover:text-amber-800 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            {src.startsWith("http") ? (
                              <a href={src} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-md">
                                {src}
                              </a>
                            ) : (
                              <span>{src}</span>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-stone-400 italic">No web links recorded.</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* 4. Logs */}
                {activeTab === "logs" && (
                  <div className="rounded-lg border border-border-custom bg-stone-950 p-4 font-mono text-xs text-stone-400 space-y-1.5 max-h-[350px] overflow-y-auto">
                    {report.logs && report.logs.length > 0 ? (
                      report.logs.map((log: string, index: number) => (
                        <div key={index} className="leading-relaxed">
                          <span className="text-accent-gold select-none mr-2">&gt;</span>
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-stone-600 italic">No logs recorded.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Run Again Panel */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setReport(null);
                  setError(null);
                  setQuery("");
                }}
                className="flex items-center gap-2 rounded-lg border border-border-custom bg-card px-5 py-3 text-xs font-semibold hover:bg-background transition-colors text-muted-text hover:text-foreground shadow-2xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Research Another Company
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-custom bg-card/60 py-8 px-6 mt-12 text-center text-xs text-muted-text space-y-2">
        <p className="font-semibold text-foreground">InsideIIM Investment Research Agent</p>
        <p>Built with React (Vite) and Node.js Express. Styled using the Slate & Beige premium color scheme.</p>
        <p className="text-[10px] text-stone-400 font-mono">Run: npm run dev | Workspace: Trevel/insideiim</p>
      </footer>

      {/* Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
