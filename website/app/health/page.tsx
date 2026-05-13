"use client";

import { useState, useEffect, useRef } from "react";
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

  const fetchHealth = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getHealth();
      setHealth(data);
      setNextRefresh(30);

      // 시간 계산 로직
      const serverTime = new Date(data.serverTime);
      const localTime = new Date();
      
      // 서버 시간 - 로컬 시간의 차이를 저장
      timeOffsetRef.current = serverTime.getTime() - localTime.getTime();

      // 업타임 문자열을 통해 서버가 구동된 절대 시점 계산 (대략적)
      // data.uptime이 "00:05:30" 같은 형식이라고 가정할 때의 처리입니다.
      // 서버에서 직접 'startTime'을 내려주면 더 정확하지만, 없다면 현재 서버시간에서 업타임을 뺍니다.
      const uptimeMs = parseUptimeToMs(data.uptime);
      serverStartTimeRef.current = new Date(serverTime.getTime() - uptimeMs);

    } catch (err) {
      setError(err instanceof Error ? err.message : "서버 상태를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

// 업타임 문자열(C# TimeSpan 형식)을 밀리초로 변환
const parseUptimeToMs = (uptime: string) => {
  // 예: "05:30:00", "1.02:03:04.123", "00:00:10.500"
  const regex = /(?:(\d+)\.)?(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/;
  const match = uptime.match(regex);

  if (match) {
    const days = parseInt(match[1] || "0", 10);
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    const seconds = parseInt(match[4], 10);
    const ms = parseInt((match[5] || "0").substring(0, 3), 10); // 밀리초만 추출

    return (
      (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000 + ms
    );
  }
  return 0;
};

// 화면 표시용 (일자 표시 추가)
const formatMsToUptime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  
  return d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`;
};

  useEffect(() => {
    fetchHealth();

    const interval = setInterval(() => {
      const now = new Date();

      setDisplayTime(new Date(now.getTime() + timeOffsetRef.current));

      if (serverStartTimeRef.current) {
        const currentServerTimeMs = now.getTime() + timeOffsetRef.current;
        const diff = currentServerTimeMs - serverStartTimeRef.current.getTime();
        setDisplayUptime(formatMsToUptime(diff));
      }

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
      <div className="max-w-3xl bg-gray-50 rounded-xl p-12 mx-auto">
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

            {/* 서버 시간 및 가동 시간 (실시간 적용 부분) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Uptime</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Server Time</p>
                  <p className="font-medium">
                    {displayTime ? displayTime.toLocaleString() : "계산 중..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="font-medium font-mono text-indigo-600">
                    {displayUptime || health.uptime}
                  </p>
                </div>
              </div>
            </div>

            {/* System Details 섹션 생략 */}
                        {/* 하드웨어 및 인프라 상세 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">System Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 h-full rounded-lg">
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