
import express from "express";
import Thread from "../models/Thread.js";
import nexoraAIAPIResponse from "../utils/nexoraai.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// All chat routes below require login
router.use(requireAuth);

// Get all threads belonging to the logged-in user
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({
            userId: req.userId
        }).sort({ updatedAt: -1 });

        return res.json(threads);
    } catch (error) {
        console.error("Fetch threads error:", error.message);
        return res.status(500).json({
            error: "Failed to fetch threads"
        });
    }
});

// Get one thread belonging to the logged-in user
router.get("/thread/:threadId", async (req, res) => {
    try {
        const thread = await Thread.findOne({
            threadId: req.params.threadId,
            userId: req.userId
        });

        if (!thread) {
            return res.status(404).json({
                error: "Thread not found"
            });
        }

        return res.json(thread);
    } catch (error) {
        console.error("Fetch thread error:", error.message);
        return res.status(500).json({
            error: "Failed to fetch thread"
        });
    }
});

// Delete one thread belonging to the logged-in user
router.delete("/thread/:threadId", async (req, res) => {
    try {
        const deletedThread = await Thread.findOneAndDelete({
            threadId: req.params.threadId,
            userId: req.userId
        });

        if (!deletedThread) {
            return res.status(404).json({
                error: "Thread not found"
            });
        }

        return res.json({
            success: "Thread successfully deleted"
        });
    } catch (error) {
        console.error("Delete thread error:", error.message);
        return res.status(500).json({
            error: "Failed to delete thread"
        });
    }
});

// Create a new chat or continue the user's own chat
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (
        typeof threadId !== "string" ||
        !threadId.trim() ||
        typeof message !== "string" ||
        !message.trim()
    ) {
        return res.status(400).json({
            error: "Thread ID and message are required"
        });
    }

    try {
        let thread = await Thread.findOne({
            threadId,
            userId: req.userId
        });

        // If this ID already belongs to another user,
        // don't allow this user to access that thread.
        if (!thread) {
            const existingThread = await Thread.findOne({
                threadId
            });

            if (existingThread) {
                return res.status(404).json({
                    error: "Thread not found"
                });
            }

            thread = new Thread({
                threadId,
                userId: req.userId,
                title: message.trim().slice(0, 100),
                message: [{
                    role: "user",
                    content: message.trim()
                }]
            });
        } else {
            thread.message.push({
                role: "user",
                content: message.trim()
            });
        }

        const assistantReply = await nexoraAIAPIResponse(
            message.trim()
        );

        thread.message.push({
            role: "assistant",
            content: assistantReply
        });

        thread.updatedAt = new Date();

        await thread.save();

        return res.json({
            reply: assistantReply
        });
    } catch (error) {
        console.error("Chat error:", error.message);
        return res.status(500).json({
            error: "Something went wrong"
        });
    }
});

export default router;
