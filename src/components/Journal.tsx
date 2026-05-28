import { UserProgress, Badge } from "../types";
import { STEM_BADGES } from "../data";
import { BookOpen, Trophy, Sparkles, CheckCircle2, Bookmark, Flame, Zap, Compass } from "lucide-react";

interface JournalProps {
  progress: UserProgress;
  totalCardsCount: number;
}

export default function Journal({ progress, totalCardsCount }: JournalProps) {
  // Compute percentage levels
  const masteryPercentage = totalCardsCount > 0 ? Math.round((progress.masteredCardIds.length / totalCardsCount) * 105) : 0;
  // Cap at 100
  const visualMasteryPct = Math.min(masteryPercentage, 100);

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* ============ COLUMN 1: STEM STATS ============ */}
      <div className="md:col-span-1 bg-[#100B21]/95 backdrop-blur-md rounded-[32px] border border-emerald-500/30 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-amber-400 animate-spin-slow text-base leading-none">🪐</span>
            <h3 className="text-sm font-bold font-space text-white uppercase tracking-widest">
              Astro-Metrics
            </h3>
          </div>
          <p className="text-xs text-white/50 mb-6 leading-relaxed">
            Your telemetry and research stats tracked across the galaxy.
          </p>

          <div className="flex flex-col gap-4">
            {/* Cards Mastered */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-300">
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider">Mastered</div>
                  <div className="text-sm font-bold text-white font-space">
                    {progress.masteredCardIds.length} <span className="text-xs text-white/40 font-normal">/ {totalCardsCount} cards</span>
                  </div>
                </div>
              </div>
              <Compass size={16} className="text-amber-400 animate-spin-slow" />
            </div>

            {/* Quiz Mastery */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider">Highscore</div>
                  <div className="text-sm font-bold text-white font-space">
                    {progress.quizStats.highestScore} <span className="text-xs text-white/40 font-normal">/ 5 correct</span>
                  </div>
                </div>
              </div>
              <Zap size={16} className="text-emerald-400" />
            </div>

            {/* Starred bookmarks */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300">
                  <Bookmark size={18} />
                </div>
                <div>
                  <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider">Starred Clues</div>
                  <div className="text-sm font-bold text-white font-space">
                    {progress.starredCardIds.length} <span className="text-xs text-white/40 font-normal">cards</span>
                  </div>
                </div>
              </div>
              <Sparkles size={16} className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Mastered Progress Bar */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-white/60">Star Highway Completion</span>
            <span className="font-bold text-amber-300 font-mono">{visualMasteryPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${visualMasteryPct}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40 italic block mt-2 text-center font-light">
            {progress.masteredCardIds.length === totalCardsCount && progress.masteredCardIds.length > 0
              ? "✨ All cards mastered! Universal Overlord!"
              : "Keep studying to advance on the star grid!"}
          </span>
        </div>
      </div>

      {/* ============ COLUMN 2-3: BADGES LOCKER ============ */}
      <div className="md:col-span-2 bg-[#100B21]/95 backdrop-blur-md rounded-[32px] border border-emerald-500/30 p-6 shadow-xl">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-amber-400 text-base leading-none">🏆</span>
          <h3 className="text-sm font-bold font-space text-white uppercase tracking-widest">
            Cosmic Badge Locker
          </h3>
        </div>
        <p className="text-xs text-white/50 mb-6 leading-relaxed">
          Embark on activities, quizzes, and AI design quests to customize and unlock stellar awards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEM_BADGES.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`relative rounded-2xl p-4 border transition-all duration-300 flex gap-3.5 items-start ${
                  isUnlocked
                    ? "bg-gradient-to-tr from-amber-500/10 to-emerald-500/10 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.1)]"
                    : "bg-slate-900/40 border-white/5 opacity-55"
                }`}
              >
                {/* Badge Emoji icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl select-none shrink-0 ${
                    isUnlocked
                      ? "bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-white shadow-lg shadow-amber-500/10 border border-amber-500/20"
                      : "bg-slate-900 border border-white/5 text-white/20 grayscale"
                  }`}
                >
                  {badge.emoji}
                </div>

                {/* Badge text info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <h4 className={`text-xs md:text-sm font-bold font-space truncate ${isUnlocked ? "text-white" : "text-white/40"}`}>
                       {badge.title}
                    </h4>
                    {isUnlocked && (
                      <span className="text-emerald-400">
                        <CheckCircle2 size={13} fill="currentColor" className="text-emerald-100" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-snug font-light">
                    {badge.description}
                  </p>
                  <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-300 mt-2 bg-amber-500/10 border border-amber-500/20 inline-block px-1.5 py-0.5 rounded">
                    Req: {badge.requirement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
