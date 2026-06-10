# CLAUDE.md — Todo Web App

## 프로젝트 개요

**Todo 웹 앱** — 할 일을 추가·완료·삭제하고 localStorage에 영속적으로 저장하는 생산성 앱이다.

---

## 포팅 맥락

이 프로젝트는 `assignment1` (Vanilla JS)의 **기능을 목표로 삼되, 코드를 그대로 가져오지 않는다.**
목적은 동일한 사용자 경험을 유지보수 가능한 구조로 새롭게 설계하는 것이다.
원본 코드 위치: `../../assignment1/`

### assignment1의 구조적 문제

assignment1은 `app.js` 단일 파일에 모든 것이 뒤섞여 있다. 이것이 이번 리팩토링의 출발점이다.

| 문제 | 구체적 증상 |
|------|-----------|
| **관심사 미분리** | 상태 관리·DOM 조작·이벤트·렌더링·localStorage·날짜 유틸이 `app.js` 하나에 공존 |
| **전역 변수 상태** | `let todos`, `let currentFilter` 등이 어느 함수에서든 직접 수정 가능 → 사이드 이펙트 추적 어려움 |
| **절차적 렌더링** | 상태 변경 후 `renderTodos()`를 매번 수동 호출 → 호출 누락 시 UI 불일치 발생 |
| **UI 구조의 JS 의존** | `createTodoElement()`가 DOM을 직접 생성 → HTML만 봐서는 UI 구조 파악 불가 |
| **변경 영향 범위 불명확** | 필터 로직 수정 시 어느 함수가 영향을 받는지 전체 파일을 읽어야 판단 가능 |

### 이번 포팅에서 달성할 유지보수 목표

| 목표 | 적용 방법 |
|------|----------|
| **관심사 분리** | 컴포넌트 / 훅 / 유틸 / 상수로 역할을 파일 단위로 격리 |
| **상태 소유 명확화** | 전역 변수 제거 — 상태는 `useTodos.js` 훅 안에서만 선언하고 props로 전달 |
| **선언적 렌더링** | 상태만 바꾸면 React가 UI를 자동 반영 — 렌더링 함수 수동 호출 없음 |
| **변경 영향 범위 최소화** | 필터 로직 → `useTodos.js`만, 날짜 포맷 → `utils/date.js`만, 탭 UI → `TodoFilter.jsx`만 수정 |
| **독립적으로 테스트 가능한 단위** | `utils/`의 순수 함수들은 컴포넌트 없이 입출력만으로 검증 가능 |

### 기능 목록 (assignment1 기준 참조)

| 기능 | 설명 |
|------|------|
| Todo 추가 | 입력창 + Enter / 추가 버튼 |
| Todo 인라인 수정 | 수정 버튼 클릭 시 텍스트가 input으로 전환, Enter / 저장 버튼으로 확정 |
| Todo 삭제 | 항목별 삭제 버튼 |
| 완료 토글 | 체크박스 클릭으로 완료/미완료 전환, 완료 시 텍스트 취소선 |
| 날짜 네비게이션 | 이전/다음 버튼으로 날짜 이동, 오늘 날짜일 때 "오늘" 배지 표시 |
| 날짜별 필터링 | 선택된 날짜의 Todo만 표시 |
| 상태 탭 필터 | 전체 / 진행 중 / 완료 탭 |
| 목록 요약 | 전체 N개 · 완료 N개 표시 |
| 빈 상태 메시지 | 탭·날짜 상황에 맞는 안내 문구 |
| 에러 메시지 | 빈 입력 제출 시 인라인 에러 표시 |
| localStorage 영속성 | 새로고침 후에도 목록·완료 상태 복원 |

> **참고**: 날짜 네비게이션 기능은 현재 4단계 명세(`docs/step1~4`)에 포함되어 있지 않다. 단계별 구현 중 추가 여부를 확인하고 진행한다.

### Todo 데이터 모델

각 Todo 항목은 아래 구조의 객체로 표현한다.

```js
{
  id: string,          // crypto.randomUUID() — 전역 고유 식별자
  text: string,        // 할 일 내용 (trim 처리된 문자열)
  completed: boolean,  // 완료 여부 (초기값: false)
  date: string,        // 'YYYY-MM-DD' — 항목이 생성된 selectedDate
}
```

assignment1은 `let nextId = 1` 전역 카운터로 ID를 생성했으나, 이번 구현에서는 `crypto.randomUUID()`를 사용한다.  
이유: `nextId`를 localStorage에 별도로 저장·복원할 필요가 없어 상태 관리가 단순해진다.

### 단계별 상태 소유 위치

