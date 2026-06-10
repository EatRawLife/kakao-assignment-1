# Step 2 — 에러 케이스

## EC2-01: 완료 항목에서 수정 버튼 클릭 시도

| 항목 | 내용 |
|------|------|
| **상황** | 완료 처리된 항목의 수정 버튼이 활성화된 채로 클릭 |
| **원인** | `disabled` 처리가 누락된 경우 |
| **처리** | `todo.completed === true`이면 수정 버튼을 `disabled` 처리하고 클릭 이벤트를 차단한다 |
| **구현 포인트** | `<button disabled={todo.completed}>` — HTML `disabled` 속성으로 이벤트 자체를 막음 |

---

## EC2-02: 완료 토글 중 다른 항목 상태 오염

| 항목 | 내용 |
|------|------|
| **상황** | 특정 항목의 완료 상태를 바꿀 때 다른 항목의 `completed` 값이 함께 바뀌는 경우 |
| **원인** | 배열을 직접 변경(mutation)하거나 얕은 복사를 잘못 적용한 경우 |
| **처리** | `map`과 스프레드(`{ ...todo }`)를 사용해 변경 대상 항목만 새 객체로 교체한다 |
| **구현 포인트** | `prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)` |

---

## 에러 상태 흐름 요약

```
체크박스 클릭
      ↓
handleToggleComplete(id) 호출
      ↓
map으로 해당 id만 completed 반전, 나머지 그대로
      ↓
setTodoList(새 배열) → React 리렌더링
      ↓
완료 항목: 취소선 + 흐린 색 + 수정 버튼 disabled
미완료 항목: 기본 스타일 + 수정 버튼 활성화
```
