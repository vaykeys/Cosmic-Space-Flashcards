import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI client
// User-Agent: 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

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

    const response = await ai.models.generateContent({
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
    res.status(500).json({ error: "Oops! The cosmos got a bit tangled up. Please try again in a moment." });
  }
});

// API: Chat with Celestial Guide 'Stella'
app.post("/api/stella-chat", async (req, res) => {
  const { messages } = req.body; // Array of objects with role ('user' | 'model') and text

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messaging format." });
  }

  try {
    // Format messages for @google/genai SDK
    // The SDK expects contents to represent history
    const contents = messages.map((m) => {
      return {
        role: m.role || "user",
        parts: [{ text: m.text }],
      };
    });

    const response = await ai.models.generateContent({
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
    res.status(500).json({ error: "Stella is currently gazing through a telescope. Please try asking again in a moment!" });
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

startApp().catch((err) => {
  console.error("Failed to start application:", err);
});
