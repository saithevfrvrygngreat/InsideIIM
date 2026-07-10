import React, { useState, useEffect } from "react";
import { X, Key, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export default function SettingsModal({ isOpen, onClose }) {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [tavilyKey, setTavilyKey] = useState("");
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showTavily, setShowTavily] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("gemini_api_key") || "");
      setOpenaiKey(localStorage.getItem("openai_api_key") || "");
      setTavilyKey(localStorage.getItem("tavily_api_key") || "");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", geminiKey);
      localStorage.setItem("openai_api_key", openaiKey);
      localStorage.setItem("tavily_api_key", tavilyKey);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    }
  };

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gemini_api_key");
      localStorage.removeItem("openai_api_key");
      localStorage.removeItem("tavily_api_key");
      setGeminiKey("");
      setOpenaiKey("");
      setTavilyKey("");
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl border border-border-custom bg-card p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-custom pb-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent-gold" />
            <h3 className="font-serif text-xl font-semibold text-foreground">API Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-text hover:bg-background hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <p className="text-xs text-muted-text">
            Provide your own API keys below. They are saved <strong>locally in your browser</strong> and sent only to the research endpoint to complete the LLM and search calls.
          </p>

          <div className="space-y-3">
            {/* Gemini API Key */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex justify-between">
                <span>Gemini API Key</span>
                <span className="text-[10px] font-normal text-muted-text">(Recommended)</span>
              </label>
              <div className="relative flex rounded-lg border border-border-custom bg-background">
                <input
                  type={showGemini ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-transparent px-3 py-2 text-sm outline-hidden placeholder:text-stone-300"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="px-3 text-muted-text hover:text-foreground transition-colors"
                >
                  {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">OpenAI API Key (Alternative)</label>
              <div className="relative flex rounded-lg border border-border-custom bg-background">
                <input
                  type={showOpenai ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-transparent px-3 py-2 text-sm outline-hidden placeholder:text-stone-300"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="px-3 text-muted-text hover:text-foreground transition-colors"
                >
                  {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Tavily API Key */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex justify-between">
                <span>Tavily API Key</span>
                <span className="text-[10px] font-normal text-muted-text">(For live web search)</span>
              </label>
              <div className="relative flex rounded-lg border border-border-custom bg-background">
                <input
                  type={showTavily ? "text" : "password"}
                  value={tavilyKey}
                  onChange={(e) => setTavilyKey(e.target.value)}
                  placeholder="tvly-..."
                  className="w-full bg-transparent px-3 py-2 text-sm outline-hidden placeholder:text-stone-300"
                />
                <button
                  type="button"
                  onClick={() => setShowTavily(!showTavily)}
                  className="px-3 text-muted-text hover:text-foreground transition-colors"
                >
                  {showTavily ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-accent-gold-light/40 border border-accent-gold/10 p-3 flex gap-2 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-accent-gold" />
            <div>
              If no API keys are provided, the system runs in <strong>Demo Simulation Mode</strong> (performing Mock research to showcase the dashboard interface and agent steps).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border-custom pt-4">
          <button
            onClick={handleClear}
            className="text-xs text-red-700 hover:text-red-950 font-medium transition-colors"
          >
            Clear Stored Keys
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border-custom px-4 py-2 text-xs font-medium hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-accent-gold px-4 py-2 text-xs font-medium text-white hover:bg-amber-800 transition-colors shadow-sm"
            >
              {isSaved ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Saved!
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
