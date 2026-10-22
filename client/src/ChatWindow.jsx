import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
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
    user,
    authChecked,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const getReply = async () => {
    if (!authChecked) return;

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
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
      const response = await fetch(`${API_URL}/api/chat`, {
        ...option,
        credentials: "include",
      });
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

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
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

        <div className="navbarAuth">
          {authChecked && !user ? (
            <>
              <button
                className="authNavButton"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="authNavButton registerNavButton"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </>
          ) : user ? (
            <div className="userIconDiv" onClick={handleProfileClick}>
              <span className="userIcon">
                <i className="fa-solid fa-user"></i>
              </span>
            </div>
          ) : null}
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
          <div className="dropDownItems" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>Log Out
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <div className="loginPromptOverlay">
          <div className="loginPrompt">
            <button
              className="closePrompt"
              onClick={() => setShowLoginPrompt(false)}
              aria-label="Close login prompt"
            >
              &times;
            </button>

            <h3>Start chatting with Nexora AI</h3>
            <p>Please log in or create an account to send messages.</p>

            <button onClick={() => navigate("/login")}>Login</button>

            <button onClick={() => navigate("/register")}>
              Create account
            </button>
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
