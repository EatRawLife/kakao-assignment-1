/**
 * 날짜 관련 순수 유틸 함수 모음
 * 모든 날짜는 'YYYY-MM-DD' 문자열로 통일해 비교를 ===으로 처리하고 timezone 문제를 회피한다.
 */

/**
 * 오늘 날짜를 'YYYY-MM-DD' 문자열로 반환한다.
 * sv-SE 로케일이 ISO 8601 형식(YYYY-MM-DD)을 그대로 출력하므로 별도 파싱 없이 사용 가능.
 */
export function getTodayString() {
  return new Date().toLocaleDateString('sv-SE');
}

/**
 * 'YYYY-MM-DD' 문자열을 화면 표시용 문자열로 변환한다.
 * 예: '2026-06-10' → '6월 10일 (화)'
 *
 * 'T00:00:00' 접미사를 붙여 로컬 자정 기준으로 파싱한다.
 * 접미사 없이 'YYYY-MM-DD'만 넘기면 UTC 00:00으로 파싱되어
 * 한국(UTC+9) 환경에서 날짜가 하루 밀리는 버그가 발생한다.
 */
export function formatDateDisplay(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  const month = date.getMonth() + 1;
  const day   = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday  = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/**
 * 'YYYY-MM-DD' 날짜에서 delta일만큼 이동한 날짜를 반환한다.
 * delta = -1 → 전날, delta = +1 → 다음날
 *
 * 로컬 자정 기준으로 파싱한 뒤 밀리초를 더해 날짜를 이동한다.
 */
export function navigateDate(dateStr, delta) {
  const date    = new Date(`${dateStr}T00:00:00`);
  const ms      = date.getTime() + delta * 24 * 60 * 60 * 1000;
  const newDate = new Date(ms);
  return newDate.toLocaleDateString('sv-SE');
}

/**
 * 주어진 날짜가 오늘인지 여부를 반환한다.
 * DateNavigator의 "오늘" 배지 표시 여부 결정에 사용한다.
 */
export function isToday(dateStr) {
  return dateStr === getTodayString();
}
