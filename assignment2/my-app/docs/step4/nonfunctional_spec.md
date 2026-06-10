# Step 4 — 비기능 명세

## 코드 품질

| # | 요구사항 | 기준 |
|---|---------|------|
| NF4-01 | 커스텀 훅 분리 | `todoList`·`filterType` 상태와 모든 핸들러를 `hooks/useTodos.js`로 추출한다. `App.jsx`에는 상태 선언이 남지 않아야 한다 |
| NF4-02 | 순수 함수 분리 | localStorage 읽기·쓰기는 `utils/storage.js`의 `loadFromStorage`, `saveToStorage` 함수로 분리한다. 훅·컴포넌트 내부에서 `localStorage`를 직접 호출하지 않는다 |
| NF4-03 | localStorage 방어 | `loadFromStorage`는 `try/catch`로 `JSON.parse` 실패를 처리하고 `fallback` 값을 반환한다. `saveToStorage`도 `try/catch`로 쓰기 실패(`QuotaExceededError` 등)를 방어한다 |
| NF4-04 | lazy initializer | `useState`의 초기값으로 `loadFromStorage`를 직접 호출하지 않고, 함수 형태로 전달한다. 첫 렌더링에만 실행되도록 보장하기 위함이다 |
| NF4-05 | useEffect 의존성 | `todoList` 변경 시 저장하는 `useEffect`의 의존성 배열에 `[todoList]`를 명시한다. 빈 배열(`[]`)로 작성하지 않는다 |
| NF4-06 | 주석 | `useTodos.js`와 `storage.js`의 모든 함수·상태·효과에 역할 설명 주석을 작성한다 |
| NF4-07 | 컴포넌트 무변경 | Step 4 작업으로 인해 컴포넌트 파일(TodoInput, TodoList, TodoItem, TodoFilter, DateNavigator)이 수정되어서는 안 된다 |

---

## 동작 동일성

| # | 요구사항 | 기준 |
|---|---------|------|
| NF4-08 | 기능 동일 | Step 3까지의 모든 기능(추가·삭제·토글·수정·필터·날짜 이동)이 Step 4 후에도 동일하게 동작해야 한다 |
| NF4-09 | 구조만 변경 | Step 4는 리팩토링이다. 사용자가 체감하는 기능 변화 없이 코드 구조만 달라진다 |
