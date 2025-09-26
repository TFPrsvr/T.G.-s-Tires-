import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back to T.G.'s Tires</h1>
          <p className="text-gray-600">Sign in to access your tire marketplace dashboard</p>
        </div>
        <SignIn
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl border-0 bg-white/80 backdrop-blur-sm",
              formFieldInput: "w-auto max-w-xs",
              formFieldInputShowPasswordButton: "relative",
              formField: "flex flex-col items-start",
              formFieldRow: "flex items-center gap-2 w-full max-w-xs",
              passwordInput: "flex-1 min-w-0",
            },
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            }
          }}
        />
      </div>
    </div>
  );
}