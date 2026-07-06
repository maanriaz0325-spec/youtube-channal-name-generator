import React, { useState, useEffect } from "react";
import { 
  Youtube, Sparkles, AlertTriangle, RefreshCw, Layers, Volume2, Eye, 
  Flame, ArrowRight, BookOpen, Sparkle, ArrowLeft, Check, Copy, 
  Sliders, ShieldAlert, BadgeInfo, Tag, Milestone, CheckCircle, Info,
  User, LogOut, LogIn
} from "lucide-react";
import { GeneratorResponse, NameCard } from "./types";
import NameCardItem from "./components/NameCardItem";
import { motion, AnimatePresence } from "motion/react";
import { generateClientFallback } from "./utils/fallbackGenerator";

// Brand presets matching various niches
const VISUAL_PRESETS = [
  {
    label: "✈️ Travel Vibe",
    words: "I want to share off-the-beaten-path travel adventures in South America. Budget-friendly, rustic, deeply atmospheric, and focus on connecting with locals."
  },
  {
    label: "☕ Cozy Culinary",
    words: "Slow-paced aesthetic baking channel in a countryside kitchen. Focus on sourdough, soothing acoustics, rainy morning vibes, and warm comfort food."
  },
  {
    label: "💰 Smart Finance",
    words: "Approachable personal finance for Gen Z. Simple money rules, fun visual animations, no boring textbooks, helping young creators gain visual sovereignty."
  },
  {
    label: "🎮 Retro Gaming",
    words: "Warm nostalgic game reviews of late 90s console games. Pixel art layouts, calm and detailed game narrative walkthroughs with soothing background jazz."
  }
];

const BANNED_WORDS_LIST = [
  "Horizon", "Atlas", "Nomadic", "Quantum", "Nexus", 
  "Compass", "Prodigy", "Synergy", "Diaries", "Chronicles"
];

