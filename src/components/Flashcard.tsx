import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CategoryInfo } from "../types";
import { CATEGORIES } from "../data";
import { Star, CheckCircle, RotateCcw, AlertTriangle, Sparkles, HelpCircle } from "lucide-react";

interface FlashcardProps {
  card: Card;
  isStarred: boolean;
  isMastered: boolean;
  onToggleStar: () => void;
  onToggleMaster: () => void;
  onFlagPractice: () => void;
  isFlaggedForPractice: boolean;
}

export default function Flashcard({
  card,
  isStarred,
  isMastered,
  onToggleStar,
  onToggleMaster,
  onFlagPractice,
  isFlaggedForPractice,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const categoryInfo: CategoryInfo = CATEGORIES[card.category] || CATEGORIES.wonders;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-800",
    medium: "bg-cyan-100 text-cyan-800",
    hard: "bg-fuchsia-100 text-fuchsia-800",
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Perspective wrapper */}
      <div className="w-full h-80 min-h-[320px] perspective-1000 cursor-pointer" onClick={handleFlip}>
        <motion.div
          className="relative w-full h-full duration-700 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* ============ FRONT SIDE ============ */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[40px] p-6 border flex flex-col justify-between backface-hidden bg-white/5 backdrop-blur-2xl border-emerald-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden transition-all hover:scale-[1.02]`}
          >
            {/* Glowing spot background behind the card content */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-40 pointer-events-none"></div>

            {/* Header metadata */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300`}>
                <span className="text-base">{categoryInfo.symbol}</span>
                <span className="font-space font-medium tracking-wide">{categoryInfo.label}</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase font-mono rounded-md bg-emerald-950/80 text-emerald-200 border border-emerald-500/20">
                  {card.difficulty}
                </span>

                {/* Star Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar();
                  }}
                  className={`p-1.5 rounded-full transition-all duration-300 ${
                    isStarred
                      ? "text-amber-400 bg-amber-500/20 scale-110"
                      : "text-white/40 hover:text-amber-400 hover:bg-white/10"
                  }`}
                  title="Starlight Bookmark"
                >
                  <Star size={18} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Middle Question info */}
            <div className="relative z-10 flex flex-col justify-center grow my-4 text-center">
              <div className="mx-auto text-amber-400/30 opacity-75 mb-3">
                <HelpCircle size={32} strokeWidth={1.5} />
              </div>
              <p className="text-md md:text-lg font-light tracking-wide text-white/90 leading-relaxed font-sans px-2">
                {card.frontInfo}
              </p>
            </div>

            {/* Bottom Footer Flip Indicator */}
            <div className="relative z-10 flex items-center justify-between text-xs font-medium text-white/40 font-mono tracking-tight pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                {card.isCustom && <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-amber-500/30">A.I.</span>}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 animate-pulse bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-space">
                <Sparkles size={11} /> Tap to reveal answer
              </span>
            </div>
          </div>

          {/* ============ BACK SIDE ============ */}
          <div
            className={`absolute inset-0 w-full h-full rounded-[40px] p-6 border flex flex-col justify-between backface-hidden bg-[#100B21]/95 border-emerald-500/30 rotate-y-180 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden`}
            onClick={(e) => {
              // Clicking buttons won't flip the card again
            }}
          >
            {/* Ambient emerald planetary blur */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-40 pointer-events-none"></div>

            {/* Header with Title */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-widest uppercase font-mono text-white/40">
                  {categoryInfo.label}
                </span>
                <h3 className="text-base font-bold font-space text-white flex items-center gap-1.5">
                  <span className="text-amber-400"><Sparkles size={14} /></span>
                  {card.title}
                </h3>
              </div>

              {/* Back Star Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar();
                }}
                className={`p-1.5 rounded-full transition-all duration-300 ${
                  isStarred
                    ? "text-amber-400 bg-amber-500/20 scale-110"
                    : "text-white/40 hover:text-amber-400 hover:bg-white/10"
                }`}
              >
                <Star size={18} fill={isStarred ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Explanation Area */}
            <div className="relative z-10 flex flex-col justify-center grow my-2 overflow-y-auto pr-1">
              <p className="text-xs md:text-sm text-white/80 leading-relaxed font-sans font-light">
                {card.backInfo}
              </p>

              {/* Interactive Fun Fact bubble */}
              <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/5 to-emerald-500/5 border border-emerald-500/20 flex gap-2 items-start shadow-sm">
                <span className="text-base leading-none select-none">💫</span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold font-space uppercase tracking-wide text-amber-300">
                    Cosmic Sparkle Fact
                  </span>
                  <p className="text-[11px] text-white/70 leading-relaxed italic font-light">
                    {card.funFact}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons (Mastered or Need Practice) */}
            <div className="relative z-10 flex gap-2 pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
              {/* Needs Practice */}
              <button
                onClick={onFlagPractice}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-300 border ${
                  isFlaggedForPractice
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <RotateCcw size={12} className={isFlaggedForPractice ? "animate-spin-slow" : ""} />
                {isFlaggedForPractice ? "Studying" : "Need Practice"}
              </button>

              {/* Mastered */}
              <button
                onClick={onToggleMaster}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-300 border ${
                  isMastered
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <CheckCircle size={12} fill={isMastered ? "currentColor" : "none"} className={isMastered ? "text-emerald-100" : ""} />
                {isMastered ? "Mastered!" : "Mark Learned"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Flip Tip Under the Card */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-white/40 bg-white/5 backdrop-blur-sm shadow-sm py-1.5 px-3.5 rounded-full border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="font-sans font-light">Status: {isMastered ? "Learned! 🌌" : "Reading constellation"}</span>
      </div>
    </div>
  );
}
