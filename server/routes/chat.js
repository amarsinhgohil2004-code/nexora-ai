import express from "express";
import Thread from "../models/Thread.js";
import nexoraAIAPIResponse from "../utils/nexoraai.js";
const router = express.Router();

//test
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "xyz",
            title: "testing mongo atlas new db"
        });
        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed save data" })
    }
});

//get all threads
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        //decending order of updatedAt... most recent data on top
        res.json(threads);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fatch thread" });
    }
})

//get specific threads
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId });
        //decending order of updatedAt... most recent data on top
        if (!thread) {
            res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "threads not found" });
    }
})

//delete specific threads
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });
        //decending order of updatedAt... most recent data on top
        if (!deletedThread) {
            res.status(404).json({ error: "Thread not found and Not delete" });
        }
        res.status(200).json({ success: "Thread successfully deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "threads not found" });
    }
})

//create chat 
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
        res.status(400).json({ error: "missing required filled" });
    }
    try {
        let thread = await Thread.findOne({ threadId });
        //decending order of updatedAt... most recent data on top
        if (!thread) {
            thread = new Thread({
                threadId,
                title: message,
                message: [{ role: "user", content: message }]
            })
        } else {
            thread.message.push({ role: "user", content: message });
        }

        const assistantReply = await nexoraAIAPIResponse(message);
        thread.message.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: assistantReply });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "something went wrong" });
    }
})

export default router;