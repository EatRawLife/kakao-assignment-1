# 프론트엔드 구현 규칙

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS

## 라우트 구조

| 경로                        | 파일                                  | 설명             |
|-----------------------------|---------------------------------------|------------------|
| `/todos`                    | `app/todos/page.tsx`                  | Todo 목록 페이지 |
| `/todos/new`                | `app/todos/new/page.tsx`              | Todo 생성 페이지 |
| `/todos/[todoId]`           | `app/todos/[todoId]/page.tsx`         | Todo 수정 페이지 |
| (에러 바운더리)             | `app/todos/error.tsx`                 | 에러 화면        |
| (로딩 폴백)                 | `app/todos/loading.tsx`               | 로딩 화면        |

## API 연동 방식: Route Handler 경유

클라이언트(브라우저)는 백엔드(`http://localhost:8000`)를 **직접 호출하지 않는다.**  
반드시 Next.js Route Handler(`app/api/...route.ts`)를 거쳐 백엔드에 요청한다.

```
클라이언트 → /api/todos (route.ts) → http://localhost:8000/todos (FastAPI)
```

### 이유

- 백엔드 URL이 브라우저에 노출되지 않아 보안상 유리.
- 인증 헤더, 에러 변환, 공통 로직을 한 곳에서 관리 가능.
- CORS 설정 없이 동일 출처 요청으로 처리됨.

### Route Handler 파일 위치

| 파일 | 담당 엔드포인트 |
|------|-----------------|
| `app/api/todos/route.ts` | `GET /todos`, `POST /todos` |
| `app/api/todos/[todoId]/route.ts` | `PATCH /todos/{id}`, `DELETE /todos/{id}` |

### 구현 예시

```ts
// app/api/todos/route.ts
const BASE = "http://localhost:8000";

export async function GET() {
  const res = await fetch(`${BASE}/todos`);
  const data = await res.json();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: 201 });
}
```

### 클라이언트에서 호출 시

```ts
// 백엔드 직접 호출 ❌
fetch("http://localhost:8000/todos")

// Route Handler 경유 ✅
fetch("/api/todos")
```

### 서버 컴포넌트에서의 fetch

서버 컴포넌트(`page.tsx`)는 서버 내부에서 실행되므로 백엔드를 직접 호출해도 무방하다.  
단, 일관성을 위해 Route Handler를 경유하는 방식을 권장한다.

---

## 백엔드 엔드포인트 (Route Handler 내부 참조용)

- 백엔드 베이스 URL: `http://localhost:8000`
- 엔드포인트:
  - `GET /todos` — 전체 목록 (프론트에서 `day` 필드로 필터링)
  - `POST /todos` — 생성 (`innertext`, `day` 필수)
  - `PATCH /todos/{id}` — 수정 (변경 필드만 전송)
  - `DELETE /todos/{id}` — 삭제 → 204 No Content

## 컴포넌트 규칙

- 기본은 **Server Component**. 인터랙션이 필요한 경우만 `"use client"` 명시.
- `error.tsx`는 Next.js 요구사항상 반드시 `"use client"` 추가.
- `loading.tsx`는 Server Component로 작성. props 없음, 상호작용 없음.
  - 스피너: 화면 중앙, `border-t-[#672be0] animate-spin` Tailwind 클래스로 CSS 회전 애니메이션.

## 서버 컴포넌트 우선 원칙 (UX 향상)

유저 경험을 최대화하기 위해 **서버 컴포넌트를 최대한 활용**한다.

### 이유

- 초기 렌더링 속도 향상: 서버에서 데이터 페칭 후 완성된 HTML을 전달하므로 빈 화면 노출 없음.
- 클라이언트 번들 크기 감소: 불필요한 JS를 브라우저에 전송하지 않음.
- 보안: API 호출이 서버에서 이루어지므로 민감한 로직이 클라이언트에 노출되지 않음.

### 판단 기준

| 상황 | 컴포넌트 유형 |
|------|---------------|
| 데이터 조회(fetch), 정적 렌더링 | Server Component |
| `useState`, `useEffect`, `useRef` 사용 | Client Component |
| 이벤트 핸들러(`onClick`, `onChange` 등) 사용 | Client Component |
| Next.js 훅(`useRouter`, `usePathname` 등) 사용 | Client Component |
| `error.tsx` | Client Component (Next.js 강제) |

### 구현 패턴

- 페이지 컴포넌트(`page.tsx`)는 `async` Server Component로 작성하고, 해당 컴포넌트 내에서 직접 `fetch`로 데이터를 가져온다.
- 인터랙션이 필요한 UI 부분만 별도 Client Component로 분리하고, Server Component가 데이터를 props로 내려준다.
- `"use client"`는 컴포넌트 트리의 최대한 **말단(leaf)**에 위치시켜 서버 렌더링 범위를 넓힌다.

## 파라미터 타입 (App Router)

```tsx
// 동적 라우트 페이지
type Props = {
  params: Promise<{ todoId: string }>;
};
export default async function Page({ params }: Props) {
  const { todoId } = await params;
}
```

## 디자인 규칙

- 메인 컬러: `#672be0`
- 스타일: 깔끔하고 미니멀한 생산성 앱 스타일
- Tailwind CSS 유틸리티 클래스 사용
