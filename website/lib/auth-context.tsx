"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getJWTCookie, setJWTCookie, removeJWTCookie, getUserCookie, setUserCookie, removeUserCookie } from "./cookies";

interface User {
  id: string;
  userID: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩 시 쿠키에서 토큰과 사용자 정보 확인
  useEffect(() => {
    const savedToken = getJWTCookie();
    const savedUser = getUserCookie();
    
    if (savedToken) {
      setTokenState(savedToken);
    }
    
    if (savedUser) {
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      setJWTCookie(newToken);
    } else {
      removeJWTCookie();
    }
  };

  const setUserState = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      setUserCookie(newUser);
    } else {
      removeUserCookie();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    removeJWTCookie();
    removeUserCookie();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!token,
        setUser: setUserState,
        setToken,
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
