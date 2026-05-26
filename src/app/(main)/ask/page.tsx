"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  suggestions?: string[];
  isStreaming?: boolean;
}

const sampleQuestions = [
  { label: "Article 21", query: "What does Article 21 of the Constitution say and why is it so important?" },
  { label: "Section 302 IPC", query: "Explain Section 302 of IPC - when exactly does murder apply?" },
  { label: "Bail Process", query: "Walk me through the bail process in criminal cases" },
  { label: "Writ Petition", query: "How do I file a writ petition and when should I use one?" },
  { label: "Section 498A", query: "What is Section 498A and how is it commonly used?" },
  { label: "Fundamental Rights", query: "Give me an overview of fundamental rights in India" },
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

    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userMessage.content,
          history,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";
      let citations: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === "citations") {
                citations = data.citations;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, citations } : m
                  )
                );
              } else if (data.type === "content") {
                fullContent += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              } else if (data.type === "done") {
                // Parse suggestions from content
                const lines = fullContent.split("\n");
                const suggestions: string[] = [];
                const answerLines: string[] = [];

                for (const line of lines) {
                  if (line.trim().startsWith("→")) {
                    suggestions.push(line.trim().substring(1).trim());
                  } else {
                    answerLines.push(line);
                  }
                }

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content: answerLines.join("\n").trim(),
                          suggestions: suggestions.length > 0 ? suggestions : undefined,
                          isStreaming: false,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: "Something went wrong. Please try again.",
                isStreaming: false,
              }
            : m
        )
      );
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

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = lastMessage?.role === "assistant" && !lastMessage?.isStreaming && lastMessage?.suggestions?.length;

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
                Ask me anything about Indian law
              </h1>
              <p className="text-[var(--muted)]">
                Constitution, IPC, CrPC, procedures, case strategies - I&apos;m here to help
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
                  placeholder="What would you like to know?"
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
                Or try one of these
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
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-40">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`flex animate-slide-up ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {message.role === "assistant" && (
                    <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-sm">
                      ⚖️
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md"
                        : "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-[15px] leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-[15px] leading-relaxed">
                        {message.content ? (
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-2">{children}</h3>,
                              p: ({ children }) => <p className="my-2">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              code: ({ children }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-[var(--primary)] pl-4 my-3 italic text-[var(--muted)]">{children}</blockquote>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
                            <span className="text-[var(--muted)]">Thinking...</span>
                          </div>
                        )}
                        {message.isStreaming && message.content && (
                          <span className="inline-block w-2 h-5 ml-1 bg-[var(--primary)] animate-pulse" />
                        )}
                      </div>
                    )}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.citations.map((citation, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-[var(--accent)]/15 px-3 py-1 text-xs font-medium text-[var(--accent)]"
                          >
                            📜 {citation}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Follow-up Suggestions */}
              {showSuggestions && (
                <div className="animate-fade-in pl-11">
                  <p className="mb-2 text-xs font-medium text-[var(--muted)]">Continue exploring:</p>
                  <div className="flex flex-wrap gap-2">
                    {lastMessage.suggestions?.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmit(suggestion)}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                      >
                        {suggestion}
                      </button>
                    ))}
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
                placeholder="Ask a follow-up..."
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
