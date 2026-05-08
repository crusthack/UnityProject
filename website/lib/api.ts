// API 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
// const API_BASE_URL = "https://localhost:5000/api"; 로컬 웹 서버 


interface SignUpData {
  userID: string;
  password: string;
  passwordConfirm: string;
}

interface LoginData {
  userID: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userID: string;
}

export interface UserInfoResponse {
  userNo: string;
  userID: string;
  created: string;
  salt: string;
}

export interface GameServerResponse {
  serverName: string;
  serverCapacity: number;
  currentConnections: number;
}

/**
 * 공통 API 요청 함수
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorDetail = "";
    try {
      // 본문을 텍스트로 먼저 읽어 스트림 소비 문제 방지
      const text = await response.text();
      try {
        // 텍스트를 JSON으로 파싱 시도
        const json = JSON.parse(text);
        errorDetail = typeof json === "string" ? json : JSON.stringify(json, null, 2);
      } catch {
        // JSON 파싱 실패 시 원본 텍스트 사용
        errorDetail = text;
      }
    } catch (e) {
      errorDetail = `에러 응답을 읽는 중 오류가 발생했습니다: ${response.statusText}`;
    }
    
    // 401 응답 시 전역 이벤트를 발생시켜 로그아웃 유도
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    throw new Error(errorDetail || `API 요청 실패: ${response.status}`);
  }

  return response.json();
}

// 회원가입
export async function signUp(data: SignUpData): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/Auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 로그인
export async function login(data: LoginData): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/Auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// 사용자 정보 조회
export async function getUserInfo(token: string): Promise<UserInfoResponse> {
  return apiRequest<UserInfoResponse>("/user/info", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// 모든 사용자 정보 조회
export async function getEveryUserInfo(token: string): Promise<UserInfoResponse[]> {
  return apiRequest<UserInfoResponse[]>("/user/everyuser", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  serverTime: string;
  uptime: string;
  details: {
    os: string;
    framework: string;
    memoryUsageMb: number;
    cpuCount: number;
  };
}
/**
 * 서버 상태 확인
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/Health", {
    method: "GET",
  });
}

export async function getGameServerList(token: string): Promise<GameServerResponse[]>{
    return apiRequest<GameServerResponse[]>("/GameServer/ServerList", {
    method: "GET",
  });
}