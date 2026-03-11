"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getUserInfo, getEveryUserInfo, UserInfoResponse } from "@/lib/api";
import LogoutButton from "@/components/logout-button";

export default function DashboardPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [allUsers, setAllUsers] = useState<UserInfoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
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

  const handleFetchAllUsers = async () => {
    if (!token) return;
    
    setIsFetchingAll(true);
    try {
      const users = await getEveryUserInfo(token);
      setAllUsers(users);
    } catch (err) {
      alert(err instanceof Error ? err.message : "전체 사용자 정보를 가져오는데 실패했습니다.");
    } finally {
      setIsFetchingAll(false);
    }
  };

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

          {/* 내 정보 JSON 데이터 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">내 정보 (JSON)</h2>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto font-mono text-sm">
              <pre>{JSON.stringify(userInfo, null, 2)}</pre>
            </div>
          </div>

          {/* 모든 사용자 정보 조회 버튼 및 테이블 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-700">모든 사용자 목록</h2>
              <button
                onClick={handleFetchAllUsers}
                disabled={isFetchingAll}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:bg-indigo-400"
              >
                {isFetchingAll ? "가져오는 중..." : "모든 사용자 정보 조회"}
              </button>
            </div>

            {allUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User No</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <tr key={user.userNo}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.salt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                버튼을 눌러 사용자 목록을 불러오세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
