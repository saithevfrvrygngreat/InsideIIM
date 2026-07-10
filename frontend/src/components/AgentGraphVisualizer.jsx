import React from "react";
import { Search, BarChart3, Newspaper, AlertTriangle, Lightbulb, Check } from "lucide-react";

const steps = [
  {
    id: "ticker",
    name: "Ticker Resolver",
    description: "Resolves name to ticker symbol and pulls stock chart metadata",
    icon: Search,
  },
  {
    id: "financials",
    name: "Financial Analyzer",
    description: "Evaluates revenue growth, margins, debt, and valuations",
    icon: BarChart3,
  },
  {
    id: "sentiment",
    name: "Market Sentiment",
    description: "Scrapes news and analyst reports to determine market mood",
    icon: Newspaper,
  },
  {
    id: "risks",
    name: "Risk Profiler",
    description: "Analyzes competition, industry headwinds, and regulatory risks",
    icon: AlertTriangle,
  },
  {
    id: "thesis",
    name: "Thesis Synthesizer",
    description: "Weighs pros/cons, scores stock, and decides Invest vs Pass",
    icon: Lightbulb,
  },
];

export default function AgentGraphVisualizer({
  currentStepId,
  completedStepIds = [],
}) {
  return (
    <div className="rounded-xl border border-border-custom bg-card p-6 shadow-xs">
      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
        Agent Workflow Architecture
      </h3>
      <p className="text-xs text-muted-text mb-8">
        Visualizing the LangGraph node execution path and pipeline states.
      </p>

      <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-4 w-full">
        {/* SVG Connector lines for Desktop */}
        <div className="hidden md:block absolute top-7 left-8 right-8 h-[2px] bg-stone-200 z-0">
          <div
            className="h-full bg-accent-gold transition-all duration-500"
            style={{
              width: `${
                completedStepIds.length === steps.length
                  ? 100
                  : Math.max(0, (completedStepIds.length / (steps.length - 1)) * 100)
              }%`,
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = completedStepIds.includes(step.id);
          const isActive = currentStepId === step.id;

          let statusClass = "bg-stone-100 text-stone-400 border-stone-200";
          
          if (isCompleted) {
            statusClass = "bg-stone-900 text-white border-stone-950";
          } else if (isActive) {
            statusClass = "bg-accent-gold-light border-accent-gold text-accent-gold animate-pulse shadow-md";
          }

          return (
            <div
              key={step.id}
              className="flex flex-row md:flex-col items-center md:text-center z-10 w-full md:w-1/5 gap-4 md:gap-2 relative"
            >
              {/* Connector line for mobile (vertical) */}
              {idx < steps.length - 1 && (
                <div className="md:hidden absolute left-7 top-14 bottom-[-16px] w-[2px] bg-stone-200">
                  <div
                    className={`w-full h-full transition-all duration-300 ${
                      isCompleted ? "bg-accent-gold" : "bg-stone-200"
                    }`}
                  />
                </div>
              )}

              {/* Node Icon */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${statusClass}`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Node Info */}
              <div className="flex flex-col md:items-center">
                <span className="text-sm font-semibold text-foreground">
                  {step.name}
                </span>
                <span className="text-[10px] text-muted-text mt-0.5 leading-normal max-w-[140px] md:mx-auto">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