Step 1–3에서는 `App.jsx`가 `todoList` 상태와 핸들러를 직접 소유한다.  
Step 4에서 `hooks/useTodos.js`로 추출하는 리팩토링을 수행해 `App.jsx`를 순수 레이아웃 조합으로 단순화한다.  
동작은 동일하고 코드 구조만 달라진다.

### 로직 중 재사용할 핵심 구현 결정

코드가 아닌 **검증된 로직**만 가져온다.

- **날짜는 `YYYY-MM-DD` 문자열로 통일** — 비교를 `===`으로 처리하고 timezone 문제를 회피
- **날짜 파싱 시 `'T00:00:00'` 접미사** — 로컬 자정 기준 파싱으로 UTC 차이에 의한 하루 밀림 방지
- **필터는 2단계 적용** — 날짜 필터 먼저, 그 다음 완료 상태 필터
- 위 로직들은 `utils/date.js`와 `hooks/useTodos.js`에 분산 배치한다

## 역할

너는 숙련된 시니어 웹 개발자다. 주니어 개발자들의 실습을 위한 모범 예시 코드를 제작 중이다.
읽기 쉽고, 방어적이며, 교육적 가치가 높은 코드를 작성하는 것이 목표다.

---

## 기술 스택

| 도구 | 버전 |
|------|------|
| React | v19.x (v18+ 호환) |
| Vite | v8.x (v5.x API 호환) |
| Tailwind CSS | v4.x |
| JavaScript | ES2022+ |
| Web Storage API | localStorage |

---

## 핵심 기능 요구사항

단계별 세부 기능은 `docs/stepN/functional_spec.md` 를 우선 참고한다.

| 단계 | 핵심 주제 | 명세 위치 |
|------|----------|-----------|
| Step 1 | 할 일 추가 / 삭제 | [docs/step1/functional_spec.md](docs/step1/functional_spec.md) |
| Step 2 | 완료 토글 | [docs/step2/functional_spec.md](docs/step2/functional_spec.md) |
| Step 3 | 필터링 (전체/진행 중/완료) | [docs/step3/functional_spec.md](docs/step3/functional_spec.md) |
| Step 4 | localStorage 영속성 | [docs/step4/functional_spec.md](docs/step4/functional_spec.md) |

---

## 파일 구조

```
src/
├── components/
│   ├── TodoInput.jsx       # 텍스트 입력 + 추가 버튼
│   ├── TodoList.jsx        # 필터링된 목록 렌더링
│   ├── TodoItem.jsx        # 개별 항목 (체크박스 + 텍스트 + 수정·삭제 버튼)
│   └── TodoFilter.jsx      # 전체 / 진행 중 / 완료 탭
├── hooks/
│   └── useTodos.js         # Todo CRUD 로직 + localStorage 연동 커스텀 훅
├── utils/
│   ├── storage.js          # localStorage 읽기·쓰기 순수 함수
│   └── date.js             # 날짜 포맷·파싱·이동 순수 함수 (assignment1 날짜 유틸 이관)
├── constants/
│   └── filters.js          # 필터 타입 상수 (FILTER_ALL, FILTER_ACTIVE 등)
├── App.jsx                 # 레이아웃 조합 + useTodos 훅 호출
├── main.jsx                # 앱 진입점
└── index.css               # Tailwind 설정 + 글로벌 스타일
```

### 각 파일의 책임

| 파일 | 역할 | 비고 |
|------|------|------|
| `App.jsx` | 레이아웃 조합, `useTodos` 훅 호출 후 props 전달 | Step 1–3은 상태를 직접 소유, Step 4부터 훅에 위임 |
| `TodoInput.jsx` | 입력값 관리, 추가 이벤트 발생 | 로컬 state(`inputValue`)만 소유 |
| `TodoList.jsx` | 필터링된 배열을 받아 `TodoItem` 목록 렌더링 | 순수 렌더링 컴포넌트 |
| `TodoItem.jsx` | 단일 항목 표시, 완료 토글·삭제·수정 이벤트 발생 | `isEditing`, `editValue` 로컬 state 소유 |
| `TodoFilter.jsx` | 필터 탭 렌더링, 탭 변경 이벤트 발생 | `constants/filters.js` 상수 참조 |
| `hooks/useTodos.js` | `todoList`·`filterType` 상태 + 전체 핸들러 관리 | localStorage 연동 포함 |
| `utils/storage.js` | `loadFromStorage`, `saveToStorage` 순수 함수 | `try/catch` 방어 처리 담당 |
| `utils/date.js` | `getTodayString`, `formatDateDisplay`, `formatDateKey`, `navigateDate` | assignment1 날짜 유틸 이관 |
| `constants/filters.js` | `FILTER_ALL`, `FILTER_ACTIVE`, `FILTER_COMPLETED` 상수 정의 | 문자열 직접 사용 금지 |

