"use client";

const JWT_COOKIE_NAME = "auth_token";
const USER_COOKIE_NAME = "auth_user";
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

// 사용자 정보를 쿠키에 저장
export function setUserCookie(user: any, expiryDays: number = EXPIRY_DAYS) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  const userJson = JSON.stringify(user);
  document.cookie = `${USER_COOKIE_NAME}=${encodeURIComponent(userJson)};path=/;expires=${expiryDate.toUTCString()};SameSite=Strict`;
}

// 쿠키에서 사용자 정보 가져오기
export function getUserCookie(): any | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === USER_COOKIE_NAME) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  return null;
}

// JWT 토큰 삭제 (로그아웃)
export function removeJWTCookie() {
  document.cookie = `${JWT_COOKIE_NAME}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

// 사용자 정보 쿠키 삭제
export function removeUserCookie() {
  document.cookie = `${USER_COOKIE_NAME}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}
