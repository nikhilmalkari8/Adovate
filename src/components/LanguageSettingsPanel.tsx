"use client";

import {
  EXPLANATION_STYLE_OPTIONS,
  ANSWER_LANGUAGE_OPTIONS,
  type UserPreferences,
} from "@/lib/user-preferences";
import { isEnglishLanguage } from "@/lib/language-utils";

interface LanguageSettingsPanelProps {
  preferences: UserPreferences;
  onChange: (partial: Partial<UserPreferences>) => void;
  compact?: boolean;
}

export function LanguageSettingsPanel({
  preferences,
  onChange,
  compact = false,
}: LanguageSettingsPanelProps) {
  const isEnglish = isEnglishLanguage(preferences.answerLanguage);
  const primary = ANSWER_LANGUAGE_OPTIONS.filter((l) => l.tier === "primary");
  const regional = ANSWER_LANGUAGE_OPTIONS.filter((l) => l.tier === "regional");

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {/* Language */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Answer language
        </p>
        <div className="flex flex-wrap gap-2">
          {primary.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => onChange({ answerLanguage: lang.value })}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                preferences.answerLanguage === lang.value
                  ? "bg-[var(--primary)] text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--surface)] text-[var(--foreground)] ring-1 ring-[var(--border)] hover:ring-[var(--primary)]/40"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
          Regional
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {regional.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => onChange({ answerLanguage: lang.value })}
              className={`rounded-xl px-3 py-2.5 text-sm transition-all ${
                preferences.answerLanguage === lang.value
                  ? "bg-[var(--primary)] text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--surface)] text-[var(--foreground)] ring-1 ring-[var(--border)] hover:ring-[var(--primary)]/40"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        {!isEnglish && (
          <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Court-spoken {ANSWER_LANGUAGE_OPTIONS.find((l) => l.value === preferences.answerLanguage)?.label.split(" ")[0]} — practical language as advocates use, not literary.
          </p>
        )}
      </div>

      {/* English levels only */}
      {isEnglish ? (
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
            English level
          </p>
          <div className="flex rounded-xl bg-gray-100 p-1">
            {EXPLANATION_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ explanationStyle: opt.value })}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  preferences.explanationStyle === opt.value
                    ? "bg-white text-[var(--primary)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {EXPLANATION_STYLE_OPTIONS.find((o) => o.value === preferences.explanationStyle)?.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
