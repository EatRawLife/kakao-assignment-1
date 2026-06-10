import { FILTER_ALL, FILTER_ACTIVE, FILTER_COMPLETED } from '../constants/filters';

/**
 * 필터 탭 컴포넌트
 * 전체 / 진행 중 / 완료 세 탭을 렌더링하고, 현재 활성 탭을 시각적으로 구분한다.
 * 탭 상태(filterType)는 이 컴포넌트가 소유하지 않는다 — App에서 주입받는다.
 *
 * Props:
 *   filterType: string                — 현재 활성 필터 (constants/filters.js 상수 중 하나)
 *   onChangeFilter(type: string)      — 탭 클릭 시 호출, 선택된 필터 타입을 전달
 */
function TodoFilter({ filterType = FILTER_ALL, onChangeFilter = () => {} }) {
  // 탭 레이블과 필터 값을 한 곳에서 관리 — 탭 추가·변경 시 이 배열만 수정하면 된다
  const TABS = [
    { label: '전체',    value: FILTER_ALL },
    { label: '진행 중', value: FILTER_ACTIVE },
    { label: '완료',    value: FILTER_COMPLETED },
  ];

  return (
    // role="tablist"로 스크린 리더에 탭 그룹임을 알린다
    <div
      role="tablist"
      aria-label="할 일 필터"
      className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg"
    >
      {/* 탭 배열을 순회하며 버튼 렌더링 — 활성/비활성 스타일을 조건부로 적용 */}
      {TABS.map((tab) => {
        const isActive = filterType === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeFilter(tab.value)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors
              ${isActive
                // 활성 탭: 브랜드 컬러 배경 + 흰색 텍스트 + 그림자
                ? 'bg-[#672be0] text-white shadow-sm'
                // 비활성 탭: 투명 배경 + 회색 텍스트, 호버 시 약간 진해짐
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default TodoFilter;
