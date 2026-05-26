"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getUserPreferences,
  setUserPreferences,
  type UserPreferences,
} from "@/lib/user-preferences";
import { getChatSessions } from "@/lib/chat-history";
import { LanguageSettingsPanel } from "@/components/LanguageSettingsPanel";

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

    const onPrefs = (e: Event) => {
      setPrefs((e as CustomEvent<UserPreferences>).detail);
    };
    window.addEventListener("nyay-preferences-updated", onPrefs);
    return () => window.removeEventListener("nyay-preferences-updated", onPrefs);
  }, []);

  const updatePref = (partial: Partial<UserPreferences>) => {
    setPrefs(setUserPreferences(partial));
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20">
      <div className="border-b bg-white p-4">
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Language preferences for answers</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
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

          <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
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

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <LanguageSettingsPanel preferences={prefs} onChange={updatePref} />
        </div>
      </div>
    </div>
  );
}
