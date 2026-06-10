import { formatDateDisplay, isToday } from '../utils/date';

/**
 * 날짜 네비게이터 컴포넌트
 * 현재 선택된 날짜를 표시하고 이전/다음 날짜로 이동할 수 있는 UI를 제공한다.
 * 오늘 날짜일 때는 "오늘" 배지를 함께 표시한다.
 *
 * Props:
 *   selectedDate: string         — 현재 선택된 날짜 ('YYYY-MM-DD')
 *   onPrevDate: () => void       — 이전 날짜 버튼 클릭 시 호출
 *   onNextDate: () => void       — 다음 날짜 버튼 클릭 시 호출
 */
function DateNavigator({ selectedDate, onPrevDate = () => {}, onNextDate = () => {} }) {
  // isToday로 오늘 여부를 계산 — "오늘" 배지 표시 결정
  const isTodayDate = isToday(selectedDate);

  return (
    <div className="flex items-center justify-between mb-6 px-1">
      {/* 이전 날짜 이동 버튼 */}
      <button
        type="button"
        onClick={onPrevDate}
        aria-label="이전 날짜"
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500
          hover:bg-gray-200 hover:text-gray-800 transition-colors"
      >
        ‹
      </button>

      {/* 날짜 표시 영역 — 포맷된 날짜 텍스트 + 오늘 배지 */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-gray-700">
          {formatDateDisplay(selectedDate)}
        </span>

        {/* 오늘 날짜일 때만 배지 렌더링 */}
        {isTodayDate && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#672be0] text-white">
            오늘
          </span>
        )}
      </div>

      {/* 다음 날짜 이동 버튼 */}
      <button
        type="button"
        onClick={onNextDate}
        aria-label="다음 날짜"
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500
          hover:bg-gray-200 hover:text-gray-800 transition-colors"
      >
        ›
      </button>
    </div>
  );
}

export default DateNavigator;
