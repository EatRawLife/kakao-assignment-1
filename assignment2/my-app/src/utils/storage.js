/**
 * storage.js — localStorage 읽기·쓰기 순수 함수
 *
 * localStorage 접근을 이 파일에 집중시켜, 훅·컴포넌트에서
 * localStorage를 직접 호출하지 않도록 한다 (NF4-02).
 * 모든 함수는 외부 상태에 의존하지 않는 순수 함수다.
 */

/**
 * localStorage에서 값을 읽어 JSON으로 파싱한다.
 *
 * @param {string} key      - localStorage 키
 * @param {*}      fallback - 키가 없거나 파싱 실패 시 반환할 기본값
 * @returns {*} 파싱된 값 또는 fallback
 */
export function loadFromStorage(key, fallback) {
  try {
    // localStorage.getItem은 키가 없으면 null을 반환한다.
    // null을 JSON.parse에 넘기면 null이 반환되므로 먼저 확인해 파싱을 건너뛴다 (EC4-03).
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // JSON.parse 실패(SyntaxError) 등 — 손상된 데이터로 앱이 멈추지 않도록 fallback 반환 (EC4-01)
    return fallback;
  }
}

/**
 * 값을 JSON으로 직렬화해 localStorage에 저장한다.
 *
 * @param {string} key   - localStorage 키
 * @param {*}      value - 저장할 값 (JSON.stringify 가능한 타입)
 */
export function saveToStorage(key, value) {
  try {
    // JSON.stringify로 직렬화해 문자열로 저장한다.
    // completed 같은 중첩 필드도 그대로 직렬화되므로 완료 상태도 함께 보존된다 (F4-03).
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // QuotaExceededError 등 쓰기 실패 시 메모리 상태는 그대로 유지한다 (EC4-02).
    // 앱 동작에는 영향 없음 — 해당 변경만 영속되지 않을 수 있다.
  }
}
