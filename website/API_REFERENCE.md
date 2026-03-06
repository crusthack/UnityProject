# 🔌 API 호출 가이드 및 청크 분석

## 📡 API 호출 함수들

모든 API 호출 함수는 `lib/api.ts`에 정의되어 있습니다.

### 1. 회원가입 함수

```typescript
signUp(data: SignUpData): Promise<AuthResponse>
```

**사용 예시:**
```typescript
import { signUp } from "@/lib/api";

const response = await signUp({
  email: "user@example.com",
  password: "password123",
  name: "사용자이름"
});

// response 형태:
// {
//   token: "jwt_token_here",
//   user: {
//     id: "user_id",
//     email: "user@example.com",
//     name: "사용자이름"
//   }
// }
```

### 2. 로그인 함수

```typescript
login(data: LoginData): Promise<AuthResponse>
```

**사용 예시:**
```typescript
import { login } from "@/lib/api";

const response = await login({
  email: "user@example.com",
  password: "password123"
});

// response 형태: 회원가입과 동일
```

### 3. 사용자 정보 조회 함수

```typescript
getUserInfo(token: string): Promise<UserInfo>
```

**사용 예시:**
```typescript
import { getUserInfo } from "@/lib/api";

const userInfo = await getUserInfo(token);

// response 형태:
// {
//   id: "user_id",
//   email: "user@example.com",
//   name: "사용자이름",
//   ... (API에서 반환하는 추가 필드들)
// }
```

### 4. 로그아웃 함수

```typescript
logout(token: string): Promise<void>
```

**사용 예시:**
```typescript
import { logout } from "@/lib/api";

await logout(token);
```

## 🍪 쿠키 관리 함수

`lib/cookies.ts`에서 제공하는 함수들:

### JWT 토큰 저장

```typescript
import { setJWTCookie } from "@/lib/cookies";

// 기본값: 7일 후 만료
setJWTCookie(token);

// 커스텀 만료 기간 설정 (일 단위)
setJWTCookie(token, 14); // 14일 후 만료
```

### JWT 토큰 조회

```typescript
import { getJWTCookie } from "@/lib/cookies";

const token = getJWTCookie();
if (!token) {
  console.log("토큰이 없습니다");
}
```

### JWT 토큰 삭제

```typescript
import { removeJWTCookie } from "@/lib/cookies";

removeJWTCookie();
```

## 🔐 인증 상태 관리 (Context)

`lib/auth-context.tsx`에서 제공하는 Hook:

### useAuth Hook

```typescript
import { useAuth } from "@/lib/auth-context";

export function MyComponent() {
  const {
    user,        // 현재 로그인한 사용자 (User | null)
    token,       // JWT 토큰 (string | null)
    isLoading,   // 로딩 중 여부 (boolean)
    isLoggedIn,  // 로그인 여부 (boolean)
    setUser,     // 사용자 정보 설정 함수
    setToken,    // 토큰 설정 함수 (자동으로 쿠키 저장)
    logout       // 로그아웃 함수
  } = useAuth();
  
  return (
    <div>
      {isLoggedIn ? (
        <>
          <p>{user?.email} 님, 환영합니다!</p>
          <button onClick={logout}>로그아웃</button>
        </>
      ) : (
        <p>로그인이 필요합니다</p>
      )}
    </div>
  );
}
```

## 📋 전체 인증 플로우

### 1. 회원가입 플로우
```
User Input (이메일, 비밀번호, 이름)
    ↓
signUp() 함수 호출
    ↓
백엔드 API: POST /api/auth/signup
    ↓
JWT 토큰 + 사용자 정보 반환
    ↓
setToken() 함수로 토큰 저장 (쿠키에 자동 저장)
    ↓
setUser() 함수로 사용자 정보 저장
    ↓
대시보드로 이동
```

### 2. 로그인 플로우
```
User Input (이메일, 비밀번호)
    ↓
login() 함수 호출
    ↓
백엔드 API: POST /api/auth/login
    ↓
JWT 토큰 + 사용자 정보 반환
    ↓
setToken() 함수로 토큰 저장 (쿠키에 자동 저장)
    ↓
setUser() 함수로 사용자 정보 저장
    ↓
대시보드로 이동
```

### 3. 사용자 정보 조회 플로우
```
대시보드 페이지 로드
    ↓
useAuth() Hook에서 토큰 가져오기
    ↓
토큰 없으면 로그인 페이지로 리다이렉트
    ↓
getUserInfo(token) 호출
    ↓
백엔드 API: GET /api/user/info (Authorization: Bearer {token})
    ↓
사용자 정보 반환
    ↓
JSON 형식으로 화면에 표시
```

### 4. 로그아웃 플로우
```
로그아웃 버튼 클릭
    ↓
logout() 함수 호출
    ↓
logout() API 호출 (선택사항)
    ↓
토큰 쿠키에서 제거
    ↓
user, token 상태 초기화
    ↓
로그인 페이지로 이동
```

## 🛠️ 디버깅 팁

### 토큰 확인
브라우저의 개발 도구 → Application → Cookies → auth_token 확인

### API 응답 확인
```typescript
try {
  const response = await login(formData);
  console.log("API 응답:", response);
} catch (err) {
  console.error("API 오류:", err);
}
```

### 상태 확인
```typescript
const { user, token, isLoggedIn } = useAuth();
console.log({ user, token, isLoggedIn });
```

## 🚨 에러 처리

모든 API 함수는 오류 발생 시 Error를 throw합니다:

```typescript
try {
  const response = await login(data);
} catch (err) {
  if (err instanceof Error) {
    console.error("에러 메시지:", err.message);
  }
}
```

---

더 정보가 필요하신가요? `API_GUIDE.md`를 참고하세요.
