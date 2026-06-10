# Step 4 — 기능 명세

## 구현 범위

영속성: 페이지를 새로고침해도 데이터가 유지되도록 localStorage에 저장한다.
Step 1~3 기능은 그대로 유지한다.

## 기능 목록

| # | 기능 | 설명 |
|---|------|------|
| F4-01 | 자동 저장 | 할 일 목록이 변경될 때마다 localStorage에 저장된다 |
| F4-02 | 자동 복원 | 앱 로드 시 localStorage에서 이전 목록을 불러온다 |
| F4-03 | 완료 상태 복원 | 저장된 각 항목의 완료 상태도 함께 복원된다 |
| F4-04 | 손상 데이터 방어 | localStorage 값이 손상되었을 경우 빈 목록으로 초기화한다 |

## 구현 요구사항

| 요구사항 | 구현 방법 |
|---------|---------|
| Todo의 변경사항은 항상 localStorage에 저장된다 | `useEffect`의 의존성 배열에 `todoList`를 명시해, 변경될 때마다 `saveToStorage`를 호출한다 |
| 새로고침 후에도 기존 데이터가 유지된다 | `useState`의 lazy initializer로 앱 로드 시 `loadFromStorage`를 호출해 이전 목록을 복원한다 |
| 데이터는 JSON 형태로 저장하고 불러온다 | 저장 시 `JSON.stringify(todoList)`, 복원 시 `JSON.parse(raw)`를 사용한다 |
| `useEffect`를 활용해 todos 변경 시 자동으로 저장한다 | `useEffect(() => { saveToStorage('todos', todoList); }, [todoList])` 패턴을 사용한다 |

## 완성 기준

- 항목 추가·삭제·토글·수정 후 새로고침해도 동일한 목록이 유지된다
- 새로고침 후 각 항목의 완료 상태도 그대로 복원된다
- localStorage에 저장된 값이 깨진 경우 앱이 오류 없이 빈 목록으로 시작된다
