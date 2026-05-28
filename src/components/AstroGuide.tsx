import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../types";
import { Send, Sparkles, MessageCircle, Wand2, Info, Check, RefreshCw, Star, ArrowUpRight } from "lucide-react";

interface AstroGuideProps {
  onCardAdded: (newCard: Card) => void;
  generatedTopics: string[];
  setGeneratedTopics: (topics: string[]) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

export default function AstroGuide({ onCardAdded, generatedTopics, setGeneratedTopics }: AstroGuideProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "lab">("chat");

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello, starry traveler! 🪐 I'm Stella, your AI Celestial Guide. I can explain any astronomical concept, answer space questions, or help you generate custom color-coded flashcards for your library! Ask me anything! ✨",
    },
  ]);
  const [userQuery, setUserQuery] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Lab States
  const [labTopic, setLabTopic] = useState("");
  const [isLabGenerating, setIsLabGenerating] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);
  const [generatedCardResult, setGeneratedCardResult] = useState<Card | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  // Handle Stella conversational input
  const handleSendChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isChatLoading) return;

    const currentQuery = userQuery;
    setUserQuery("");
    setChatError(null);

    // Create user message
    const updatedMessages = [
      ...messages,
      { id: Date.now().toString(), role: "user" as const, text: currentQuery },
    ];
    setMessages(updatedMessages);

    setIsChatLoading(true);

    try {
      // Trigger user badge callback if needed (handled in parent but we track message counts)
      const chatPayload = updatedMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/stella-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatPayload }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "model", text: data.response },
        ]);
        
        // Count total user messages
        const userMsgCount = updatedMessages.filter(m => m.role === 'user').length;
        if (userMsgCount === 1) {
          // Send an event signal to unlock starlight-friend badge
          window.dispatchEvent(new CustomEvent("stellaChatPerformed"));
        }
      } else {
        throw new Error(data.error || "Communication failure.");
      }
    } catch (err: any) {
      console.error(err);
      setChatError("Oh dear, the communication beacon is offline. Try checking again shortly! ✨");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle flashcard generation using Lab
  const handleGenerateCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!labTopic.trim() || isLabGenerating) return;

    const topic = labTopic;
    setLabError(null);
    setGeneratedCardResult(null);
    setIsLabGenerating(true);

    try {
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (data.success && data.card) {
        // Construct final card incorporating a unique ID and custom flag
        const finalCard: Card = {
          ...data.card,
          id: `custom-${Date.now()}`,
          isCustom: true,
        };

        setGeneratedCardResult(finalCard);
        onCardAdded(finalCard); // Notify parent component to insert into collection
        setGeneratedTopics([...generatedTopics, topic]);
        setLabTopic("");
        
        // Dispatch custom event to let App trigger Cosmic Creator badge
        window.dispatchEvent(new CustomEvent("customCardGenerated"));
      } else {
        throw new Error(data.error || "Cosmic forge error.");
      }
    } catch (err: any) {
      console.error(err);
      setLabError("Oh, the cosmic forge is experiencing zero-gravity turbulence. Try another topic! 😊");
    } finally {
      setIsLabGenerating(false);
    }
  };

  return (
    <div className="bg-[#100B21]/95 backdrop-blur-md rounded-[32px] border border-emerald-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col h-[480px] w-full max-w-md mx-auto">
      {/* Category selector header */}
      <div className="flex bg-black/40 border-b border-white/10 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 px-3.5 text-xs font-bold font-space tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === "chat"
              ? "bg-white/10 text-amber-300 border border-amber-500/30 shadow-[0_4px_12px_rgba(245,158,11,0.1)]"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <MessageCircle size={14} />
          Chat with Stella
        </button>
        <button
          onClick={() => setActiveTab("lab")}
          className={`flex-1 py-2 px-3.5 text-xs font-bold font-space tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
            activeTab === "lab"
              ? "bg-white/10 text-amber-300 border border-amber-500/30 shadow-[0_4px_12px_rgba(245,158,11,0.1)]"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <Wand2 size={14} />
          Cosmic Card Lab
        </button>
      </div>

      {/* Primary Panels panel */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === "chat" ? (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Message History area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0 scrollbar-thin">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm shadow-sm leading-relaxed ${
                      m.role === "user"
                        ? "self-end bg-emerald-600 text-white rounded-br-none font-sans font-light"
                        : "self-start bg-white/5 border border-white/10 text-white/90 rounded-bl-none font-sans font-light"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="self-start bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-3 max-w-[80%] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <span className="text-[10px] text-white/50 font-mono italic">Stella is thinking...</span>
                  </div>
                )}

                {chatError && (
                  <div className="self-center py-1.5 px-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-sans text-center flex items-center gap-1.5">
                    <Info size={12} />
                    {chatError}
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat form footer */}
              <form onSubmit={handleSendChat} className="p-3 bg-black/30 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask Stella: 'What is a nebula?'"
                  className="flex-1 py-2 px-3.5 bg-white/5 border border-white/10 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-white placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !userQuery.trim()}
                  className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
                    userQuery.trim()
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-500/20"
                      : "bg-white/5 text-white/30"
                  }`}
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="lab-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between p-5 min-h-0 overflow-y-auto"
            >
              {/* Instructions intro */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-amber-400">✨</span>
                  <h4 className="text-sm font-bold font-space text-white uppercase tracking-wider">
                    Creative space laboratory
                  </h4>
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  Type any celestial topic you are curious about! Gemini will instantly create a custom, color-coded interactive flashcard to add to your study deck.
                </p>

                {/* Topics form */}
                <form onSubmit={handleGenerateCard} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={labTopic}
                    onChange={(e) => setLabTopic(e.target.value)}
                    placeholder="e.g. Venus Storms, Pluto's Heart, Blackholes"
                    className="flex-1 py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-white placeholder:text-white/30"
                  />
                  <button
                    type="submit"
                    disabled={isLabGenerating || !labTopic.trim()}
                    className={`py-2 px-3 text-xs font-bold rounded-xl font-space flex items-center gap-1 uppercase transition-all duration-300 ${
                      labTopic.trim()
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {isLabGenerating ? <RefreshCw className="animate-spin" size={12} /> : "Forge"}
                  </button>
                </form>

                {/* Error prompt */}
                {labError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-sans text-center flex items-center justify-center gap-1.5 mb-4">
                    <Info size={12} />
                    {labError}
                  </div>
                )}
              </div>

              {/* Dynamic generated display space */}
              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isLabGenerating ? (
                    <motion.div
                      key="forge-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-4"
                    >
                      <div className="relative w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <div className="absolute w-10 h-10 border-4 border-amber-500/20 rounded-full animate-ping" />
                        <Sparkles size={28} className="text-amber-400 animate-pulse" />
                      </div>
                      <p className="text-xs text-white font-medium">Stella is casting a net into the deep cosmos...</p>
                      <span className="text-[10px] text-white/40 font-mono italic block mt-1">Designing your custom STEM card...</span>
                    </motion.div>
                  ) : generatedCardResult ? (
                    <motion.div
                      key="forge-success"
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="w-full bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 text-center shadow-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <h5 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider mb-1">
                        Success! Card Forged!
                      </h5>
                      <p className="text-sm font-semibold font-space text-white truncate max-w-xs mb-1">
                        &quot;{generatedCardResult.title}&quot;
                      </p>
                      <p className="text-[11px] text-white/60 leading-tight mb-3">
                        The card has been successfully filed in the <span className="font-semibold text-amber-300">{generatedCardResult.category}</span> catalog!
                      </p>
                      
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        <span className="bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-widest text-[8px] py-1 px-2 rounded-md font-mono flex items-center gap-0.5">
                          {generatedCardResult.difficulty}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="forge-idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-white/30 p-4 border border-dashed border-white/10 rounded-2xl w-full max-w-[280px]"
                    >
                      <Wand2 size={24} className="mx-auto text-white/20 mb-2" />
                      <p className="text-[11px] leading-tight">Your forged space creation will manifest here gracefully!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom statistics display */}
              {generatedTopics.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3 flex gap-2 overflow-x-auto whitespace-nowrap py-1 scrollbar-none">
                  {generatedTopics.map((item, id) => (
                    <span
                      key={id}
                      className="bg-white/5 text-amber-300 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1 shrink-0"
                    >
                      💫 {item}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
