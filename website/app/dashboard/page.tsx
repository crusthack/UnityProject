"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getUserInfo, UserInfo } from "@/lib/api";
import LogoutButton from "@/components/logout-button";

export default function DashboardPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const info = await getUserInfo(token);
        setUserInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : "사용자 정보를 가져올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [token, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="text-red-600 text-2xl font-bold mb-4">오류 발생</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">대시보드</h1>
            <LogoutButton />
          </div>

          {/* 토큰 표시 */}
          {token && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">현재 JWT</h2>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all">
                {token}
              </div>
            </div>
          )}

          {/* 전체 JSON 데이터 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">전체 데이터 (JSON)</h2>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto font-mono text-sm">
              <pre>{JSON.stringify(userInfo, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
