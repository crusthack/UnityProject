"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고/홈 */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <span className="text-2xl font-bold">🔐 Auth App</span>
          </Link>

          {/* 네비게이션 링크 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm">{user?.name} 님</span>
                <Link
                  href="/dashboard"
                  className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  대시보드
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  회원가입
                </Link>
                <Link
                  href="/login"
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
