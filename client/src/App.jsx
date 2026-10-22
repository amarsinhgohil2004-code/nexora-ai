import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChat, setPrevChat] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setallThreads] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const providerValue = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChat,
    setPrevChat,
    newChat,
    setNewChat,
    allThreads,
    setallThreads,
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <MyContext.Provider value={providerValue}>
              <div className="app">
                <Sidebar />
                {isSidebarOpen && (
                  <button
                    type="button"
                    className="sidebarBackdrop"
                    aria-label="Close sidebar"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}
                <ChatWindow />
              </div>
            </MyContext.Provider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
