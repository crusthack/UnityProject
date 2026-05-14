"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getHealth, HealthResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextRefresh, setNextRefresh] = useState(30);

  // 실시간 표시를 위한 상태
  const [displayTime, setDisplayTime] = useState<Date | null>(null);
  const [displayUptime, setDisplayUptime] = useState<string>("");

  // 서버 시간과 로컬 시간의 차이(ms) 및 서버 시작 시점 저장
  const timeOffsetRef = useRef<number>(0);
  const serverStartTimeRef = useRef<Date | null>(null);

  /**
   * 밀리초를 다시 HH:MM:SS (또는 d HH:MM:SS)로 변환
   */
  const formatMsToUptime = (ms: number): string => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    
    return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
  };

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getHealth();
      setHealth(data);
      setNextRefresh(30);

      if (data && data.serverTime) {
        const serverTime = new Date(data.serverTime);
        const localTime = new Date();
        
        // 1. 서버 시간과 클라이언트 로컬 시간의 오차 저장
        timeOffsetRef.current = serverTime.getTime() - localTime.getTime();

        // 2. 서버가 가동된 시점(StartTime) 계산
        // 이제 파싱 없이 data.uptimeMs를 바로 사용합니다.
        const uptimeMs = data.uptimeMs || 0;
        serverStartTimeRef.current = new Date(serverTime.getTime() - uptimeMs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "서버 상태를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    const interval = setInterval(() => {
      const now = new Date();

      // 실시간 서버 시간 업데이트 (오차 보정)
      const currentServerTimeMs = now.getTime() + timeOffsetRef.current;
      setDisplayTime(new Date(currentServerTimeMs));

      // 실시간 업타임 업데이트 (가동 시점으로부터의 차이)
      if (serverStartTimeRef.current) {
        const diff = currentServerTimeMs - serverStartTimeRef.current.getTime();
        setDisplayUptime(formatMsToUptime(diff));
      }

      // 자동 갱신 타이머
      setNextRefresh((prev) => {
        if (prev <= 1) {
          fetchHealth();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-red-950 to-purple-600 py-12 px-4">
      <div className="max-w-3xl bg-gray-50 rounded-xl p-8 md:p-12 mx-auto shadow-2xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Health</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "갱신 중..." : `${nextRefresh}초 후 자동 갱신`}
            </p>
          </div>
          <Button 
            onClick={fetchHealth} 
            disabled={isLoading} 
            className="w-auto px-4"
            variant="secondary"
          >
            새로고침
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium text-gray-700">{health.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Environment</p>
                    <p className="font-medium text-blue-600">{health.environment || "Production"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Uptime</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Server Time</p>
                  <p className="font-medium text-gray-700">
                    {displayTime ? displayTime.toLocaleString() : "계산 중..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="font-medium font-mono text-indigo-600 text-xl">
                    {displayUptime || "00:00:00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">System Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">OS</p>
                  <p className="text-sm font-semibold" title={health.details.os}>{health.details.os}</p>
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
                  <p className="text-sm font-semibold">{health.details.cpuCount} Cores</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}