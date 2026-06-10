# 전체 아키텍처 명세

## 컴포넌트 계층 구조

```
App
├── TodoInput          # 입력창 + 추가 버튼
├── TodoFilter         # 전체 / 진행 중 / 완료 탭 (Step 3~)
└── TodoList           # 필터링된 목록
    └── TodoItem[]     # 개별 항목 반복 렌더링
```

---

## 데이터 흐름

```
[useTodos hook]  ← 모든 상태·핸들러의 단일 출처 (Step 4~)
      |
   App.jsx       ← 훅에서 받은 값을 하위 컴포넌트에 props로 전달
   /      \
TodoInput  TodoList
             |
          TodoItem[]
```

- 데이터는 **위에서 아래로** 흐른다 (props).
- 이벤트는 **아래에서 위로** 흐른다 (콜백 함수).
- 어떤 컴포넌트도 전역 변수나 외부 상태를 직접 참조하지 않는다.

---

## 단계별 상태 소유 위치

| 단계 | 상태 소유처 | 설명 |
|------|-----------|------|
| Step 1–3 | `App.jsx` | 빠른 시작을 위해 상태를 App에 직접 배치 |
| Step 4 | `hooks/useTodos.js` | 로직이 복잡해지면 커스텀 훅으로 분리, App을 단순화 |

이 두 단계의 차이는 **동작은 동일**하고 **코드 구조만** 다르다.  
Step 4는 리팩토링이지, 기능 추가가 아니다.

---

## Todo 데이터 모델

각 Todo 항목은 아래 구조의 불변 객체로 표현한다.

```js
{
  id: string,          // crypto.randomUUID() — 전역적으로 고유한 식별자
  text: string,        // 할 일 내용 (trim 처리된 문자열)
  completed: boolean,  // 완료 여부 (초기값: false)
  date: string,        // 'YYYY-MM-DD' — 항목이 생성된 날짜 (selectedDate)
}
```

### assignment1과의 차이: ID 생성 방식

assignment1은 `let nextId = 1`이라는 전역 카운터로 ID를 생성했다.  
이 방식의 문제: localStorage에 `nextId` 값도 함께 저장·복원해야 하고, 저장 누락 시 ID 충돌이 발생한다.

이번 구현에서는 `crypto.randomUUID()`를 사용한다.  
- ID 중복 걱정 없음
- 별도 카운터 상태 관리 불필요
- localStorage에 `nextId`를 저장할 필요 없음

---

## 컴포넌트별 책임 요약

| 컴포넌트 | 소유 state | 받는 props | 발생 이벤트 |
|---------|-----------|-----------|------------|
| `App` | — (훅에 위임) | — | — |
| `TodoInput` | `inputValue`, `hasError` | `onAddTodo` | 추가 요청 |
| `TodoList` | — | `todoList` | — |
| `TodoItem` | `isEditing`, `editValue` | `todo`, `onDeleteTodo`, `onToggleComplete`, `onEditTodo` | 삭제, 완료 토글, 수정 확정 |
| `TodoFilter` | — | `filterType`, `onChangeFilter` | 탭 변경 |

---

## 날짜 처리 원칙

1. **날짜는 `'YYYY-MM-DD'` 문자열로 통일** — 비교는 `===` 한 번으로 처리, timezone 문제 회피
2. **파싱 시 `'T00:00:00'` 접미사** — `new Date('2024-01-15T00:00:00')`처럼 로컬 자정 기준으로 파싱해 UTC 오프셋에 의한 하루 밀림 방지
3. **필터는 2단계** — 날짜 필터 먼저, 완료 상태 필터 나중

---

## 파일 구조 (최종 상태)

```
src/
├── components/
│   ├── TodoInput.jsx
│   ├── TodoList.jsx
│   ├── TodoItem.jsx
│   └── TodoFilter.jsx
├── hooks/
│   └── useTodos.js
├── utils/
│   ├── storage.js
│   └── date.js
├── constants/
│   └── filters.js
├── App.jsx
├── main.jsx
└── index.css
```

각 단계별 추가 파일은 개별 단계의 `functional_spec.md`를 참조한다.
