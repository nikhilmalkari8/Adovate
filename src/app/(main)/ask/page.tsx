"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { SourceBadge } from "@/components/SourceBadge";
import {
  getUserPreferences,
  setUserPreferences,
  ANSWER_LANGUAGE_OPTIONS,
  EXPLANATION_STYLE_OPTIONS,
  type UserPreferences,
} from "@/lib/user-preferences";
import { isEnglishLanguage } from "@/lib/language-utils";
import { LanguageSettingsPanel } from "@/components/LanguageSettingsPanel";
import {
  getChatSessions,
  getActiveSessionId,
  setActiveSessionId,
  createChatSession,
  saveChatSession,
  deleteChatSession,
  startNewChat,
  type ChatSession,
  type StoredMessage,
} from "@/lib/chat-history";

interface Message extends StoredMessage {
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(getUserPreferences());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);

  const refreshSessions = useCallback(() => {
    setSessions(getChatSessions());
  }, []);

  useEffect(() => {
    refreshSessions();
    const activeId = getActiveSessionId();
    if (activeId) {
      const session = getChatSessions().find((s) => s.id === activeId);
      if (session) {
        setSessionId(session.id);
        setMessages(session.messages);
      }
    }

    const onPrefs = (e: Event) => {
      setPreferences((e as CustomEvent<UserPreferences>).detail);
    };
    window.addEventListener("nyay-preferences-updated", onPrefs);
    return () => window.removeEventListener("nyay-preferences-updated", onPrefs);
  }, [refreshSessions]);

  const persistSession = useCallback(
    (id: string, msgs: Message[], title?: string) => {
      const existing = getChatSessions().find((s) => s.id === id);
      const firstUser = msgs.find((m) => m.role === "user");
      saveChatSession({
        id,
        title:
          title ||
          existing?.title ||
          (firstUser?.content.slice(0, 60) ?? "New conversation") +
            (firstUser && firstUser.content.length > 60 ? "…" : ""),
        messages: msgs.filter((m) => !m.isStreaming).map(({ isStreaming: _, ...m }) => m),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      refreshSessions();
    },
    [refreshSessions]
  );

  const scrollToBottom = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleNewChat = () => {
    startNewChat();
    setSessionId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const loadSession = (session: ChatSession) => {
    setSessionId(session.id);
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatSession(id);
    refreshSessions();
    if (sessionId === id) handleNewChat();
  };

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = createChatSession(question.trim());
      currentSessionId = session.id;
      setSessionId(session.id);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question.trim(),
    };

    const assistantMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantMessageId, role: "assistant" as const, content: "", isStreaming: true },
    ]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const prefs = getUserPreferences();

      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          history,
          stream: true,
          explanationStyle: prefs.explanationStyle,
          answerLanguage: prefs.answerLanguage,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullContent = "";
      let citations: string[] | undefined;
      let sourceType: "verified" | "general" = "general";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "meta") {
                sourceType = data.sourceType;
                citations = data.citations;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, sourceType, citations }
                      : m
                  )
                );
              } else if (data.type === "content") {
                fullContent += data.content;
                setStreamingContent(fullContent);
                scrollToBottom();
              } else if (data.type === "done") {
                const contentLines = fullContent.split("\n");
                const suggestions: string[] = [];
                const answerLines: string[] = [];

                for (const contentLine of contentLines) {
                  if (contentLine.trim().startsWith("→")) {
                    suggestions.push(contentLine.trim().substring(1).trim());
                  } else {
                    answerLines.push(contentLine);
                  }
                }

                const finalContent = answerLines.join("\n").trim();
                const assistantMsg: Message = {
                  id: assistantMessageId,
                  role: "assistant",
                  content: finalContent,
                  suggestions: suggestions.length > 0 ? suggestions : undefined,
                  sourceType,
                  citations,
                };

                setMessages((prev) => {
                  const withoutPlaceholder = prev.filter((m) => m.id !== assistantMessageId);
                  const completed = [...withoutPlaceholder, assistantMsg];
                  if (currentSessionId) persistSession(currentSessionId, completed);
                  return completed;
                });
                setStreamingContent("");
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      const errorMsg: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "Something went wrong. Please try again.",
        sourceType: "general",
      };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...errorMsg, isStreaming: false } : m
        )
      );
      setStreamingContent("");
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
  const showSuggestions =
    lastMessage?.role === "assistant" &&
    !lastMessage?.isStreaming &&
    lastMessage?.suggestions?.length;

  const languageLabel =
    ANSWER_LANGUAGE_OPTIONS.find((o) => o.value === preferences.answerLanguage)?.label ??
    "English";

  const settingsSummary = isEnglishLanguage(preferences.answerLanguage)
    ? `${EXPLANATION_STYLE_OPTIONS.find((o) => o.value === preferences.explanationStyle)?.label} · English`
    : languageLabel.split("(")[0].trim();

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    setPreferences(setUserPreferences(partial));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col bg-[var(--background)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(true)}
            className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-gray-100"
          >
            History
          </button>
          <button
            onClick={handleNewChat}
            className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/5"
          >
            New
          </button>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-gray-200"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] text-white">
            Aa
          </span>
          {settingsSummary}
        </button>
      </div>

      {/* Settings sheet */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-[var(--surface)] p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-1 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Language</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-full p-2 text-[var(--muted)] hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <LanguageSettingsPanel
              preferences={preferences}
              onChange={updatePreferences}
              compact
            />
            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full rounded-xl bg-[var(--primary)] py-3.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* History drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-[var(--surface)] shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold text-[var(--foreground)]">Chat History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sessions.length === 0 ? (
                <p className="p-4 text-center text-sm text-[var(--muted)]">
                  No past conversations yet
                </p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className={`mb-1 flex w-full items-start justify-between rounded-xl p-3 text-left transition-colors hover:bg-gray-50 ${
                      sessionId === session.id ? "bg-[var(--primary)]/10" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">
                        {session.title}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(session.updatedAt).toLocaleDateString()} ·{" "}
                        {session.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="ml-2 shrink-0 rounded p-1 text-xs text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 animate-fade-in">
          <div className="w-full max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-4xl shadow-lg">
                ⚖️
              </div>
              <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
                Ask me anything about Indian law
              </h1>
              <p className="text-[var(--muted)]">
                Constitution, IPC, CrPC, procedures, case strategies
              </p>
            </div>

            <div className="mb-8">
              <form onSubmit={handleFormSubmit} className="relative">
                <textarea
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
                  className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md transition-all hover:bg-[var(--primary-dark)] disabled:bg-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>

            <div>
              <p className="mb-3 text-center text-sm font-medium text-[var(--muted)]">
                Or try one of these
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(q.query)}
                    className="rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 active:scale-[0.98]"
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
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 pb-40">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
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
                    {message.role === "assistant" && !message.isStreaming && message.sourceType && (
                      <div className="mb-3">
                        <SourceBadge sourceType={message.sourceType} />
                      </div>
                    )}

                    {message.role === "user" ? (
                      <p className="text-[15px] leading-relaxed">{message.content}</p>
                    ) : message.isStreaming ? (
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {streamingContent || (
                          <span className="text-[var(--muted)]">Thinking...</span>
                        )}
                        {streamingContent && (
                          <span className="inline-block w-0.5 h-5 ml-0.5 bg-[var(--primary)] animate-pulse" />
                        )}
                      </div>
                    ) : (
                      <div className="text-[15px] leading-relaxed">
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
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {message.citations && message.citations.length > 0 && !message.isStreaming && (
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

              {showSuggestions && (
                <div className="pl-11">
                  <p className="mb-2 text-xs font-medium text-[var(--muted)]">Continue exploring:</p>
                  <div className="flex flex-wrap gap-2">
                    {lastMessage.suggestions?.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmit(suggestion)}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm transition-all hover:border-[var(--primary)]"
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

          <div className="fixed bottom-16 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]/95 p-4 backdrop-blur-lg">
            <form onSubmit={handleFormSubmit} className="mx-auto flex max-w-3xl gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up..."
                className="flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 focus:border-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-[var(--primary)] px-6 py-3.5 text-white shadow-md hover:bg-[var(--primary-dark)] disabled:bg-gray-300"
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
