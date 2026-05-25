"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "Sorry, I could not find an answer.",
        citations: data.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "An error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="border-b bg-white p-4">
        <h1 className="text-xl font-semibold text-gray-900">Ask Legal Questions</h1>
        <p className="text-sm text-gray-500">
          Ask about Indian Constitution, Acts, Sections, and Legal Procedures
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mb-4 text-5xl">⚖️</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Welcome to Legal Research
              </h2>
              <p className="mb-6 text-gray-600">
                Ask any question about Indian law, constitutional provisions, or legal procedures.
              </p>
              <div className="space-y-2 text-left text-sm text-gray-500">
                <p className="rounded-lg bg-gray-100 p-3">
                  &quot;What does Article 21 of the Constitution say?&quot;
                </p>
                <p className="rounded-lg bg-gray-100 p-3">
                  &quot;Explain Section 302 of IPC&quot;
                </p>
                <p className="rounded-lg bg-gray-100 p-3">
                  &quot;What is the procedure for filing a writ petition?&quot;
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow-sm border"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-2">
                      <p className="text-xs font-medium text-gray-500">
                        References:
                      </p>
                      <ul className="mt-1 space-y-1">
                        {message.citations.map((citation, idx) => (
                          <li key={idx} className="text-xs text-gray-600">
                            • {citation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a legal question..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
