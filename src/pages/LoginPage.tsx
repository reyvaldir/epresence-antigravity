import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
        {isLogin ? (
          <>
            <SignIn redirectUrl="/dashboard" />
            <div className="mt-4 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </button>
            </div>
          </>
        ) : (
          <>
            <SignUp redirectUrl="/dashboard" />
            <div className="mt-4 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
