import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, CheckCircle, HelpCircle, Star, Sparkles, Volume2, ShieldCheck, Search } from "lucide-react";
import { NameCard } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  card: NameCard;
  key?: any;
}

export default function NameCardItem({ card }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(card.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id={`card-${card.name}`}
      className={`group relative bg-white border ${
        expanded ? "border-rose-500 shadow-md ring-1 ring-rose-100" : "border-gray-200 hover:border-gray-400 hover:shadow-xs"
      } rounded-xl p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top Section */}
      <div>
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <span className="text-[26px] font-bold font-lora tracking-tight text-gray-900 group-hover:text-rose-600 transition-colors">
              {card.name}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest font-inter">
                {card.angle}
              </span>
              {card.twist && (
                <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100/30 px-1.5 py-0.5 rounded font-inter font-bold uppercase tracking-wider">
                  {card.twist}
                </span>
              )}
              {card.length && (
                <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded font-inter font-medium uppercase tracking-wider">
                  {card.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
              <span className="text-lg font-bold font-inter text-gray-800 leading-none">
                {card.overallScore}
              </span>
              <span className="text-[10px] text-gray-400 font-inter font-light">/100</span>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 mt-1 uppercase tracking-wide font-inter">
              {card.scoreLabel}
            </span>
          </div>
        </div>

        {/* Why it works */}
        <p className="text-[14px] text-gray-600 font-roboto font-light mb-4 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {card.whyItWorks}
        </p>

        {/* Viewer's thought segment */}
        {card.viewerThought && (
          <div className="bg-slate-50/70 border border-slate-100 p-2.5 rounded-lg mb-4 text-[13px] text-zinc-650 font-roboto italic flex items-start gap-2 font-light">
            <span className="text-[11px] uppercase font-inter text-rose-600 font-bold tracking-wider shrink-0 mt-0.5">Viewer:</span>
            <span>"{card.viewerThought}"</span>
          </div>
        )}

        {/* Visual score bars */}
        <div className="space-y-2 mb-4 font-inter">
          <div>
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-0.5">
              <span>Memorability</span>
              <span className="font-semibold">{card.scores.memorability}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full transition-all duration-500" style={{ width: `${card.scores.memorability}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-0.5">
              <span>Pronunciation</span>
              <span className="font-semibold">{card.scores.pronunciation}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full transition-all duration-500" style={{ width: `${card.scores.pronunciation}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-0.5">
              <span>Scalability</span>
              <span className="font-semibold">{card.scores.scalability}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full transition-all duration-500" style={{ width: `${card.scores.scalability}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-0.5">
              <span>Brand Potential</span>
              <span className="font-semibold">{card.scores.brandPotential}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-700 rounded-full transition-all duration-500" style={{ width: `${card.scores.brandPotential}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Metrics Area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 pt-4 mt-2 space-y-4 text-xs font-roboto">
              {/* Checks */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-inter">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 uppercase w-14 font-semibold">Pronounce:</span>
                  <span className="text-[11px] font-medium text-gray-750">{card.tests.phoneTest}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 uppercase w-14 font-semibold">Thumbnail:</span>
                  <span className="text-[11px] font-medium text-gray-750">{card.tests.thumbnailTest}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 uppercase w-14 font-semibold">Longevity:</span>
                  <span className="text-[11px] font-medium text-gray-750">{card.tests.longevityTest}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 uppercase w-14 font-semibold">Trademark:</span>
                  <span className="text-[11px] font-medium text-gray-750">{card.tests.searchTest || "Check"}</span>
                </div>
              </div>

              {/* Strategic Psychoanalysis Layer */}
              {(card.emotionalBranding || card.audienceIdealization || card.brandHistoryCheck) && (
                <div className="space-y-3 border-t border-dashed border-gray-150 pt-3">
                  <span className="font-semibold text-rose-700 uppercase tracking-widest text-[10px] block font-inter">Strategic Branding Assessment</span>
                  {card.audienceIdealization && (
                    <div className="bg-rose-50/20 border border-rose-100/30 p-2.5 rounded-lg text-slate-700">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-rose-600 mb-0.5 font-lora">Audience Perspective</div>
                      <p className="text-[13px] leading-relaxed font-roboto font-light">{card.audienceIdealization}</p>
                    </div>
                  )}
                  {card.emotionalBranding && (
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-700">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-650 mb-0.5 font-lora">Emotional Branding Connection</div>
                      <p className="text-[13px] leading-relaxed font-roboto font-light">{card.emotionalBranding}</p>
                    </div>
                  )}
                  {card.brandHistoryCheck && (
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-700">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-slate-650 mb-0.5 font-lora">Professional Viability Check</div>
                      <p className="text-[13px] leading-relaxed font-roboto font-light">{card.brandHistoryCheck}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Availability Handles */}
              <div className="space-y-1.5 font-inter">
                <span className="font-semibold text-gray-700 block text-[13px]">Identity Availability</span>
                <div className="flex justify-between items-center text-[13px] bg-slate-50 border border-slate-100 p-2 rounded-md">
                  <span className="text-slate-600 font-medium">{card.availability.handleSuggestion}</span>
                  <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700">
                    {card.availability.youtubeHandleStatus}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 block font-light">
                  Domain: {card.availability.domainNote}
                </span>
              </div>

              {/* Alternative Variations */}
              {card.variations && card.variations.length > 0 && (
                <div className="font-inter">
                  <span className="font-semibold text-gray-700 block mb-1">Lateral Variations</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {card.variations.map((v, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Copy & Collapse State */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3 font-inter">
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
            copied
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-gray-950 text-white hover:bg-gray-800"
          }`}
        >
          {copied ? (
            <>
              <Check size={11} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy Name</span>
            </>
          )}
        </button>

        <span className="text-[10px] text-gray-450 flex items-center gap-0.5 uppercase tracking-wide font-semibold">
          {expanded ? (
            <>
              <span>Collapse</span>
              <ChevronUp size={12} />
            </>
          ) : (
            <>
              <span>Full Intelligence</span>
              <ChevronDown size={12} />
            </>
          )}
        </span>
      </div>
    </div>
  );
}
