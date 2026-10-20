import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
    connectDb();
})

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected Successfully");
    } catch (err) {
        console.log(err);
    }
}


// app.post("/test", async (req, res) => {
//     try {
//         const { message } = req.body;

//         if (!message) {
//             return res.status(400).json({
//                 error: "Message is required",
//             });
//         }

//         const response = await ai.interactions.create({
//             model: "gemini-3.8-flash",
//             input: message,
//         });

//         res.json({
//             reply: response.output_text,
//         });
//     } catch (error) {
//         console.error("Gemini API error:", error);

//         res.status(500).json({
//             error: "Failed to generate AI response",
//             details: error.message,
//         });
//     }
// });
