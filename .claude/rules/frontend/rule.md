# 프론트엔드 구현 규칙

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS

## 라우트 구조

| 경로                        | 파일                                  | 설명             |
|-----------------------------|---------------------------------------|------------------|
| `/todos`                    | `app/todos/page.tsx`                  | Todo 목록 페이지 |
| `/todos/[todoId]`           | `app/todos/[todoId]/page.tsx`         | Todo 수정 페이지 |
| (에러 바운더리)             | `app/todos/error.tsx`                 | 에러 화면        |
| (로딩 폴백)                 | `app/todos/loading.tsx`               | 로딩 화면        |

## 환경변수

`frontend/.env.local`에 정의. 코드에 URL을 직접 하드코딩하지 않는다.

| 변수명        | 설명                                      |
|---------------|-------------------------------------------|
| `BACKEND_URL` | FastAPI 서버 주소 (서버사이드 전용)       |
| `APP_URL`     | Next.js 앱 주소 (server component fetch용) |

- `NEXT_PUBLIC_` 접두사가 없으므로 브라우저에 노출되지 않는다.

---

## API 연동 방식: Route Handler 경유

클라이언트(브라우저)는 백엔드를 **직접 호출하지 않는다.**  
반드시 Next.js Route Handler(`app/api/...route.ts`)를 거쳐 백엔드에 요청한다.

```
클라이언트 → /api/todos (route.ts) → $BACKEND_URL/todos (FastAPI)
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
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  const res = await fetch(`${BACKEND}/todos`);
  const data = await res.json();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${BACKEND}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
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

서버 컴포넌트(`page.tsx`)도 Route Handler를 경유한다. 환경변수 `APP_URL`로 절대 URL을 구성한다.

```ts
const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const res = await fetch(`${appUrl}/api/todos`, { cache: "no-store" });
```

---

## 백엔드 엔드포인트 (Route Handler 내부 참조용)

- 백엔드 베이스 URL: `process.env.BACKEND_URL`
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

## 페이지별 컴포넌트 스펙

### app/todos/page.tsx

컨테이너 제목: **"Todo List"**

`searchParams`로 `date` 쿼리 파라미터를 받아 `TodosClient`에 `initialDate`로 전달한다.

**날짜 필터링 (맨 위)**
- 중앙에 현재 선택된 날짜 표시 (기본값: 오늘, `?date=YYYY-MM-DD` 쿼리로 초기화 가능)
- 좌우에 날짜 이동 버튼 — 공유된 `DateNavButton` 컴포넌트 사용
- 날짜 변경 시 추가 API 요청 없이 클라이언트에서 `allTodos`를 재필터링

**Todo 추가**
- 중앙 텍스트 입력창 + 우측 제출 버튼 (POST)
- `innertext`: 입력창 텍스트, `day`: 현재 선택 날짜
- 비어있으면 요청하지 않고 오류 메시지 출력

**Todo 검색**
- 검색창 + Enter로 `searchQuery` 상태를 업데이트 → 클라이언트 필터링
- 비어있으면 요청하지 않고 오류 메시지 출력
- 날짜 이동 시 검색어 초기화

**상태 필터 버튼 (검색창 아래)**
- "전체", "실행 중", "완료" 3개 버튼 — 공유된 `FilterButton` 컴포넌트 사용
- 클릭 시 `activeFilter` 상태 변경 → 클라이언트 필터링 (API 요청 없음)

**필터링 순서**
```
allTodos → 날짜(day) → 검색어(innertext 포함) → 완료 상태(complete)
```

**Todo 목록**
- 필터링 결과를 상→하로 나열
- 각 항목은 `TodoItem` 컴포넌트 재사용
- 좌측: 둥근 체크박스 — 클릭 시 `complete` 토글 PATCH 요청 (`!todo.complete`)
- 완료 항목(`complete == true`): 텍스트에 취소선
- 우측: 수정 버튼(해당 `[id]/page.tsx` 이동) + 삭제 버튼(DELETE 요청) — 두 버튼은 동일 `ActionButton` 컴포넌트 사용

---

### app/todos/[todoId]/page.tsx

컨테이너 제목: **"Todo 수정"**

변경 사항을 즉시 전송하지 않고 **클라이언트에서 큐잉**한 뒤, 저장/취소 버튼으로 처리한다.

**컨테이너 1 — 입력 (TodoTextInput 재사용)**
- Enter 또는 버튼 클릭 시 `pendingTextRef`에 큐잉 + TodoItem 표시 즉시 반영
- 저장 버튼 클릭 시 `textInputRef.submit()`을 호출해 미입력 텍스트도 자동 큐잉

**컨테이너 2 — Todo 뷰 (TodoItem 재사용)**
- 기존 Todo 데이터 표시 (로컬 변경 즉시 반영)
- 수정·삭제 버튼 없음
- 체크박스 클릭 시 로컬 상태만 토글 (즉시 전송 없음)

**저장 / 취소 버튼 (ActionButton 재사용)**
- **저장**: 큐잉된 변경분만 모아 PATCH 전송 후 `/todos?date={todo.day}` 리다이렉트
- **취소**: 요청 없이 `/todos?date={todo.day}` 리다이렉트
- 변경이 없으면 PATCH 요청 생략

---

## 공유 컴포넌트 목록

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| `TodoItem` | `app/todos/_components/TodoItem.tsx` | Todo 항목 표시 (체크박스, 텍스트, 액션 버튼) |
| `ActionButton` | `app/todos/_components/TodoItem.tsx` (export) | 액션 버튼 — `default` / `danger` / `primary` 변형 |
| `FilterButton` | `app/todos/_components/FilterButton.tsx` | 상태 필터 버튼 |
| `DateNavButton` | `app/todos/_components/DateNavButton.tsx` | 날짜 이동 버튼 |
| `TodoTextInput` | `app/todos/_components/TodoTextInput.tsx` | 텍스트 입력 + 제출 (추가·검색·수정 공유), `ref`로 `submit()` 외부 호출 가능 |
| `TodosClient` | `app/todos/_components/TodosClient.tsx` | todos 페이지 상태·로직 Client Component |
| `EditTodoClient` | `app/todos/_components/EditTodoClient.tsx` | 수정 페이지 상태·로직 Client Component |

---

## 파라미터 타입 (App Router)

```tsx
// 동적 라우트 페이지
type Props = {
  params: Promise<{ todoId: string }>;
};
export default async function Page({ params }: Props) {
  const { todoId } = await params;
}

// 쿼리 파라미터
type Props = {
  searchParams: Promise<{ date?: string }>;
};
export default async function Page({ searchParams }: Props) {
  const { date } = await searchParams;
}
```

## 디자인 규칙

- 메인 컬러: `#672be0`
- 스타일: 깔끔하고 미니멀한 생산성 앱 스타일
- Tailwind CSS 유틸리티 클래스 사용
- 입력 포커스 시: `focus:border-[#672be0] focus:ring-2 focus:ring-[#672be0]/20` 하이라이팅 적용
