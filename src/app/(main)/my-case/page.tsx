"use client";

import { useState } from "react";

interface Case {
  id: string;
  title: string;
  clientName: string;
  status: "active" | "closed" | "pending";
  createdAt: string;
}

export default function MyCasePage() {
  const [cases] = useState<Case[]>([]);
  const [showNewCase, setShowNewCase] = useState(false);

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20">
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Cases</h1>
            <p className="text-sm text-gray-500">
              Manage your cases and draft documents
            </p>
          </div>
          <button
            onClick={() => setShowNewCase(true)}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Case
          </button>
        </div>
      </div>

      <div className="p-4">
        {cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 text-5xl">📁</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              No cases yet
            </h2>
            <p className="mb-6 max-w-sm text-center text-gray-600">
              Create your first case to start organizing your legal work and
              drafting documents.
            </p>
            <button
              onClick={() => setShowNewCase(true)}
              className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Create Your First Case
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {caseItem.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Client: {caseItem.clientName}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      caseItem.status === "active"
                        ? "bg-green-100 text-green-700"
                        : caseItem.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {caseItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Create New Case
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Case Title
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Property Dispute - Ram vs Shyam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Client's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Court/Forum
                </label>
                <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Select court...</option>
                  <option>Supreme Court of India</option>
                  <option>High Court</option>
                  <option>District Court</option>
                  <option>Sessions Court</option>
                  <option>Magistrate Court</option>
                  <option>Tribunal</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCase(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
