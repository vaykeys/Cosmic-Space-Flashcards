import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI client lazily to support dynamic environment settings
let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// JSON Schema for space flashcards
const flashcardSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A beautiful, evocative title for the flashcard (e.g., 'The Pillars of Creation' or 'Mae Jemison').",
    },
    category: {
      type: Type.STRING,
      description: "MUST be one of these strictly: 'pioneers', 'wonders', 'quests', or 'tech'.",
    },
    frontInfo: {
      type: Type.STRING,
      description: "A friendly, curiosity-sparking prompt or question on the front of the card. Max 120 characters.",
    },
    backInfo: {
      type: Type.STRING,
      description: "An inspiring, clear, and educational answer or explanation suitable for young students. Max 250 characters.",
    },
    funFact: {
      type: Type.STRING,
      description: "An extra delightful, mind-expanding space fact related to the card, narrated with cheerful curiosity. Max 140 characters.",
    },
    difficulty: {
      type: Type.STRING,
      description: "Must be one of target difficulties: 'easy', 'medium', or 'hard'.",
    },
  },
  required: ["title", "category", "frontInfo", "backInfo", "funFact", "difficulty"],
};

// API: Generate custom flashcard
app.post("/api/generate-card", async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return res.status(400).json({ error: "Please enter a valid space topic!" });
  }

  try {
    const prompt = `Create a gorgeous, educational space exploration flashcard about the topic "${topic}". 
It should be highly engaging and suitable for a middle school/high school student, especially inspiring young women to get excited about physics, astronomy, and STEM.
Strictly categorize it into one of: 'pioneers' (astronomers, female space scientists, astronauts), 'wonders' (nebulae, black holes, moons, stars), 'quests' (space flights, telescopes, mars rovers), or 'tech' (rockets, pressure suits, modules).`;

    const response = await getAi().models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an astronomy professor and card designer crafting beautiful, encouraging STEM materials.",
        responseMimeType: "application/json",
        responseSchema: flashcardSchema,
        temperature: 1.0,
      },
    });

    const cardData = JSON.parse(response.text || "{}");
    res.json({ success: true, card: cardData });
  } catch (error: any) {
    console.error("Gemini Card Generation Error:", error);
    res.status(500).json({ error: error.message || "Oops! The cosmos got a bit tangled up. Please try again in a moment." });
  }
});

// API: Chat with Celestial Guide 'Stella'
app.post("/api/stella-chat", async (req, res) => {
  const { messages } = req.body; // Array of objects with role ('user' | 'model') and text

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messaging format." });
  }

  try {
    // Gemini API requires conversational flow to strictly start with 'user'
    // and alternate between 'user' and 'model' (with no consecutives of the same type)
    const sanitizedMessages: { role: string; text: string }[] = [];
    for (const msg of messages) {
      if (!msg.text || typeof msg.text !== "string" || msg.text.trim() === "") continue;
      const role = msg.role === "model" ? "model" : "user";
      
      if (sanitizedMessages.length === 0) {
        if (role === "user") {
          sanitizedMessages.push({ role, text: msg.text });
        }
      } else {
        const lastMsg = sanitizedMessages[sanitizedMessages.length - 1];
        if (lastMsg.role === role) {
          // Merge consecutive messages from same role
          lastMsg.text += "\n" + msg.text;
        } else {
          sanitizedMessages.push({ role, text: msg.text });
        }
      }
    }

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: "Please send a message from the user." });
    }

    // Format messages for @google/genai SDK
    const contents = sanitizedMessages.map((m) => {
      return {
        role: m.role,
        parts: [{ text: m.text }],
      };
    });

    const response = await getAi().models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are Stella, an enthusiastic, knowledgeable, and incredibly friendly AI Cosmic Mentor and space guide.
Your goal is to inspire students, particularly young ladies and students of all backgrounds, to love Space and STEM.
Always respond warmly with elegant space emojis (💫, ✨, 🌟, 🚀, 🪐, 🌌, 🛰️).
Explain astronomy and spaceflight with beautiful metaphors, clear facts, and encouragement.
Keep your answers relatively concise, warm, and highly conversational.`,
        temperature: 0.8,
      },
    });

    res.json({ success: true, response: response.text });
  } catch (error: any) {
    console.error("Stella Chat Error:", error);
    res.status(500).json({ error: error.message || "Stella is currently gazing through a telescope. Please try asking again in a moment!" });
  }
});

// Integration of Vite Dev Server / Production Static Serving
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cosmic Space Server is navigating at http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startApp().catch((err) => {
    console.error("Failed to start application:", err);
  });
}

export default app;
