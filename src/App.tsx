import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CategoryType, UserProgress } from "./types";
import { CATEGORIES, INITIAL_CARDS } from "./data";
import NebulaBg from "./components/NebulaBg";
import Flashcard from "./components/Flashcard";
import Quiz from "./components/Quiz";
import AstroGuide from "./components/AstroGuide";
import Journal from "./components/Journal";
import { 
  Sparkles, BookOpen, MessageCircle, Trophy, Compass, Star, 
  ChevronLeft, ChevronRight, Award, RotateCcw, HelpCircle, Flame, CheckCircle2 
} from "lucide-react";

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"study" | "quiz" | "mentor" | "journal">("study");
  
  // Entire deck: pre-compiled static cards + custom generated cards
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [practiceOnly, setPracticeOnly] = useState(false);
  
  // Carousel pointer
  const [carouselIdx, setCarouselIdx] = useState(0);

  // User persistent progress
  const [progress, setProgress] = useState<UserProgress>({
    masteredCardIds: [],
    starredCardIds: [],
    difficultyFilter: "all",
    unlockedBadges: [],
    quizStats: {
      totalAttempts: 0,
      highestScore: 0,
      perfectScores: 0,
    },
    customTopicsGenerated: [],
  });

  // Highlight badge alerts
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<string | null>(null);

  // Practice flags (locally tracked within state, saved to storage if wanted)
  const [practiceCardIds, setPracticeCardIds] = useState<string[]>([]);

  // --- PERSISTENCE ---
  useEffect(() => {
    // 1. Load custom cards from storage
    const storedCustom = localStorage.getItem("cosmic_custom_cards");
    const customList: Card[] = storedCustom ? JSON.parse(storedCustom) : [];
    setCards([...INITIAL_CARDS, ...customList]);

    // 2. Load progress
    const storedProgress = localStorage.getItem("cosmic_student_progress");
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }

    // 3. Load practice ids
    const storedPractice = localStorage.getItem("cosmic_practice_cards");
    if (storedPractice) {
      setPracticeCardIds(JSON.parse(storedPractice));
    }
  }, []);

  const saveProgressState = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem("cosmic_student_progress", JSON.stringify(newProgress));
  };

  // --- CORE CARD ACTIONS ---
  const handleToggleStar = (cardId: string) => {
    const wasStarred = progress.starredCardIds.includes(cardId);
    let updated: string[];

    if (wasStarred) {
      updated = progress.starredCardIds.filter((id) => id !== cardId);
    } else {
      updated = [...progress.starredCardIds, cardId];
      // Micro achievement trigger for starring any card
      triggerBadgeUnlock("nebula-novice");
    }

    const nextProgress = { ...progress, starredCardIds: updated };
    saveProgressState(nextProgress);
  };

  const handleToggleMaster = (cardId: string) => {
    const wasMastered = progress.masteredCardIds.includes(cardId);
    let updated: string[];

    if (wasMastered) {
      updated = progress.masteredCardIds.filter((id) => id !== cardId);
    } else {
      updated = [...progress.masteredCardIds, cardId];
      
      // Remove from practice list if marked mastered
      if (practiceCardIds.includes(cardId)) {
        const revisedPractice = practiceCardIds.filter(id => id !== cardId);
        setPracticeCardIds(revisedPractice);
        localStorage.setItem("cosmic_practice_cards", JSON.stringify(revisedPractice));
      }
      
      // Trigger Badge validations
      triggerBadgeUnlock("nebula-novice");
      if (updated.length >= 5) {
        triggerBadgeUnlock("constellation-conqueror");
      }
    }

    const nextProgress = { ...progress, masteredCardIds: updated };
    saveProgressState(nextProgress);
  };

  const handleFlagPractice = (cardId: string) => {
    const isFlagged = practiceCardIds.includes(cardId);
    let updated: string[];

    if (isFlagged) {
      updated = practiceCardIds.filter((id) => id !== cardId);
    } else {
      updated = [...practiceCardIds, cardId];
      
      // Remove from mastered list if flagged for studying again
      if (progress.masteredCardIds.includes(cardId)) {
        const revisedMastered = progress.masteredCardIds.filter(id => id !== cardId);
        const nextProgress = { ...progress, masteredCardIds: revisedMastered };
        saveProgressState(nextProgress);
      }
    }

    setPracticeCardIds(updated);
    localStorage.setItem("cosmic_practice_cards", JSON.stringify(updated));
  };

  // Append new AI created cards
  const handleAddCustomCard = (newCard: Card) => {
    const storedCustom = localStorage.getItem("cosmic_custom_cards");
    const customList: Card[] = storedCustom ? JSON.parse(storedCustom) : [];
    const updatedCustom = [...customList, newCard];
    
    // Save custom cards list
    localStorage.setItem("cosmic_custom_cards", JSON.stringify(updatedCustom));
    
    // Merge full deck state
    setCards([...INITIAL_CARDS, ...updatedCustom]);
    
    // Reset carousel index to focus on the newly added custom card
    setCarouselIdx(filteredCards.length); 
  };

  // --- QUIZ ACTIONS ---
  const handleQuizComplete = (score: number) => {
    const nextAttempts = progress.quizStats.totalAttempts + 1;
    const nextHighest = Math.max(progress.quizStats.highestScore, score);
    const nextPerfects = score === 5 ? progress.quizStats.perfectScores + 1 : progress.quizStats.perfectScores;

    const nextProgress = {
      ...progress,
      quizStats: {
        totalAttempts: nextAttempts,
        highestScore: nextHighest,
        perfectScores: nextPerfects,
      },
    };

    saveProgressState(nextProgress);

    // Evaluate badge thresholds
    if (score >= 3) {
      triggerBadgeUnlock("badge-lunar-path");
    }
    if (score === 5) {
      triggerBadgeUnlock("badge-starlight-perfection");
    }
  };

  // --- DETECT AI EVENTS ---
  useEffect(() => {
    const handleStellaChatUnlock = () => {
      triggerBadgeUnlock("badge-stella-friend");
    };

    const handleCustomCardUnlock = () => {
      triggerBadgeUnlock("badge-alchemist");
    };

    window.addEventListener("stellaChatPerformed", handleStellaChatUnlock);
    window.addEventListener("customCardGenerated", handleCustomCardUnlock);

    return () => {
      window.removeEventListener("stellaChatPerformed", handleStellaChatUnlock);
      window.removeEventListener("customCardGenerated", handleCustomCardUnlock);
    };
  }, [progress]);

  // --- DYNAMIC BADGING MOTOR ---
  const triggerBadgeUnlock = (badgeId: string) => {
    if (progress.unlockedBadges.includes(badgeId)) return;

    const updatedBadges = [...progress.unlockedBadges, badgeId];
    setProgress((prev) => {
      const next = { ...prev, unlockedBadges: updatedBadges };
      localStorage.setItem("cosmic_student_progress", JSON.stringify(next));
      return next;
    });

    // Animate a gorgeous toast achievement panel!
    setNewlyUnlockedBadge(badgeId);
    setTimeout(() => {
      setNewlyUnlockedBadge(null);
    }, 4500);
  };

  // --- CAROUSEL CALCULATION ENGINE ---
  const filteredCards = cards.filter((card) => {
    if (selectedCategory !== "all" && card.category !== selectedCategory) return false;
    if (difficultyFilter !== "all" && card.difficulty !== difficultyFilter) return false;
    if (starredOnly && !progress.starredCardIds.includes(card.id)) return false;
    if (practiceOnly && !practiceCardIds.includes(card.id)) return false;
    return true;
  });

  // Readjust slider boundary if filter slices space down
  const currentCard = filteredCards[carouselIdx] || null;

  const handlePrevCard = () => {
    if (filteredCards.length === 0) return;
    setCarouselIdx((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1));
  };

  const handleNextCard = () => {
    if (filteredCards.length === 0) return;
    setCarouselIdx((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1));
  };

  // Reset Carousel pointer when filters modify the list
  useEffect(() => {
    setCarouselIdx(0);
  }, [selectedCategory, difficultyFilter, starredOnly, practiceOnly]);

  return (
    <div className="relative min-h-screen pb-16 pt-6 px-4 md:px-8 text-slate-100 font-sans select-none overflow-hidden">
      {/* Whimsical Rotating Stars and nebula lights */}
      <NebulaBg />
 
      {/* ============ STARRY TOAST ACHIEVEMENT UNLOCK ============ */}
      <AnimatePresence>
        {newlyUnlockedBadge && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-950 via-emerald-850 to-slate-950 text-white rounded-3xl py-3.5 px-6 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-emerald-500/40 flex items-center gap-3.5 max-w-sm w-[90%] backdrop-blur-2xl"
          >
            <div className="text-3xl animate-bounce">🏆</div>
            <div className="flex-1">
              <span className="text-[10px] tracking-widest uppercase font-mono text-amber-300 block font-bold">
                Cosmic Milestone Unlocked!
              </span>
              <span className="text-sm font-bold font-space leading-tight block">
                {newlyUnlockedBadge === "nebula-novice" && "🔮 Nebula Novice"}
                {newlyUnlockedBadge === "constellation-conqueror" && "🌟 Supernova Scholar"}
                {newlyUnlockedBadge === "badge-stella-friend" && "💬 Stella's Apprentice"}
                {newlyUnlockedBadge === "badge-alchemist" && "🎨 Cosmic Creator"}
                {newlyUnlockedBadge === "badge-lunar-path" && "🚀 Artemis Explorer"}
                {newlyUnlockedBadge === "badge-starlight-perfection" && "👑 Cosmic Perfectionist"}
              </span>
              <span className="text-[11px] text-white/60 block leading-snug mt-0.5">
                Check your Space Journal to claim your star badge!
              </span>
            </div>
            <div className="p-1 rounded-full bg-white/10">
              <CheckCircle2 size={16} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* ============ HEADER ELEMENT ============ */}
      <header className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {/* Whimsical application emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Compass size={22} className="animate-spin-slow text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-emerald-200 leading-none">
              Celestial Cards
            </h1>
            <span className="text-[10px] md:text-xs font-semibold text-amber-400/80 font-mono flex items-center gap-1 mt-0.5">
              <Sparkles size={11} /> STEM FLASHCARDS FOR YOUNG ASTRONOMERS
            </span>
          </div>
        </div>
 
        {/* Unified Application Navigation Tabs */}
        <nav className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("study")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold font-space uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === "study"
                ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen size={13} />
            Study
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold font-space uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === "quiz"
                ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy size={13} />
            Quiz
          </button>
          <button
            onClick={() => setActiveTab("mentor")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold font-space uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === "mentor"
                ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageCircle size={13} />
            AI Stella
          </button>
          <button
            onClick={() => setActiveTab("journal")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold font-space uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
              activeTab === "journal"
                ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Award size={13} />
            Journal
          </button>
        </nav>
      </header>
 
      {/* ============ CONTENT WINDOW CONTAINER ============ */}
      <main className="relative z-10 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* ============ STUDY VIEW ============ */}
          {activeTab === "study" && (
            <motion.div
              key="study-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* Category Filter Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`p-3 rounded-2xl text-center border transition-all duration-300 cursor-pointer flex flex-col justify-center items-center ${
                    selectedCategory === "all"
                      ? "bg-white/10 border-amber-500/40 text-amber-300 font-semibold shadow-[0_4px_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <span className="text-xl">🌌</span>
                  <span className="text-xs font-bold font-space mt-1 leading-none">All Decks</span>
                </button>
 
                {Object.values(CATEGORIES).map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const catCount = cards.filter((c) => c.category === cat.id).length;
 
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? `bg-white/10 ${cat.borderColor || "border-amber-500/40"} text-amber-300 font-semibold shadow-[0_4px_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30`
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white/50 hover:text-white"
                      }`}
                    >
                      <span className="text-xl">{cat.symbol}</span>
                      <span className="text-xs font-bold font-space mt-1 leading-none truncate w-full max-w-[120px]">
                        {cat.label}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded mt-2 font-mono">
                        {catCount}/15
                      </span>
                    </button>
                  );
                })}
              </div>
 
              {/* Sub filters alignment */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-white/40">
                    Difficulty Filter:
                  </span>
                  
                  {(["all", "easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={`py-1 px-2.5 rounded-lg text-xs font-space uppercase tracking-wider transition-all cursor-pointer font-semibold ${
                        difficultyFilter === diff
                          ? "bg-gradient-to-r from-amber-500 to-emerald-600 text-white shadow-md shadow-amber-500/20"
                          : "bg-white/5 text-white/65 border border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
 
                {/* Starred vs Practice toggle triggers */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStarredOnly(!starredOnly);
                      if (practiceOnly) setPracticeOnly(false);
                    }}
                    className={`py-1 px-3 rounded-lg text-xs font-space font-semibold flex items-center gap-1.5 transition-all border ${
                      starredOnly
                        ? "bg-amber-500/25 border-amber-500/40 text-amber-300 font-bold"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Star size={12} fill={starredOnly ? "currentColor" : "none"} />
                    Bookmarked ({progress.starredCardIds.length})
                  </button>
 
                  <button
                    onClick={() => {
                      setPracticeOnly(!practiceOnly);
                      if (starredOnly) setStarredOnly(false);
                    }}
                    className={`py-1 px-3 rounded-lg text-xs font-space font-semibold flex items-center gap-1.5 transition-all border ${
                      practiceOnly
                        ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300 font-bold"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <RotateCcw size={12} />
                    Need Practice ({practiceCardIds.length})
                  </button>
                </div>
              </div>
 
              {/* Active Catalog Flashcard slider */}
              <div className="flex flex-col items-center justify-center my-4 min-h-[400px]">
                {filteredCards.length > 0 && currentCard ? (
                  <div className="w-full flex flex-col items-center gap-6">
                    {/* Carousel navigation controls */}
                    <div className="w-full flex items-center justify-between max-w-xl">
                      {/* Left control icon - Immersive Round border */}
                      <button
                        onClick={handlePrevCard}
                        className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 text-white/60 hover:text-white transition-all shadow-xl active:scale-95"
                      >
                        <ChevronLeft size={20} strokeWidth={2} />
                      </button>
 
                      {/* Display flashcard container */}
                      <div className="flex-1 px-4">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, x: 20, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                          >
                            <Flashcard
                              card={currentCard}
                              isStarred={progress.starredCardIds.includes(currentCard.id)}
                              isMastered={progress.masteredCardIds.includes(currentCard.id)}
                              onToggleStar={() => handleToggleStar(currentCard.id)}
                              onToggleMaster={() => handleToggleMaster(currentCard.id)}
                              onFlagPractice={() => handleFlagPractice(currentCard.id)}
                              isFlaggedForPractice={practiceCardIds.includes(currentCard.id)}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
 
                      {/* Right control icon - Immersive Emerald Glow border */}
                      <button
                        onClick={handleNextCard}
                        className="w-12 h-12 rounded-full bg-white/5 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-all shadow-xl active:scale-95"
                      >
                        <ChevronRight size={20} strokeWidth={2} />
                      </button>
                    </div>
 
                    {/* Progress indicator */}
                    <div className="text-center font-space text-xs font-semibold text-white/80 bg-white/5 backdrop-blur-md py-1.5 px-4 rounded-full shadow-lg border border-white/10">
                      Card <span className="text-amber-400 font-extrabold">{carouselIdx + 1}</span> of {filteredCards.length}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl w-full max-w-md mx-auto">
                    <HelpCircle size={40} className="text-amber-400/40 mx-auto mb-3" />
                    <h3 className="text-sm font-bold font-space text-white uppercase tracking-widest">No flashcards discovered</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-xs mx-auto">
                      Try adjusting your filters, searching in other celestial decks, or launch custom cards in the <b>AI Stella</b> lab panel!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ============ QUIZ VIEW ============ */}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Quiz cards={cards} onQuizComplete={handleQuizComplete} />
            </motion.div>
          )}

          {/* ============ AI STELLA VIEW ============ */}
          {activeTab === "mentor" && (
            <motion.div
              key="mentor-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AstroGuide 
                onCardAdded={handleAddCustomCard} 
                generatedTopics={progress.customTopicsGenerated}
                setGeneratedTopics={(topics) => {
                  saveProgressState({ ...progress, customTopicsGenerated: topics });
                }}
              />
            </motion.div>
          )}

          {/* ============ LEAGUE JOURNAL VIEW ============ */}
          {activeTab === "journal" && (
            <motion.div
              key="journal-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Journal progress={progress} totalCardsCount={cards.length} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
