import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import API_URL from "./api";
export default function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChat,
    setPrevChat,
    setNewChat,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getReply = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setNewChat(false);

    const option = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch(`${API_URL}/api/chat`, option);
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || "Failed to get AI response");
      }

      setReply(res.reply);
    } catch (err) {
      console.error("Chat API error:", err);
      setReply("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //append new chat
  useEffect(() => {
    if (prompt && reply) {
      setPrevChat((prevChat) => [
        ...prevChat,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }
    setPrompt("");
  }, [reply]);

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="chatWindow">
      <div className="navbar">
        <button
          type="button"
          className="menuButton"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle chat sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <span className="brandName">
          Nexora AI
          <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItems">
            <i className="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan
          </div>
          <div className="dropDownItems">
            <i className="fa-solid fa-gear"></i>Settings
          </div>
          <div className="dropDownItems">
            <i className="fa-solid fa-right-from-bracket"></i>Log Out
          </div>
        </div>
      )}
      <Chat></Chat>

      <ScaleLoader color="#fff" loading={loading}></ScaleLoader>

      <div className="chatInput">
        <div className="inputBox">
          <input
            type="text"
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>

        <p className="info">
          Nexora AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
