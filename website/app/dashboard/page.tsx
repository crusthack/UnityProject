"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getEveryUserInfo, UserInfoResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/logout-button";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, isLoading: authLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<UserInfoResponse[]>([]);
  const [isFetchingAll, setIsFetchingAll] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-800">대시보드</h1>
            <LogoutButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 토큰 표시 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">현재 인증 토큰</h2>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs break-all border border-gray-200 h-40 overflow-y-auto">
                {token}
              </div>
            </div>

            {/* 내 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">내 정보 (JSON)</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto font-mono text-xs h-40">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* 모든 사용자 정보 조회 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-700">모든 사용자 목록</h2>
              <Button
                onClick={handleFetchAllUsers}
                isLoading={isFetchingAll}
                className="w-auto px-6"
              >
                목록 불러오기
              </Button>
            </div>

            {allUsers.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">No</th>
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {allUsers.map((u) => (
                      <tr key={u.userNo} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{u.userNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{u.userID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(u.created).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
                버튼을 눌러 전체 사용자 목록을 동기화하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

