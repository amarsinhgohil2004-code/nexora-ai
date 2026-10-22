import "./Sidebar.css";
import { MyContext } from "./MyContext";
import { useContext, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import API_URL from "./api";
import logo from "./assets/nexoraailogo.png";

<img src={logo} alt="Nexora AI" />;
export default function Sidebar() {
  const {
    allThreads,
    setallThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChat,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useContext(MyContext);

  const getAllThread = async () => {
    try {
      const response = await fetch(`${API_URL}/api/thread`, {
        credentials: "include",
      });
      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || "Failed to load chats");
      }

      const filterData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      setallThreads(filterData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllThread();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChat([]);
    setIsSidebarOpen(false);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    try {
      const response = await fetch(`${API_URL}/api/thread/${newThreadId}`, {
        credentials: "include",
      });
      const res = await response.json();
      setPrevChat(res.message || []);
      setNewChat(false);
      setReply(null);
      setIsSidebarOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`${API_URL}/api/thread/${threadId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const res = await response.json();

      //update thread re-render
      setallThreads((prev) =>
        prev.filter((thread) => thread.threadId != threadId),
      );

      if (threadId == currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <section className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <button onClick={createNewChat}>
        <img src={logo} alt="nexora ai logo" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId == currThreadId ? "highlighted" : ""}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation(); //stop event bubling
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>
      <div className="sign">
        <p>By Gohil Amarsinh &hearts;</p>
      </div>
    </section>
  );
}
