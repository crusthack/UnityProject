"use client";

const JWT_COOKIE_NAME = "auth_token";
const EXPIRY_DAYS = 7;

// JWT 토큰을 쿠키에 저장
export function setJWTCookie(token: string, expiryDays: number = EXPIRY_DAYS) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  document.cookie = `${JWT_COOKIE_NAME}=${token};path=/;expires=${expiryDate.toUTCString()};SameSite=Strict`;
}

// 쿠키에서 JWT 토큰 가져오기
export function getJWTCookie(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === JWT_COOKIE_NAME) {
      return value || null;
    }
  }
  return null;
}

// JWT 토큰 삭제 (로그아웃)
export function removeJWTCookie() {
  document.cookie = `${JWT_COOKIE_NAME}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}
