// API 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7155/api";

interface SignUpData {
  userID: string;
  password: string;
  passwordConfirm: string;
}

interface LoginData {
  userID: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user?: {
    id: string;
    userID: string;
    name?: string;
  };
}

export interface UserInfo {
  id: string;
  userID: string;
  name?: string;
  [key: string]: any;
}

// 회원가입
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/Auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "회원가입 실패");
  }

  return response.json();
}

// 로그인
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "로그인 실패");
  }

  return response.json();
}

// 사용자 정보 조회
export async function getUserInfo(token: string): Promise<UserInfo> {
  const response = await fetch(`${API_BASE_URL}/user/info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "사용자 정보 조회 실패");
  }

  return response.json();
}

// 로그아웃
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
