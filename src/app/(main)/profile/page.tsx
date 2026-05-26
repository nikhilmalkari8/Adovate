"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getUserPreferences,
  setUserPreferences,
  EXPLANATION_STYLE_OPTIONS,
  ANSWER_LANGUAGE_OPTIONS,
  type UserPreferences,
} from "@/lib/user-preferences";
import { getChatSessions } from "@/lib/chat-history";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    setPrefs(getUserPreferences());
    const sessions = getChatSessions();
    setQuestionCount(
      sessions.reduce(
        (n, s) => n + s.messages.filter((m) => m.role === "user").length,
        0
      )
    );
  }, []);

  const updatePref = (partial: Partial<UserPreferences>) => {
    const next = setUserPreferences(partial);
    setPrefs(next);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const primaryLanguages = ANSWER_LANGUAGE_OPTIONS.filter((l) => l.tier === "primary");
  const regionalLanguages = ANSWER_LANGUAGE_OPTIONS.filter((l) => l.tier === "regional");

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20">
      <div className="border-b bg-white p-4">
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Your preferences for legal research</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || "U"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.fullName || "Advocate"}
              </h2>
              <p className="text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{questionCount}</p>
              <p className="text-sm text-gray-500">Questions Asked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{getChatSessions().length}</p>
              <p className="text-sm text-gray-500">Saved Chats</p>
            </div>
          </div>
        </div>

        {/* Explanation style */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">How should answers be explained?</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose the language level that suits you best
          </p>
          <div className="mt-4 space-y-2">
            {EXPLANATION_STYLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                  prefs.explanationStyle === opt.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={opt.value}
                  checked={prefs.explanationStyle === opt.value}
                  onChange={() => updatePref({ explanationStyle: opt.value })}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Answer language */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">Answer language</h3>
          <p className="mt-1 text-sm text-gray-500">
            GPT will respond in this language. Legal citations stay in English.
          </p>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">
            Primary
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {primaryLanguages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => updatePref({ answerLanguage: lang.value })}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  prefs.answerLanguage === lang.value
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-400">
            Regional languages
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported via GPT. Quality is best for Hindi; regional languages work well for
            explanations but always verify legal citations in English.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {regionalLanguages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => updatePref({ answerLanguage: lang.value })}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm transition-colors ${
                  prefs.answerLanguage === lang.value
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
