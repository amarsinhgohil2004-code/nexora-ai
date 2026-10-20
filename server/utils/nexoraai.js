
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const nexoraAIAPIResponse = async (message) => {
    try {
        if (!message || !message.trim()) {
            throw new Error("Message is required");
        }

        const response = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: message,
        });

        return response.output_text;
    } catch (error) {
        console.error("Gemini API error:", error.message);
        throw error;
    }
};

export default nexoraAIAPIResponse;