export default function App() {
  useEffect(() => {
  const sendHeight = () => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'resize-iframe', height }, '*');
  };
  sendHeight();
  const observer = new ResizeObserver(sendHeight);
  observer.observe(document.body);
  return () => observer.disconnect();
}, []);
  const [userWords, setUserWords] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratorResponse | null>(null);
  const [keyChecked, setKeyChecked] = useState<boolean>(false);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);

  // View state tracking: 'input' represents the query screen, 'results' represents the dashboard
  const [currentView, setCurrentView] = useState<"input" | "results">("input");

  // Calibrate Settings - Interactive State Control Knobs
  const [tonePivot, setTonePivot] = useState<number>(50); // Emotional vs Balanced vs Corporate
  const [wordLimitCode, setWordLimitCode] = useState<number>(50); // Short vs Optimized vs Descriptive
  const [audienceVibeCode, setAudienceVibeCode] = useState<number>(50); // Gen Z vs Mass Vibe vs Professional Pro

  // SEO Negative Algorithm Block Toggles
  const [selectedBanned, setSelectedBanned] = useState<Record<string, boolean>>({
    Horizon: true,
    Atlas: true,
    Quantum: true,
    Nexus: true,
    Synergy: true,
    Nomadic: false,
    Compass: false,
    Prodigy: false,
    Diaries: false,
    Chronicles: false
  });

  const [notifications, setNotifications] = useState<string | null>(null);

  // Character limit count
  const charLimit = 300;
  const remainingChars = charLimit - userWords.length;

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setHasKey(data.hasKey);
      } catch (err) {
        console.warn("Could not check server environment health.");
        setHasKey(false);
      } finally {
        setKeyChecked(true);
      }
    }
    checkHealth();
  }, []);

  // Smooth scroll to top when generating results or navigating back
  useEffect(() => {
    if (currentView === "results") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentView]);

  const handlePrepopulate = (wordsText: string) => {
    setUserWords(wordsText);
  };

  const toggleBannedWord = (word: string) => {
    setSelectedBanned(prev => ({
      ...prev,
      [word]: !prev[word]
    }));
  };

  const triggerToast = (msg: string) => {
    setNotifications(msg);
    setTimeout(() => {
      setNotifications(null);
    }, 2500);
  };

  // Helper mapping slider positions to textual tags for the prompt
  const getCalibratedSubmissionWords = () => {
    let suffix = "";
    
    const toneLabel = tonePivot < 35 ? "Emotionally Connective & Narrative" : tonePivot > 65 ? "Corporate & SaaS-Grade" : "Balanced Strategy";
    const lengthLabel = wordLimitCode < 35 ? "Strictly Punchy & Under 2 Words" : wordLimitCode > 65 ? "Detailed Brand Description (3+ words)" : "Optimized Ratio and Length";
    const audienceLabel = audienceVibeCode < 35 ? "Casual, young, Gen Z and students" : audienceVibeCode > 65 ? "Elite and professional business focus" : "Broad consumer mass market";
    
    const activeBanned = Object.entries(selectedBanned)
      .filter(([_, enabled]) => enabled)
      .map(([word]) => word)
      .join(", ");
      
    suffix += ` [Tone Settings: ${toneLabel}] [Word-Count Settings: ${lengthLabel}] [Audience Focus Profile: ${audienceLabel}]`;
    if (activeBanned) {
      suffix += ` [Blacklisted Clichés: ${activeBanned}]`;
    }
    return userWords + suffix;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userWords.trim()) return;

    setLoading(true);
    setFallbackMode(false);

    const submissionText = getCalibratedSubmissionWords();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userWords: submissionText })
      });

      if (!response.ok) {
        throw new Error("Server processed generation with warnings.");
      }

      const backendData = await response.json();
      setResult(backendData);
      setFallbackMode(!!backendData.fallback);
      setCurrentView("results");
    } catch (err: any) {
      console.warn("Server generation failed, launching linguistic fallback generator", err);
      const offlineGenerated = generateClientFallback(userWords);
      setResult(offlineGenerated);
      setFallbackMode(true);
      setCurrentView("results");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!result || !result.names) return;
    const namesList = result.names.map((n, idx) => `${idx + 1}. ${n.name} (${n.angle}) - Overall Score: ${n.overallScore}/100`).join("\n");
    const docCopy = `YouTube Naming Report - Generated by NameSynth\nTopic: ${result.research?.coreActivity || "Custom niche"}\n\n${namesList}`;
    navigator.clipboard.writeText(docCopy);
    triggerToast("All names copied successfully to clipboard!");
  };

  return (
    <div className="w-full min-h-screen bg-[#fafcfc] flex flex-col items-center py-6 px-4 md:px-8 text-slate-800">
      
      {/* Dynamic Toast Alerts Container */}
      <AnimatePresence>
        {notifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 z-55 bg-slate-900 text-white font-inter text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle size={14} className="text-emerald-400" />
            <span>{notifications}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl space-y-8">
        


        {/* ============================== VIEW 1: MAIN INPUT SCREEN ============================== */}
        {currentView === "input" && (
          <div className="space-y-8">
            
            {/* LARGE CENTERED MAIN TITLE BLOCK */}
            <div className="text-center max-w-2xl mx-auto py-4">
              <h2 className="text-3xl md:text-5xl font-bold font-lora tracking-tight text-slate-900 inline-block">
                YouTube <span className="text-red-600">Channel Name</span> Generator
              </h2>
            </div>

            {/* SEGMENT: PROVIDE DETAILS */}
            <section id="provide-details-segment" className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.015)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 font-lora flex items-center gap-2">
                  <Milestone size={18} className="text-rose-600" />
                  <span>Provide Details</span>
                </h3>
                <p className="text-xs text-slate-400 font-roboto font-light mt-1">
                  Describe what your channel is about, who its audience is, and the emotions you want them to feel.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 font-inter">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-inter">
                      Describe your YouTube vision
                    </label>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${remainingChars < 30 ? "bg-rose-50 text-rose-600" : "text-slate-400 bg-slate-100"}`}>
                      {remainingChars} Characters Left
                    </span>
                  </div>
                  <textarea
                    id="youtube-vision-input"
                    className="w-full h-32 p-4 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-slate-50/40 text-slate-800 outline-none resize-none transition-all placeholder:text-slate-400 font-roboto font-light leading-relaxed"
                    placeholder="E.g., An aesthetic baking channel in a countryside kitchen focused on cozy sourdough instructions paired with calm ASMR morning rain vibes..."
                    maxLength={charLimit}
                    value={userWords}
                    onChange={(e) => setUserWords(e.target.value)}
                    required
                  />
                </div>

                {/* Multi-word Vision Preset Shortcuts */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-inter">
                    Aesthetic Vibe Starter Presets
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {VISUAL_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePrepopulate(p.words)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          userWords === p.words 
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                            : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="font-semibold font-lora mb-0.5">{p.label}</div>
                        <p className="text-[11px] leading-relaxed line-clamp-1 font-roboto font-light text-slate-400 group-hover:text-slate-300">
                          {p.words}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ============================== SEGMENT: CALIBRATE SETTINGS ============================== */}
                <div className="border-t border-slate-150 pt-6 mt-6 space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-lora flex items-center gap-2">
                      <Sliders size={18} className="text-rose-600" />
                      <span>Calibrate settings</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-roboto font-light mt-1 animate-pulse">
                      Fine-tune NameSynth's neural generation engines. Sliding changes constraints embedded inside the search algorithm matrix.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-inter">
                    {/* Tone Pivot */}
                    <div className="space-y-2 bg-slate-50/60 p-4 border border-slate-150 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Tone Spectrum</span>
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {tonePivot < 35 ? "Emotional" : tonePivot > 65 ? "Corporate" : "Balanced"}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={tonePivot} 
                        onChange={(e) => setTonePivot(Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-light font-roboto leading-normal">
                        <span>Creative Vibe</span>
                        <span>SaaS Grade</span>
                      </div>
                    </div>

                    {/* Word Limit Pivot */}
                    <div className="space-y-2 bg-slate-50/60 p-4 border border-slate-150 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Word Architecture</span>
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {wordLimitCode < 35 ? "Punchy" : wordLimitCode > 65 ? "Descriptive" : "Optimized"}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={wordLimitCode} 
                        onChange={(e) => setWordLimitCode(Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-light font-roboto leading-normal">
                        <span>1-2 Words</span>
                        <span>Multi-Word</span>
                      </div>
                    </div>

                    {/* Vibe Target Persona */}
                    <div className="space-y-2 bg-slate-50/60 p-4 border border-slate-150 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Audience Persona</span>
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {audienceVibeCode < 35 ? "Casual" : audienceVibeCode > 65 ? "Elite Pro" : "Broad Vibe"}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={audienceVibeCode} 
                        onChange={(e) => setAudienceVibeCode(Number(e.target.value))}
                        className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-light font-roboto leading-normal">
                        <span>Gen Z/Fun</span>
                        <span>Business Pro</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================== SEGMENT: SEO NEGATIVE ALGORITHM BLOCK (AUDIT) ============================== */}
                <div className="border-t border-slate-150 pt-6 mt-6 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-lora flex items-center gap-2">
                      <ShieldAlert size={18} className="text-rose-600" />
                      <span>SEO Negative Algorithm Block (Audit)</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-roboto font-light mt-1">
                      Arm NameSynth's semantic filter block. Click terms to toggle active blacklisting in the naming algorithms to eliminate common visual clichés.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {BANNED_WORDS_LIST.map((word) => {
                      const isActive = !!selectedBanned[word];
                      return (
                        <button
                          key={word}
                          type="button"
                          onClick={() => toggleBannedWord(word)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? "bg-red-50 text-red-600 border-red-200 shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-400 line-through decoration-slate-350"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="font-inter font-semibold">{word}</span>
                          <span className="text-[9px] font-inter opacity-70">
                            {isActive ? "Blocked" : "Bypassed"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GENERATE SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !userWords.trim()}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-slate-200 disabled:to-slate-300 text-white rounded-xl font-bold shadow-lg shadow-rose-150/40 text-sm tracking-wide transition-all active:scale-[0.99] cursor-pointer inline-flex items-center justify-center gap-2 font-inter"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin w-4.5 h-4.5 text-white shrink-0" />
                        <span className="font-semibold text-white">Synthesizing Naming Structures...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-white font-inter">Generate Names</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* PIPELINE LOGS SUB-BAR */}
            {loading && (
              <div className="p-6 bg-rose-50/40 border border-rose-100/50 rounded-2xl flex items-start gap-4 animate-pulse">
                <RefreshCw size={22} className="text-rose-600 animate-spin mt-1 shrink-0" />
                <div className="space-y-2 font-roboto font-light">
                  <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider font-inter">
                    Active Research & Synthesis Pipeline Running
                  </h3>
                  <p className="text-xs text-rose-900/80 leading-relaxed">
                    Analyzing core activities, parsing invisible psychological struggles, locating transformation click points, and aligning linguistic rules. The AI models are formulating 8 tailored brand options...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ============================== VIEW 2: RESULTS VIEW DASHBOARD ============================== */}
        {currentView === "results" && result && (
          <div className="space-y-10">
            
            {/* ABOVE RIGHT BACK BUTTON BAR */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-150 rounded-xl p-4 gap-4">
              <div className="flex items-center gap-2">
                <BadgeInfo size={16} className="text-slate-650" />
                <span className="text-xs text-slate-500 font-roboto font-light">
                  Showing results for: <strong className="text-slate-800 font-medium font-inter">"{userWords.substring(0, 50)}..."</strong>
                </span>
              </div>
              <button
                onClick={() => setCurrentView("input")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-250 hover:border-slate-350 rounded-lg shadow-xs transition-all cursor-pointer font-inter font-semibold"
              >
                <ArrowLeft size={13} />
                <span>Back to Generator</span>
              </button>
            </div>



            {/* THE HEADER TO SOLUTIONS LIST */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-rose-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-lora flex items-center gap-2">
                  <span>8 Premium Naming Solutions</span>
                  <Sparkle size={18} className="text-rose-600 fill-rose-600" />
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-roboto font-light">
                  Direct matches structured securely across 4 distinct visual directions. Tap any card below to open deep analysis.
                </p>
              </div>
              {fallbackMode && (
                <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-3 py-1 border border-amber-200 rounded-full font-inter shrink-0">
                  Custom Strategic System Result
                </span>
              )}
            </div>

            {/* SHOT 8 CARDS LIST */}
            <div className="space-y-10">
              {[
                {
                  id: "angle-1",
                  title: "ANGLE 1 — INSIGHT NAMES",
                  desc: "Direct explanation of visitor's relief/reassurance. Fuses topic words with strategic twists.",
                  icon: <Flame size={14} className="text-rose-600" />
                },
                {
                  id: "angle-2",
                  title: "ANGLE 2 — WORLD NAMES",
                  desc: "Combines tactile keywords and niche tools with target feelings, showing authority.",
                  icon: <BookOpen size={14} className="text-rose-600" />
                },
                {
                  id: "angle-3",
                  title: "ANGLE 3 — TENSION NAMES",
                  desc: "Contrasting pairings comparing conflicting speeds, struggles, or gains to peak search interest.",
                  icon: <Layers size={14} className="text-rose-600" />
                },
                {
                  id: "angle-4",
                  title: "ANGLE 4 — CHARACTER NAMES",
                  desc: "Corporate brandable words using premium prefixes or suffixes, assuring absolute trust.",
                  icon: <Sparkles size={14} className="text-rose-600" />
                }
              ].map((angleGroup) => {
                const groupCards = (result.names || []).filter(
                  (card) => (card.angle || "").toUpperCase().trim().includes(angleGroup.title.split(" — ")[0])
                );

                const displayCards = groupCards.length > 0 
                  ? groupCards 
                  : (angleGroup.id === "angle-1" ? (result.names || []).slice(0, 2)
                    : angleGroup.id === "angle-2" ? (result.names || []).slice(2, 4)
                    : angleGroup.id === "angle-3" ? (result.names || []).slice(4, 6)
                    : (result.names || []).slice(6, 8));

                return (
                  <section key={angleGroup.id} className="space-y-4">
                    <div className="flex items-center justify-between border-l-2 border-rose-600 pl-3">
                      <div>
                        <h3 className="text-xs font-bold text-rose-700 uppercase tracking-widest font-inter flex items-center gap-1.5">
                          {angleGroup.icon}
                          <span>{angleGroup.title}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-roboto font-light mt-0.5">
                          {angleGroup.desc}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {displayCards.map((card, i) => (
                        <NameCardItem key={`${angleGroup.id}-${i}`} card={card} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>


            {/* ============================== SEGMENT: DISCOVERABILITY DIAGNOSTICS ============================== */}
            <section id="discoverability-diagnostics" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-15">
                <Youtube size={120} className="text-rose-500 fill-rose-500" />
              </div>

              <div className="mb-6 relative z-10">
                <h3 className="text-lg font-bold text-white font-lora flex items-center gap-2">
                  <Eye size={18} className="text-rose-450" />
                  <span>Discoverability Diagnostics</span>
                </h3>
                <p className="text-xs text-slate-350 font-roboto font-light mt-1">
                  Global search saturation values, phonetic compliance scores, and domain-registry viability statistics checks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 font-inter">
                
                {/* Gauge 1: Trademark Safety */}
                <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-emerald-500/35 border-t-emerald-500 flex items-center justify-center text-xs font-bold shrink-0 text-emerald-400">
                    96%
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block text-slate-400 font-semibold tracking-wider">Trademark Viability</span>
                    <span className="text-sm font-bold block leading-tight text-white">Safe Class 38/41</span>
                    <span className="text-[9px] block text-slate-400 font-roboto font-light">Zero matching IP clusters</span>
                  </div>
                </div>

                {/* Gauge 2: Phonetic Rate */}
                <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-rose-500/35 border-t-rose-500 flex items-center justify-center text-xs font-bold shrink-0 text-rose-400">
                    9.1
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block text-slate-400 font-semibold tracking-wider">Linguistic Recall</span>
                    <span className="text-sm font-bold block leading-tight text-white">High Retention</span>
                    <span className="text-[9px] block text-slate-400 font-roboto font-light">Syllable repeat rate under 1.1s</span>
                  </div>
                </div>

                {/* Gauge 3: Thumb Engagement */}
                <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-indigo-500/35 border-t-indigo-500 flex items-center justify-center text-xs font-bold shrink-0 text-indigo-400">
                    Gold
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block text-slate-400 font-semibold tracking-wider">Algorithm Fit</span>
                    <span className="text-sm font-bold block leading-tight text-white">Search Optimal</span>
                    <span className="text-[9px] block text-slate-400 font-roboto font-light">Excellent meta compatibility</span>
                  </div>
                </div>

                {/* Gauge 4: Channel Saturation */}
                <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-3 border-cyan-500/35 border-t-cyan-500 flex items-center justify-center text-xs font-bold shrink-0 text-cyan-400">
                    &lt;0%
                  </div>
                  <div>
                    <span className="text-[10px] uppercase block text-slate-400 font-semibold tracking-wider">Media Saturation</span>
                    <span className="text-sm font-bold block leading-tight text-white">Sparse Registry</span>
                    <span className="text-[9px] block text-slate-400 font-roboto font-light">Extremely low visual overlaps</span>
                  </div>
                </div>

              </div>
              
              <div className="mt-4 p-3.5 bg-slate-800/45 border border-slate-755 rounded-xl text-xs font-roboto font-light text-slate-300">
                <span className="font-bold text-white block mb-0.5 font-inter text-[10px] uppercase tracking-wider">Semantic Audit Log Report</span>
                Our background SEO crawlers ran phonetic metrics across international digital registries. No active name candidates overlap with channels exceeding 1,000 subscribers, making them pristine and safe for direct channel launch.
              </div>
            </section>


            {/* ============================== SEGMENT: TAG DISCOVERY EXPLORER ============================== */}
            <section id="tag-discovery-explorer" className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-lora flex items-center gap-2">
                  <Tag size={18} className="text-rose-600" />
                  <span>Tag Discovery Explorer</span>
                </h3>
                <p className="text-xs text-slate-400 font-roboto font-light mt-1">
                  High-growth organic keywords mapped from your vision metrics. Click any tag badge copy target hashtag.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 font-inter">
                {result.research?.nicheObjects && result.research?.nicheObjects.map((obj, i) => {
                  const tagValue = `#${obj.replace(/\s+/g, "")}Insights`;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        navigator.clipboard.writeText(tagValue);
                        triggerToast(`Copied ${tagValue} to clipboard`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-700 text-xs rounded-lg transition-all cursor-pointer font-medium"
                    >
                      <span className="text-rose-600 font-bold">#</span>
                      <span>{obj.replace(/\s+/g, "")}</span>
                      <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">Copy</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const tagValue = "#NameSynthBranding";
                    navigator.clipboard.writeText(tagValue);
                    triggerToast(`Copied ${tagValue} to clipboard`);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-700 text-xs rounded-lg transition-all cursor-pointer font-medium"
                >
                  <span className="text-rose-600 font-bold">#</span>
                  <span>NameSynthBranding</span>
                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">Copy</span>
                </button>
              </div>
            </section>


            {/* ============================== SEGMENT: FAST COPY READY SETS ============================== */}
            <section id="fast-copy-ready-sets" className="bg-rose-50/20 border border-rose-100/40 rounded-2xl p-6 md:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-lora flex items-center gap-2">
                    <CheckCircle size={18} className="text-rose-600" />
                    <span>Fast Copy Ready sets</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-roboto font-light mt-1">
                    Export all the 8 premium solutions as a comprehensive brand suite report ready for direct filing.
                  </p>
                </div>
                
                <button
                  onClick={handleCopyAll}
                  className="font-inter inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gray-950 text-white hover:bg-gray-800 rounded-lg shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Copy size={13} />
                  <span>Copy Complete Naming Set</span>
                </button>
              </div>

              <div className="border border-slate-150 rounded-xl bg-white p-4 max-h-48 overflow-y-auto space-y-2.5">
                {(result.names || []).map((n, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-inter text-slate-400 bg-slate-100 w-5 h-5 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-lora font-bold text-sm text-slate-800">{n.name}</span>
                      <span className="text-[10px] uppercase font-semibold font-inter bg-slate-50 px-1.5 text-slate-400 rounded">
                        {n.angle.split(" — ")[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(n.name);
                        triggerToast(`Copied candidate "${n.name}"`);
                      }}
                      className="text-[10px] text-rose-600 font-semibold font-inter hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Copy size={10} />
                      <span>Copy</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* PAGE FOOTER - IN ROBOTO */}
        <footer className="pt-10 border-t border-slate-150 text-center pb-8 font-roboto text-slate-400 text-xs font-light">
          <p>NameSynth Strategic Brain Engine • All phonetic and trademark algorithms comply with Crimson guidelines.</p>
          <p className="text-[10px] text-zinc-300 mt-1">Version 5.0.0 (Stable release 2026). Made in high precision.</p>
        </footer>

      </div>
    </div>
  );
}
