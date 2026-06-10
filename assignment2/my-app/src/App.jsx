import { useState } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';
import DateNavigator from './components/DateNavigator';
import { useTodos } from './hooks/useTodos';
import { getTodayString, navigateDate } from './utils/date';

/**
 * 앱 루트 컴포넌트 (Step 4 — 리팩토링 완료)
 * useTodos 훅에서 받은 상태·핸들러를 하위 컴포넌트에 props로 전달하는
 * 레이아웃 조합 역할만 담당한다.
 *
 * 데이터 흐름:
 *   useTodos(selectedDate) → App (props 배분) → TodoInput, TodoFilter, TodoList → TodoItem
 *   이벤트는 콜백 props를 통해 아래에서 위로 전달된다.
 *
 * App이 직접 소유하는 상태:
 *   selectedDate — 날짜 네비게이션은 UI 레이아웃 관심사이므로 훅에 위임하지 않는다.
 */
function App() {
  // 현재 선택된 날짜 — 'YYYY-MM-DD' 형식, 초기값은 오늘
  // useTodos에 주입되어 항목 생성 날짜 귀속 및 날짜별 필터링에 사용된다.
  const [selectedDate, setSelectedDate] = useState(getTodayString);

  // Todo 관련 모든 상태·핸들러는 useTodos 훅에 위임 (Step 4 리팩토링 핵심)
  // selectedDate를 주입해 날짜 기반 CRUD·필터링이 가능하게 한다.
  const {
    filterType,
    filteredTodoList,
    handleAddTodo,
    handleDeleteTodo,
    handleToggleComplete,
    handleEditTodo,
    handleChangeFilter,
  } = useTodos(selectedDate);

  /**
   * 이전 날짜로 이동하는 핸들러
   * navigateDate에 -1을 전달해 하루 전 날짜 문자열로 교체한다.
   */
  function handlePrevDate() {
    setSelectedDate((prev) => navigateDate(prev, -1));
  }

  /**
   * 다음 날짜로 이동하는 핸들러
   * navigateDate에 +1을 전달해 하루 후 날짜 문자열로 교체한다.
   */
  function handleNextDate() {
    setSelectedDate((prev) => navigateDate(prev, +1));
  }

  return (
    // 페이지 전체를 채우는 연한 회색 배경
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* 콘텐츠 최대 너비 제한 — 모바일(320px)~데스크톱(1280px) 반응형 (NF1-07) */}
      <div className="max-w-lg mx-auto">
        {/* 앱 타이틀 */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 tracking-tight">
          할 일 목록
        </h1>

        {/* 날짜 네비게이터 — 선택된 날짜 표시 + 이전/다음 이동 */}
        <DateNavigator
          selectedDate={selectedDate}
          onPrevDate={handlePrevDate}
          onNextDate={handleNextDate}
        />

        {/* 입력 영역 — 추가 이벤트를 handleAddTodo로 연결 */}
        <TodoInput onAddTodo={handleAddTodo} />

        {/* 필터 탭 — 전체 / 진행 중 / 완료 탭 전환 */}
        <TodoFilter filterType={filterType} onChangeFilter={handleChangeFilter} />

        {/* 목록 영역 — filteredTodoList를 전달해 날짜·탭 조건에 맞는 항목만 렌더링 */}
        <TodoList
          todoList={filteredTodoList}
          onDeleteTodo={handleDeleteTodo}
          onToggleComplete={handleToggleComplete}
          onEditTodo={handleEditTodo}
        />
      </div>
    </div>
  );
}

export default App;
