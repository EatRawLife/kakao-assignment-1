# Step 4 — 에러 케이스

## EC4-01: localStorage 값이 손상된 경우 (JSON 파싱 실패)

| 항목 | 내용 |
|------|------|
| **상황** | `localStorage`의 `'todos'` 키에 유효하지 않은 JSON 문자열이 저장된 경우 |
| **원인** | 외부 스크립트가 값을 덮어씌우거나 직접 편집해 깨진 경우 |
| **처리** | `JSON.parse` 실패 시 `catch` 블록에서 `fallback`(빈 배열 `[]`)을 반환해 앱을 정상 시작한다 |
| **사용자 영향** | 기존 데이터는 사라지지만 앱이 오류 없이 빈 목록으로 초기화된다 |
| **구현 포인트** | `loadFromStorage` 내부 `try/catch` — `catch` 블록에서 `return fallback` |

```
localStorage에서 읽기
      ↓
JSON.parse 시도
      ↓
  성공                실패 (SyntaxError 등)
    ↓                       ↓
  배열 반환           fallback([]) 반환 → 빈 목록으로 시작
```

---

## EC4-02: localStorage 쓰기 실패 (QuotaExceededError)

| 항목 | 내용 |
|------|------|
| **상황** | 브라우저 저장소 용량 초과로 `localStorage.setItem`이 예외를 던지는 경우 |
| **원인** | 5MB 내외의 localStorage 용량 한도 초과 |
| **처리** | `saveToStorage`의 `try/catch`에서 예외를 무시하고 메모리 상태는 그대로 유지한다. 새로고침 시에는 이전에 성공적으로 저장된 데이터가 복원된다 |
| **사용자 영향** | 해당 변경은 새로고침 후 복원되지 않을 수 있으나, 앱은 계속 정상 동작한다 |
| **구현 포인트** | `saveToStorage` 내부 `try/catch` — `catch` 블록은 비워두거나 `console.warn`으로 기록 |

---

## EC4-03: localStorage가 비어 있는 경우 (최초 방문)

| 항목 | 내용 |
|------|------|
| **상황** | `localStorage`에 `'todos'` 키가 존재하지 않는 경우 (처음 방문 또는 수동 삭제) |
| **처리** | `localStorage.getItem('todos')`가 `null`을 반환하므로 `JSON.parse` 없이 `fallback`(빈 배열)을 반환한다 |
| **사용자 영향** | 빈 목록으로 시작하며, 항목 추가 후 자동으로 저장이 시작된다 |
| **구현 포인트** | `raw ? JSON.parse(raw) : fallback` — `null` 체크로 파싱 자체를 건너뜀 |

---

## 에러 상태 흐름 요약

```
앱 로드
      ↓
loadFromStorage('todos', []) 호출
      ↓
  키 없음(null)      파싱 성공           파싱 실패
      ↓                  ↓                  ↓
  [] 반환           배열 복원           [] 반환 (fallback)

      ↓ (이후 Todo 변경 발생마다)
saveToStorage('todos', todoList) 호출
      ↓
  쓰기 성공          쓰기 실패(QuotaExceeded 등)
      ↓                       ↓
  localStorage 갱신       예외 무시, 메모리 상태 유지
```
