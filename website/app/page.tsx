"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <div className="max-w-md w-full text-center text-white">
        <h1 className="text-4xl font-bold mb-6">환영합니다</h1>
        <p className="text-lg mb-8 text-blue-100">
          회원가입 또는 로그인하여 시작하세요
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/signup")}
            className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
          >
            회원가입
          </button>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition transform hover:scale-105 border-2 border-white"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
