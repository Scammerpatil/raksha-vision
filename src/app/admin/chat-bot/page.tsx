"use client";

import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";
import {
  IconSend,
  IconRobot,
  IconUser,
  IconSparkles,
  IconCircleFilled,
  IconDots,
} from "@tabler/icons-react";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Markdown from "react-markdown";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatBotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    axios.get("/api/chat-bot/start").then((res) => {
      setMessages([{ role: "bot", content: res.data.reply }]);
    });
  }, []);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/chat-bot/chat", {
        message: currentInput,
        history: messages,
      });
      const botMessage: Message = { role: "bot", content: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Title
        title="Chat Bot Management"
        subtitle="You can chat with the AI assistant to get insights about your soldiers and military assets"
      />
      <div className="max-w-4xl mx-auto h-[calc(100vh-15rem)] flex flex-col gap-4">
        {/* Header Info */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-primary-content shadow-lg shadow-primary/20">
              <IconRobot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">
                RakshaVision Assistant
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                <IconCircleFilled
                  size={8}
                  className="text-success animate-pulse"
                />
                Neural Link Active
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle opacity-50">
            <IconDots size={20} />
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden bg-base-200 rounded-3xl border border-base-300 shadow-2xl flex flex-col relative">
          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.map((msg, index) => (
              <div
                className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                key={index}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-xl bg-base-100 border border-base-300 shadow-sm">
                    {msg.role === "bot" ? (
                      <div className="w-full h-full flex items-center justify-center text-primary bg-primary/10">
                        <IconSparkles size={20} />
                      </div>
                    ) : (
                      <img
                        alt="User"
                        src={
                          user?.profileImage ||
                          `https://ui-avatars.com/api/?name=${user?.fullName}`
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="chat-header opacity-40 text-[10px] uppercase font-bold tracking-widest mb-1 mx-2">
                  {msg.role === "bot" ? "RakshaVision System" : user.name}
                </div>

                <div
                  className={`chat-bubble py-3 px-4 shadow-sm border ${
                    msg.role === "user"
                      ? "chat-bubble-primary border-primary/20"
                      : "bg-base-100 text-base-content border-base-300"
                  }`}
                >
                  <div className="prose prose-sm max-w-none text-current leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat chat-start animate-pulse">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <IconRobot size={20} />
                  </div>
                </div>
                <div className="chat-bubble bg-base-100 border-base-content flex items-center py-4">
                  <span className="loading loading-dots loading-sm opacity-50"></span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Input Area */}
          <div className="p-4 bg-base-300">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                className="input input-bordered w-full pr-16 h-14 rounded-2xl border-base-300 bg-base-100 focus:input-primary shadow-inner transition-all overflow-hidden"
                placeholder="Query the financial ledger or ask for assistance..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn btn-primary btn-square absolute right-2 h-10 w-10 min-h-0 rounded-xl shadow-lg shadow-primary/30"
              >
                <IconSend size={18} />
              </button>
            </form>
            <p className="text-[9px] text-center mt-2 opacity-30 font-bold uppercase tracking-[0.2em]">
              RakshaVision may provide architectural insights. Verify critical
              transactions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
