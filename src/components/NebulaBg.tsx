import { motion } from "motion/react";

export default function NebulaBg() {
  // Twisted coordinates for star twinkles
  const stars = [
    { top: "10%", left: "5%", size: 8, delay: 0 },
    { top: "12%", left: "85%", size: 12, delay: 1.2 },
    { top: "35%", left: "93%", size: 6, delay: 0.5 },
    { top: "65%", left: "4%", size: 10, delay: 2 },
    { top: "85%", left: "20%", size: 14, delay: 0.8 },
    { top: "80%", left: "80%", size: 8, delay: 1.5 },
    { top: "50%", left: "50%", size: 4, delay: 2.3 },
    { top: "22%", left: "40%", size: 10, delay: 1.7 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Immersive Theme Glowing Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-amber-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/15 rounded-full blur-[120px]" />
      <div className="absolute top-[35%] right-[20%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] left-[10%] w-[25%] h-[25%] bg-amber-600/10 rounded-full blur-[90px]" />

      {/* Twinkling star collection */}
      {stars.map((star, idx) => (
        <motion.div
          key={idx}
          className="absolute text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          style={{
            top: star.top,
            left: star.left,
          }}
          animate={{
            opacity: [0.25, 1, 0.25],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: 2.5 + (idx % 3),
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        >
          <svg
            width={star.size}
            height={star.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-amber-400"
          >
            <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
          </svg>
        </motion.div>
      ))}

      {/* Floating Saturn outline */}
      <motion.div
        className="absolute bottom-[15%] left-[5%] opacity-[0.12] text-amber-400 hidden md:block"
        animate={{
          y: [0, -10, 0],
          rotate: [15, 18, 15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="60" cy="40" rx="20" ry="20" />
          <ellipse cx="60" cy="40" rx="45" ry="10" transform="rotate(-15 60 40)" />
        </svg>
      </motion.div>

      {/* Floating constellation lines */}
      <motion.div
        className="absolute top-[18%] right-[8%] opacity-[0.1] text-emerald-400 hidden lg:block"
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="20" cy="30" r="3" fill="currentColor" />
          <circle cx="80" cy="50" r="3" fill="currentColor" />
          <circle cx="120" cy="20" r="3" fill="currentColor" />
          <circle cx="170" cy="80" r="3" fill="currentColor" />
          <line x1="20" y1="30" x2="80" y2="50" />
          <line x1="80" y1="50" x2="120" y2="20" />
          <line x1="80" y1="50" x2="170" y2="80" />
        </svg>
      </motion.div>
    </div>
  );
}
