import "dotenv/config";
import express from "express";
import cors from "cors";

import { generateAIResponse } from "./main.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://textsimplifiers.netlify.app",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("Blocked CORS origin:", origin);
        return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { input, wordLimit } = req.body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return res.status(400).json({
        error: "Please provide valid input.",
      });
    }

    if (input.length > 5000) {
      return res.status(400).json({
        error: "Input is too long.",
      });
    }

    const limit = Math.min(Math.max(Number(wordLimit) || 100, 20), 500);

    const result = await generateAIResponse(input, limit);

    res.json({ result });
  } catch (error) {
  console.error("AI generation error:", error);

  res.status(500).json({
    error: "AI generation failed. Please try again.",
  });
}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
