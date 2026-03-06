# 🚀 빠른 시작 가이드

## 📌 설치 및 실행

### Step 1: 개발 환경 준비

```bash
# 프로젝트에 있는 경우
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열면 애플리케이션이 시작됩니다.

### Step 2: API 설정

`.env.local` 파일을 생성합니다:

```bash
cp .env.local.example .env.local
```

`.env.local` 내용을 수정합니다:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # 백엔드 API 주소
```

### Step 3: 페이지 확인

1. **홈 페이지** [http://localhost:3000](http://localhost:3000)
   - 회원가입 또는 로그인 버튼 표시

2. **회원가입** [http://localhost:3000/signup](http://localhost:3000/signup)
   - 이메일, 비밀번호, 이름을 입력하여 계정 생성

3. **로그인** [http://localhost:3000/login](http://localhost:3000/login)
   - 이메일과 비밀번호로 로그인

4. **대시보드** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - 로그인 후 자동으로 이동
   - 사용자 정보를 JSON 형식으로 표시

## 🔌 백엔드 API 테스트

테스트용 백엔드 API 서버를 생성할 수 있습니다:

1. `EXAMPLE_SERVER.js` 파일의 내용을 참고하세요.
2. 별도의 프로젝트 폴더에서 수정 및 실행할 수 있습니다.

또는 `API_GUIDE.md`에서 필요한 API 엔드포인트 명세를 확인하세요.

## 📂 생성된 파일 구조

```
app/
├── page.tsx              # 홈페이지
├── signup/page.tsx       # 회원가입
├── login/page.tsx        # 로그인
├── dashboard/page.tsx    # 대시보드
└── layout.tsx            # 레이아웃

components/
├── signup-form.tsx       # 회원가입 폼
├── login-form.tsx        # 로그인 폼
└── logout-button.tsx     # 로그아웃 버튼

lib/
├── api.ts               # API 호출 함수
├── cookies.ts           # 쿠키 관리
└── auth-context.tsx     # 인증 상태 관리
```

## 🎯 주요 기능

✅ 회원가입 - 이메일, 비밀번호, 이름 입력
✅ 로그인 - 이메일, 비밀번호 인증
✅ JWT 토큰 쿠키 저장 - 자동 관리
✅ 사용자 정보 조회 - API 연결
✅ JSON 데이터 표시 - 대시보드에서 확인
✅ 로그아웃 - 쿠키 제거

## 💡 사용 예시

### React Hook으로 인증 상태 관리

```tsx
"use client";
import { useAuth } from "@/lib/auth-context";

export default function MyComponent() {
  const { user, isLoggedIn, logout } = useAuth();
  
  if (!isLoggedIn) {
    return <p>로그인이 필요합니다</p>;
  }
  
  return (
    <div>
      <p>{user?.email} 님, 환영합니다!</p>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

## 🔒 보안 주의사항

- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요
- API 요청에는 항상 HTTPS를 사용하세요
- JWT 토큰의 만료 시간을 적절히 설정하세요
- 사용자 비밀번호는 반드시 해싱하여 저장하세요

## 📖 상세 문서

더 자세한 정보는 `API_GUIDE.md`를 참고하세요.

---

**축하합니다! 🎉** 웹사이트가 준비되었습니다.

질문이 있으신가요? 위 문서들을 참고하거나 코드를 확인해보세요.
