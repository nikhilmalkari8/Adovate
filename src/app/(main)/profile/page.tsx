"use client";

import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

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
        <p className="text-sm text-gray-500">Manage your account settings</p>
      </div>

      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || "U"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.fullName || "Advocate"}
              </h2>
              <p className="text-gray-500">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Quick Stats</h3>
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-500">Questions Asked</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-500">Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-500">Documents</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-gray-900">Professional Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete your profile to get personalized assistance
              </p>
              <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Complete Profile
              </button>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-gray-900">Preferences</h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Language</span>
                  <select className="rounded border px-2 py-1 text-sm">
                    <option>English</option>
                    <option>हिंदी</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
