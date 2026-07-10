# InsideIIM AI Investment Research Agent

An intelligent, multi-agent AI investment research assistant that evaluates company investment potential. Built with **Next.js**, **LangChain.js**, and **LangGraph.js**, it automates financial due diligence, scrapes market sentiment, assesses macroeconomic risks, and makes structured **INVEST** or **PASS** recommendations.

The entire interface features a premium, publication-grade warm off-white/beige and charcoal/black styling system designed to look clean, readable, and highly professional, with zero distracting radium/neon colors.

---

## Overview

This application acts as an AI-powered venture partner and equity research analyst. 
Given a company name or brand (e.g., "Apple" or "NVIDIA"), the agent:
1. **Resolves the Ticker Symbol** and pulls current trading prices and market caps.
2. **Collects Financial Performance Metrics** (revenue growth, margins, balance sheets).
3. **Scrapes Recent News** and analyst upgrades/downgrades to check public sentiment.
4. **Builds a Risk Profile** checking competitor threats, regulatory issues, and interest rate exposure.
5. **Synthesizes an Investment Thesis** assigning a score (1-100) and a final INVEST or PASS verdict.

---

## How to Run It

### 1. Prerequisites
- **Node.js**: Version 18+ (tested on Node v24.12.0)
- **API Keys** (Optional but recommended):
  - **Gemini API Key**: For the Google Gemini LLM reasoning model (or **OpenAI API Key**).
  - **Tavily API Key**: For web search and news scraping.

### 2. Setup and Execution
1. Unzip the project folder.
2. Open your terminal in the `insideiim` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Choose how you want to run the project (both React frontend and Node.js backend are covered):
   
   * **Option A: Unified Next.js Mode** (Frontend React + Backend Node.js APIs in a single process):
     ```bash
     npm run dev
     ```
     This starts the app at `http://localhost:3000`. The frontend will automatically route requests to the integrated Node.js endpoints.

   * **Option B: Standalone Node.js Express Server Mode** (Separate frontend process and Express backend process):
     - In one terminal, start the standalone Node.js Express server on port 3001:
       ```bash
       npm run server
       ```
     - In another terminal, start the React dev server:
       ```bash
       npm run dev
       ```
     The frontend UI is built to automatically detect if the Express server is running on port 3001. If active, it directs all AI pipeline streams to the Express server; if not, it seamlessly falls back to the integrated Next.js API routes.

### 3. API Keys Configuration
You can supply keys in two ways:
- **UI Settings Panel (Fastest)**: Click the **"Configure Keys"** button in the top-right corner of the dashboard. Enter your Gemini/OpenAI or Tavily keys. They will be saved securely inside your browser's local storage and sent via API headers on requests.
- **Environment Variables**: Create a `.env.local` file in the root of the project:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   TAVILY_API_KEY=your_tavily_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

*Note: If no API keys are configured, the agent runs in **Demo Simulation Mode**, performing simulated research workflows to showcase the application capabilities and dashboards.*

---

## How It Works: Approach and Architecture

### 1. LangGraph State Machine
We use **LangGraph.js** to manage the agent flow. Financial research requires structured steps to verify details sequentially. Unlike simple conversational loops, the research flow runs as an acyclic graph of nodes:

```
[Start]
   │
   ▼
[Ticker Resolver] ──► [Financial Analyzer] ──► [Market Sentiment]
                                                     │
   ┌─────────────────────────────────────────────────┘
   ▼
[Risk Profiler] ──► [Thesis Synthesizer] ──► [End]
```

- **Ticker Resolver**: Queries Yahoo Finance Search API to find the stock ticker, then fetches real-time quote metadata (price, exchange, 52-week highs/lows).
- **Financial Analyzer**: Gathers balance sheet health and income statement variables.
- **Market Sentiment**: Performs web queries regarding news reports, analyst upgrades/downgrades.
- **Risk Profiler**: Scrapes specific threat variables (competitor moats, lawsuit liabilities, interest rates).
- **Thesis Synthesizer**: Uses LLM formatting logic to evaluate strengths and risks, calculating an weighted index score and rendering the final INVEST / PASS decision.

### 2. Server-Sent Events (SSE) Streaming
To provide a smooth, responsive experience, the Next.js API route (`app/api/research/route.ts`) compiles and streams the LangGraph steps to the client. As the agent transitions from node to node, it sends down:
- Live terminal execution logs.
- Intermediate resolved states (e.g. ticker price, resolved company name).
The frontend parses these chunks and displays a dynamic stepper and real-time scrollable log console.

---

## Key Decisions & Trade-Offs

- **Deterministic Pipeline vs. Free Autonomous Agent**: We chose a structured LangGraph state machine. While autonomous agents can search arbitrarily, structured graphs ensure that *every single report* completes key phases (Financial, Sentiment, and Risk checks) before forming a conclusion, matching professional equity research standards.
- **Client-Side Key Management**: We chose to let the user save keys in `localStorage` in the browser. This allows the application to be deployed on static cloud services (like Vercel) and tested immediately by reviewers without forcing them to configure server settings.
- **Multi-Search Architecture (Tavily & DuckDuckGo Fallbacks)**: If the user lacks a paid Tavily API search subscription, the agent automatically falls back to a custom scraping helper for DuckDuckGo and Yahoo Finance charts, ensuring the research remains updated and functional for free.

---

## Example Runs (Pre-Loaded in Demo Mode)

- **NVIDIA (NVDA)**: **INVEST** (Score: 92/100)
  - *Thesis*: Absolute dominance in the AI hardware value chain (85%+ market share) combined with exceptional triple-digit revenue growth and CUDA ecosystem lock-in. Muted risk from competition, high valuation multiple but offset by margins.
- **Apple Inc. (AAPL)**: **INVEST** (Score: 88/100)
  - *Thesis*: Strong consumer ecosystem lock-in (2.2B active devices) and massive cash flow generation. High margin Services growth offsets plateauing hardware volumes. 
- **Tesla Inc. (TSLA)**: **PASS** (Score: 45/100)
  - *Thesis*: Margin compression from EV price wars and rising Chinese competition makes it high risk. While long-term autonomous driving potential is significant, current valuation assumes perfect execution on unmonetized technology.

---

## What We Would Improve with More Time

1. **Direct EDGAR/SEC 10-K Scraper**: Implement PDF document analysis to read quarterly 10-Q and 10-K filings directly from the SEC SEC.gov index to verify accounting notes.
2. **Bull vs. Bear Agent Debates**: Configure two separate sub-agents—one presenting the bull case, the other the bear case—debating in a conversational graph loop before compiling the thesis.
3. **Advanced Quantitative Valuations**: Build a node that automatically runs DCF (Discounted Cash Flow) and comparable multiples analysis using raw balance sheet fields.
4. **Data Visualization**: Integrate Chart.js/Recharts to draw historic stock performance and balance sheet trend visuals inside the dashboard cards.
