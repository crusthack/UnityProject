"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getJWTCookie, setJWTCookie, removeJWTCookie } from "./cookies";
import { getUserInfo, UserInfoResponse } from "./api";

interface AuthContextType {
  user: UserInfoResponse | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setToken: (token: string | null) => void;
  refreshUserInfo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfoResponse | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setTokenState(null);
    removeJWTCookie();
  }, []);

  // API 401 에러 감지 시 자동 로그아웃 처리
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn("인증이 만료되었습니다. 로그아웃 처리합니다.");
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  const fetchUserInfo = useCallback(async (authToken: string) => {
    try {
      const info = await getUserInfo(authToken);
      setUser(info);
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
    }
  }, []);

  // 초기 로딩 시 쿠키에서 토큰 확인 및 유저 정보 조회
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getJWTCookie();
      if (savedToken) {
        setTokenState(savedToken);
        await fetchUserInfo(savedToken);
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUserInfo]);

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      setJWTCookie(newToken);
      await fetchUserInfo(newToken);
    } else {
      removeJWTCookie();
      setUser(null);
    }
  };

  const refreshUserInfo = async () => {
    if (token) {
      await fetchUserInfo(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!token,
        setToken,
        refreshUserInfo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

