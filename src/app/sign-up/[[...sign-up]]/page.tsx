import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join T.G.'s Tires</h1>
          <p className="text-gray-600">Create your account to start selling tires and yard sale items</p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="clerk-signup-container" style={{ minHeight: '400px' }}>
          <SignUp />
        </div>

      </div>
    </div>
  );
}