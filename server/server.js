
import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";


const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "https://nexora-ai-zeta-khaki.vercel.app",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            /^https:\/\/nexora-[a-z0-9-]+-nexoraai3\.vercel\.app$/.test(origin)
        ) {
            return callback(null, true);
        }

        console.log("CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Mount routes AFTER CORS
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected Successfully");
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
};

const startServer = async () => {
    await connectDb();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
