"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

const sampleQuestions = [
  { label: "Article 21", query: "What does Article 21 of the Constitution say?" },
  { label: "Section 302 IPC", query: "Explain Section 302 of IPC" },
  { label: "Bail Process", query: "What is the procedure for bail in criminal cases?" },
  { label: "Writ Petition", query: "How to file a writ petition?" },
  { label: "Section 498A", query: "Explain Section 498A IPC" },
  { label: "Fundamental Rights", query: "What are the fundamental rights in India?" },
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question.trim(),
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col bg-[var(--background)]">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 animate-fade-in">
          <div className="w-full max-w-2xl">
            {/* Hero Section */}
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-4xl shadow-lg">
                ⚖️
              </div>
              <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
                Legal Research Assistant
              </h1>
              <p className="text-[var(--muted)]">
                Ask any question about Indian law, Constitution, IPC, CrPC, and more
              </p>
            </div>

            {/* Input Section */}
            <div className="mb-8">
              <form onSubmit={handleFormSubmit} className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a legal question..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-4 pr-14 text-lg text-[var(--foreground)] placeholder-[var(--muted)] shadow-sm transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md transition-all hover:bg-[var(--primary-dark)] hover:shadow-lg disabled:bg-gray-300 disabled:shadow-none"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Sample Questions */}
            <div>
              <p className="mb-3 text-center text-sm font-medium text-[var(--muted)]">
                Try these questions
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(q.query)}
                    className="rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 hover:shadow-md active:scale-[0.98]"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`flex animate-slide-up ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {message.content}
                    </p>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 border-t border-white/20 pt-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                          References
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.citations.map((citation, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-lg bg-[var(--accent)]/20 px-2.5 py-1 text-xs font-medium text-[var(--accent)]"
                            >
                              📜 {citation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1.5">
                        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)]" style={{ animationDelay: "0ms" }} />
                        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)]" style={{ animationDelay: "150ms" }} />
                        <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--primary)]" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-sm text-[var(--muted)]">Researching...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Bar */}
          <div className="fixed bottom-16 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-lg">
            <form onSubmit={handleFormSubmit} className="mx-auto flex max-w-3xl gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask another question..."
                className="flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-[var(--foreground)] placeholder-[var(--muted)] transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-[var(--primary-dark)] hover:shadow-lg disabled:bg-gray-300 disabled:shadow-none"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
