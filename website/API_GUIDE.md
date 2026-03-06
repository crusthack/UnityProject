# Auth App - 회원가입 및 로그인 애플리케이션

회원가입, 로그인, JWT 토큰 관리, 사용자 정보 조회 기능이 포함된 Next.js 애플리케이션입니다.

## 📋 주요 기능

- **회원가입**: 이메일, 비밀번호, 이름으로 새 계정 생성
- **로그인**: 이메일과 비밀번호로 로그인
- **JWT 토큰 관리**: 로그인 성공 시 JWT 토큰을 쿠키로 자동 저장
- **사용자 정보 조회**: 로그인 후 API를 통해 사용자 정보를 받아옴
- **JSON 표시**: 받은 사용자 정보를 JSON 형식으로 화면에 표시
- **로그아웃**: 쿠키와 상태 제거

## 🏗️ 프로젝트 구조

```
app/
├── page.tsx              # 홈 페이지 (회원가입/로그인 버튼)
├── signup/
│   └── page.tsx          # 회원가입 페이지
├── login/
│   └── page.tsx          # 로그인 페이지
├── dashboard/
│   └── page.tsx          # 사용자 정보 대시보드 페이지
└── layout.tsx            # 레이아웃 및 AuthProvider 설정

components/
├── signup-form.tsx       # 회원가입 폼 컴포넌트
├── login-form.tsx        # 로그인 폼 컴포넌트
└── logout-button.tsx     # 로그아웃 버튼 컴포넌트

lib/
├── api.ts               # API 호출 함수 (회원가입, 로그인, 사용자 정보 조회)
├── cookies.ts           # JWT 토큰 쿠키 관리 함수
└── auth-context.tsx     # React Context를 사용한 인증 상태 관리
```

## 🚀 시작하기

### 1. API 설정

`.env.local` 파일을 생성하고 백엔드 API 주소를 설정합니다:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 수정:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 애플리케이션이 시작됩니다.

## 📡 API 연결

### 필요한 API 엔드포인트

#### 1. 회원가입
- **엔드포인트**: `POST /api/auth/signup`
- **요청 바디**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "사용자이름"
  }
  ```
- **응답**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "사용자이름"
    }
  }
  ```

#### 2. 로그인
- **엔드포인트**: `POST /api/auth/login`
- **요청 바디**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **응답**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "사용자이름"
    }
  }
  ```

#### 3. 사용자 정보 조회
- **엔드포인트**: `GET /api/user/info`
- **헤더**:
  ```
  Authorization: Bearer jwt_token_here
  ```
- **응답**:
  ```json
  {
    "id": "user_id",
    "email": "user@example.com",
    "name": "사용자이름",
    "추가_필드": "값"
  }
  ```

#### 4. 로그아웃 (선택)
- **엔드포인트**: `POST /api/auth/logout`
- **헤더**:
  ```
  Authorization: Bearer jwt_token_here
  ```

## 🔐 인증 흐름

1. **홈 페이지** (`/`)
   - 회원가입 또는 로그인 버튼 표시
   - 로그인 상태면 자동으로 대시보드로 이동

2. **회원가입 페이지** (`/signup`)
   - 이메일, 비밀번호, 이름 입력
   - 회원가입 성공 시 JWT 토큰을 쿠키에 저장
   - 자동으로 대시보드로 이동

3. **로그인 페이지** (`/login`)
   - 이메일, 비밀번호 입력
   - 로그인 성공 시 JWT 토큰을 쿠키에 저장
   - 자동으로 대시보드로 이동

4. **대시보드 페이지** (`/dashboard`)
   - 사용자 정보를 API에서 조회
   - 사용자 정보를 화면에 표시 (JSON 형식)
   - 로그아웃 버튼 제공
   - 로그아웃 시 로그인 페이지로 이동

## 💾 토큰 관리

- JWT 토큰은 로그인 성공 후 자동으로 쿠키에 저장됨
- 쿠키 만료 기간: 기본 7일 (변경 가능)
- 모든 API 요청에 자동으로 토큰이 포함됨
- 로그아웃 시 쿠키에서 토큰 제거

## 🛠️ 상태 관리

React Context를 사용하여 전역 인증 상태를 관리합니다:

```tsx
import { useAuth } from "@/lib/auth-context";

export function MyComponent() {
  const { user, token, isLoggedIn, logout } = useAuth();
  
  // 사용 예
}
```

## 📝 사용 가능한 Hook

### `useAuth()`

```tsx
const {
  user,          // 현재 로그인한 사용자 정보
  token,         // JWT 토큰
  isLoading,     // 로딩 상태
  isLoggedIn,    // 로그인 여부
  setUser,       // 사용자 정보 설정
  setToken,      // 토큰 설정 (쿠키 자동 저장)
  logout,        // 로그아웃 함수
} = useAuth();
```

## 🎨 커스터마이징

### API URL 변경
`.env.local` 파일에서 `NEXT_PUBLIC_API_URL` 값을 변경합니다.

### 토큰 만료 기간 변경
[lib/cookies.ts](lib/cookies.ts)에서 `EXPIRY_DAYS` 값을 수정합니다.

### 스타일 변경
각 컴포넌트에서 Tailwind CSS 클래스를 수정합니다.

## 🐛 문제 해결

### CORS 오류
백엔드 API에서 CORS를 올바르게 설정했는지 확인하세요.

### 토큰이 저장되지 않음
브라우저의 쿠키 설정을 확인하고, 개발 도구의 Application 탭에서 쿠키를 확인하세요.

### 사용자 정보를 가져올 수 없음
API 토큰과 권한을 확인하고, API 응답 형식이 올바른지 확인하세요.

## 📦 빌드

```bash
npm run build
```

## 🚀 프로덕션 배포

```bash
npm start
```

---

**개발자 노트**: 이 애플리케이션은 템플릿입니다. 프로덕션 사용 전에 보안 검토를 수행하세요.
