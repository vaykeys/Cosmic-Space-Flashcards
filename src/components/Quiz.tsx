import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../types";
import { INITIAL_CARDS } from "../data";
import { Sparkles, Trophy, ArrowRight, RefreshCw, Star, Check, X, ShieldAlert } from "lucide-react";

interface QuizProps {
  cards: Card[];
  onQuizComplete: (score: number) => void;
}

interface Question {
  cardId: string;
  questionText: string;
  correctAnswer: string;
  options: string[];
}

export default function Quiz({ cards, onQuizComplete }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate 5 random questions when the component mounts or restarts
  const buildQuiz = () => {
    // If we have very few cards, we'll fall back to INITIAL_CARDS
    const sourceCards = cards.length >= 5 ? cards : INITIAL_CARDS;
    
    // Shuffle and pick 5
    const shuffledCards = [...sourceCards].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    // Build question list
    const generated: Question[] = shuffledCards.map((card) => {
      // Create options using other card titles
      const wrongAnswers = sourceCards
        .filter((c) => c.id !== card.id)
        .map((c) => c.title);
      
      // Shuffle wrong answers and pick 3
      const chosenWrongs = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // Shuffle correct + wrong options
      const allOptions = [...chosenWrongs, card.title].sort(() => 0.5 - Math.random());

      return {
        cardId: card.id,
        questionText: card.frontInfo,
        correctAnswer: card.title,
        options: allOptions,
      };
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    buildQuiz();
  }, [cards]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleVerify = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    
    const isCorrect = selectedOption === questions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      onQuizComplete(score + (selectedOption === questions[currentIdx].correctAnswer ? 1 : 0));
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-md rounded-[32px] border border-white/10 max-w-md mx-auto shadow-xl text-center">
        <LoaderSpinner />
        <p className="mt-4 text-white/70 font-medium">Assembling Stellar Quiz...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="quiz-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#100B21]/95 backdrop-blur-md p-6 rounded-[32px] border border-emerald-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col justify-between"
          >
            {/* Header: Progress Meter */}
            <div className="flex justify-between items-center text-xs text-amber-300 font-space font-semibold mb-4 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles size={12} className="animate-spin-slow" />
                Astral Quest
              </span>
              <span className="text-white/50">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Progress Bar with cute Shooting Star design */}
            <div className="relative w-full h-1.5 bg-slate-900 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question Text */}
            <div className="text-center mb-6">
              <p className="text-amber-400 uppercase tracking-widest font-mono text-[9px] mb-1">
                Cosmic Challenge
              </p>
              <h3 className="text-sm md:text-base font-light text-white px-1 leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2.5 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                let optionStyle = "border-white/10 hover:border-emerald-500/50 hover:bg-white/5 bg-white/5 text-white/80";
                
                if (isAnswered) {
                  if (isCorrect) {
                     optionStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold shadow-inner";
                  } else if (isSelected) {
                     optionStyle = "border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-inner";
                  } else {
                     optionStyle = "border-white/5 opacity-30 bg-[#100B21] text-white/30";
                  }
                } else if (isSelected) {
                   optionStyle = "border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.15)] font-semibold";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full py-3 px-4 rounded-xl text-left text-xs md:text-sm border transition-all duration-300 flex items-center justify-between ${optionStyle}`}
                  >
                    <span className="font-space leading-tight">{option}</span>
                    {isAnswered && isCorrect && (
                      <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <span className="p-0.5 rounded-full bg-rose-500/20 text-rose-400">
                        <X size={14} strokeWidth={2.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Control Buttons */}
            <div className="flex gap-2">
              {!isAnswered ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleVerify}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold font-space text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 border ${
                    selectedOption !== null
                      ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 border-white/10 text-white/30"
                  }`}
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-space text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 border border-emerald-500"
                >
                  {currentIdx < questions.length - 1 ? (
                    <>
                      Next Question <ArrowRight size={14} />
                    </>
                  ) : (
                    <>
                      Finish Quest <Trophy size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#100B21]/95 backdrop-blur-md p-6 rounded-[32px] border border-emerald-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] text-center"
          >
            {/* Glowing Trophy */}
            <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-amber-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
              <Trophy size={28} />
            </div>

            <h3 className="text-xl font-bold font-space text-white mb-1">
              Quest Complete!
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-4">
              Cosmic Performance Review
            </p>

            {/* Score Ring */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-[200px] mx-auto mb-6">
              <div className="text-3xl font-extrabold font-space text-amber-400">
                {score} / {questions.length}
              </div>
              <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest mt-0.5">
                Stellar Score
              </div>
              <div className="text-xs font-light text-white/85 mt-2 leading-relaxed">
                {score === 5 ? (
                  "✨ Pure perfection! Nebula Master!"
                ) : score >= 3 ? (
                  "🌟 Great work, Astro-Scholar!"
                ) : (
                  "💫 Beautiful try, Keep Exploring!"
                )}
              </div>
            </div>

            {/* Replay */}
            <button
              onClick={buildQuiz}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-emerald-650 hover:opacity-90 border border-emerald-400/30 text-white font-bold font-space text-xs tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg"
            >
              <RefreshCw size={14} />
              Launch Another Quest
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute w-8 h-8 border-4 border-emerald-500/20 rounded-full animate-pulse" />
      <div className="absolute w-10 h-10 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
    </div>
  );
}