### 단계별 파일 추가 흐름

| 단계 | 추가·수정 파일 |
|------|--------------|
| Step 1 | `App.jsx` (상태 직접 소유), `TodoInput.jsx`, `TodoList.jsx`, `TodoItem.jsx` — 추가·삭제·완료 토글·인라인 수정 포함 |
| Step 2 | 별도 파일 추가 없음 — Step 1 구현에 완료 토글(F1-06·F1-07)이 포함되어 있으므로 동작 검증 단계로 활용 |
| Step 3 | `TodoFilter.jsx` 추가, `constants/filters.js` 추가 |
| Step 4 | `hooks/useTodos.js` 추가, `utils/storage.js` 추가, `App.jsx` 간소화 (상태를 훅으로 이전) |

- 컴포넌트 파일명은 PascalCase, 훅·유틸은 camelCase 사용
- 한 파일에 하나의 컴포넌트(또는 훅)만 작성

---

## 디자인 가이드

- **스타일**: 깔끔하고 미니멀한 생산성 앱 스타일
- **메인 컬러**: `#672be0` (보라계열 primary)
- Tailwind CSS 유틸리티 클래스를 우선 사용하고, 필요 시 `index.css`에 커스텀 클래스 추가
- 반응형 레이아웃을 고려해 작성 (모바일 우선)

---

## 코드 작성 규칙

### 명명 규칙

- 변수명·함수명은 역할을 명확히 드러내도록 작성한다.
  - 나쁜 예: `data`, `fn`, `temp`, `handleClick`
  - 좋은 예: `todoList`, `completedTodos`, `handleAddTodo`, `toggleTodoComplete`
- 이벤트 핸들러는 `handle` 접두사 사용 (예: `handleSubmit`, `handleDeleteTodo`)
- boolean 변수는 `is`, `has`, `can` 접두사 사용 (예: `isLoading`, `hasError`)

### 주석 규칙

- **반드시** 동작 방식을 이해할 수 있도록 주석을 단다. 교육용 코드이므로 예외 없이 모든 영역에 작성한다.
- 컴포넌트 상단: 이 컴포넌트의 역할과 props 설명
- 상태(useState): 무엇을 저장하는지, 초기값의 의도
- 이벤트 핸들러: 어떤 흐름으로 상태가 바뀌는지
- 부수 효과(useEffect): 언제 실행되고 무슨 일을 하는지
- JSX 블록: 조건부 렌더링이나 반복 렌더링의 기준

```jsx
// 예시
// 할 일 목록을 localStorage에서 불러와 초기 상태로 설정
const [todoList, setTodoList] = useState(() => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [];
});

// todoList가 변경될 때마다 localStorage에 동기화
useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todoList));
}, [todoList]);
```

### 방어적 코드 작성

- localStorage 파싱 시 `try/catch`로 예외 처리
- props는 함수 시그니처의 default parameter로 방어 (예: `function TodoItem({ todo, onDelete = () => {} })`)
- 빈 배열·null·undefined 접근 전 반드시 가드 처리
- 사용자 입력은 `trim()` 후 빈 문자열 검사
- 배열 메서드(`map`, `filter` 등) 사용 전 `Array.isArray()` 확인 권장

```jsx
// localStorage 방어적 읽기 예시
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
```

---

## 작업 완료 후 답변 형식

모든 구현 작업을 마친 후에는 반드시 아래 형식의 체크리스트로 답변한다.

```
## 구현 완료 체크리스트

- [x] 기능명: 간단한 설명
- [x] 기능명: 간단한 설명
- [ ] 미구현 항목 (있을 경우)
```

---

## 구현 단계 및 docs 구조

전체 구현은 4단계로 나뉜다. 각 단계를 시작하기 전에 해당 단계의 docs를 반드시 먼저 읽고 구현한다.

```
docs/
├── architecture_spec.md     # 전체 아키텍처 (전 단계 공통 참조)
├── step1/
│   ├── functional_spec.md   # 1단계 기능 명세
│   ├── nonfunctional_spec.md  # 1단계 비기능 명세
│   └── error_case.md        # 1단계 에러 케이스
├── step2/
│   ├── functional_spec.md
│   ├── nonfunctional_spec.md
│   └── error_case.md
├── step3/
│   └── ...
└── step4/
    └── ...
```

### 단계별 작업 순서

1. `docs/architecture_spec.md` 를 먼저 읽어 전체 설계를 파악한다.
2. 해당 단계의 `functional_spec.md` → `nonfunctional_spec.md` → `error_case.md` 순으로 읽는다.
3. 세 문서를 모두 숙지한 뒤 구현을 시작한다.
4. 구현 완료 후 체크리스트 형식으로 답변한다.
