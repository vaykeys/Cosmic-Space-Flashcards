export interface Card {
  id: string;
  category: "pioneers" | "wonders" | "quests" | "tech";
  title: string;
  frontInfo: string;
  backInfo: string;
  funFact: string;
  difficulty: "easy" | "medium" | "hard";
  isCustom?: boolean;
}

export type CategoryType = "pioneers" | "wonders" | "quests" | "tech";

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  symbol: string;
  tagline: string;
  bgColor: string; // Tailwind class
  textColor: string; // Tailwind class
  accentColor: string; // Tailwind class
  hoverColor: string; // Tailwind class
  borderColor: string; // Tailwind class
  gradient: string; // gradient classes
  glowColor: string; // shadow class
  description: string;
}

export interface UserProgress {
  masteredCardIds: string[];
  starredCardIds: string[];
  difficultyFilter: "all" | "easy" | "medium" | "hard";
  unlockedBadges: string[];
  quizStats: {
    totalAttempts: number;
    highestScore: number;
    perfectScores: number;
  };
  customTopicsGenerated: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  requirement: string;
  emoji: string;
  category: "study" | "quiz" | "ai" | "general";
}
