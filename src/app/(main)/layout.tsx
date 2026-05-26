"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { TermsModal } from "@/components/TermsModal";

const tabs = [
  { name: "Ask", href: "/ask", icon: "💬" },
  { name: "Cases", href: "/my-case", icon: "📁" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <TermsModal />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/ask" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-lg shadow-sm">
              ⚖️
            </div>
            <span className="text-lg font-bold text-[var(--foreground)]">Nyay</span>
          </Link>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-5 py-2 transition-all ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>
                  {tab.icon}
                </span>
                <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                  {tab.name}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0 h-0.5 w-8 rounded-full bg-[var(--primary)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
