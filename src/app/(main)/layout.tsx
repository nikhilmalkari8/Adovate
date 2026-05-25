"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const tabs = [
  { name: "Ask", href: "/ask", icon: "💬" },
  { name: "My Case", href: "/my-case", icon: "📁" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/ask" className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="text-xl font-bold text-gray-900">Advocate</span>
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-around">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className={isActive ? "font-medium" : ""}>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
