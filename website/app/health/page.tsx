"use client";

import { useState, useEffect } from "react";
import { getHealth, HealthResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextRefresh, setNextRefresh] = useState(30);

  const fetchHealth = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getHealth();
      setHealth(data);
      setNextRefresh(30); // 갱신 성공 시 타이머 리셋
    } catch (err) {
      setError(err instanceof Error ? err.message : "서버 상태를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // 1초마다 타이머 감소 및 0초 시 갱신
    const interval = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          fetchHealth();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-blue-500 via-red-950 to-purple-600 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Health</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "갱신 중..." : `${nextRefresh}초 후 자동 갱신`}
            </p>
          </div>
          <Button 
            onClick={fetchHealth} 
            isLoading={isLoading} 
            className="w-auto px-4"
            variant="secondary"
          >
            새로고침
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">General</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center mt-1">
                    <span className={`h-3 w-3 rounded-full mr-2 ${health.status === "Healthy" ? "bg-green-500" : "bg-red-500"}`}></span>
                    <p className="font-bold text-lg">{health.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-medium">{health.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="font-medium text-blue-600">{health.environment}</p>
                </div>
              </div>
            </div>

            {/* 서버 시간 및 가동 시간 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Uptime</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Server Time</p>
                  <p className="font-medium">{new Date(health.serverTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="font-medium font-mono text-indigo-600">{health.uptime}</p>
                </div>
              </div>
            </div>

            {/* 하드웨어 및 인프라 상세 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">System Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">OS</p>
                  <p className="text-sm font-semibold truncate" title={health.details.os}>{health.details.os}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Framework</p>
                  <p className="text-sm font-semibold">{health.details.framework}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Memory Usage</p>
                  <p className="text-sm font-semibold">{health.details.memoryUsageMb} MB</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">CPU Cores</p>
                  <p className="text-sm font-semibold">{health.details.cpuCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!health && !isLoading && !error && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-500">
            상태 정보를 가져올 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
