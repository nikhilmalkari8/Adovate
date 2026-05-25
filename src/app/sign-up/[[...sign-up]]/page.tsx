import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Advocate</h1>
          <p className="mt-2 text-gray-600">
            Start your legal research journey
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              card: "shadow-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
