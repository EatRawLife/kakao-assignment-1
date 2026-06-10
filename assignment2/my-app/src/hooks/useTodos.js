import { useState, useEffect } from 'react';
import { FILTER_ALL, FILTER_ACTIVE, FILTER_COMPLETED } from '../constants/filters';
import { loadFromStorage, saveToStorage } from '../utils/storage';

/**
 * useTodos — 할 일 목록의 상태·핸들러·localStorage 연동을 담당하는 커스텀 훅
 *
 * Step 1~3에서 App.jsx에 직접 작성했던 todoList 상태와 핸들러를 이 훅으로 추출했다.
 * App.jsx는 레이아웃 조합만 담당하고, 비즈니스 로직은 이 훅이 단일 출처가 된다.
 *
 * @param {string} selectedDate - 현재 선택된 날짜 ('YYYY-MM-DD' 형식)
 *                                App.jsx가 소유하는 날짜 상태를 주입받아
 *                                항목 생성 및 날짜별 필터링에 사용한다.
 * @returns {{
 *   todoList:             Todo[],
 *   filterType:           string,
 *   filteredTodoList:     Todo[],
 *   handleAddTodo:        (text: string) => void,
 *   handleDeleteTodo:     (id: string) => void,
 *   handleToggleComplete: (id: string) => void,
 *   handleEditTodo:       (id: string, newText: string) => void,
 *   handleChangeFilter:   (type: string) => void,
 * }}
 */
export function useTodos(selectedDate) {
  // 할 일 목록 상태 — 전체 CRUD의 단일 출처
  // lazy initializer: 함수 형태로 전달해 첫 렌더링에만 실행되도록 보장한다 (NF4-04).
  // 앱 로드 시 localStorage에서 이전 목록을 복원한다 (F4-02).
  const [todoList, setTodoList] = useState(() =>
    loadFromStorage('todos', [])
  );

  // 현재 선택된 필터 탭 — 초기값: 전체 보기
  const [filterType, setFilterType] = useState(FILTER_ALL);

  // todoList 변경 시마다 localStorage에 자동 저장 (F4-01, F4-03)
  // 의존성 배열에 todoList를 명시해 변경될 때마다 실행되도록 한다 (NF4-05).
  // JSON.stringify로 직렬화되므로 completed 등 모든 필드가 함께 저장된다.
  useEffect(() => {
    saveToStorage('todos', todoList);
  }, [todoList]);

  /**
   * 새 할 일 추가 핸들러
   * TodoInput에서 유효한 텍스트가 전달되면 새 항목을 목록 끝에 추가한다.
   * date 필드에 주입받은 selectedDate를 저장해 날짜별 필터링이 가능하게 한다.
   *
   * @param {string} text - 할 일 텍스트 (TodoInput에서 trim 완료된 값)
   */
  function handleAddTodo(text) {
    const newTodo = {
      id: crypto.randomUUID(), // 전역 고유 ID — localStorage 복원 후에도 충돌 없음
      text: text.trim(),
      completed: false,
      date: selectedDate,      // 주입받은 날짜로 귀속 — 날짜 이동 후 추가해도 올바른 날짜에 저장
    };
    // 기존 배열을 직접 변경하지 않고 새 배열로 교체 (불변 업데이트)
    setTodoList((prev) => [...prev, newTodo]);
  }

  /**
   * 할 일 삭제 핸들러
   * 해당 id를 가진 항목을 배열에서 제거한다.
   *
   * @param {string} id - 삭제할 항목의 UUID
   */
  function handleDeleteTodo(id) {
    setTodoList((prev) => prev.filter((todo) => todo.id !== id));
  }

  /**
   * 완료 토글 핸들러
   * 해당 id 항목의 completed 값을 반전시킨다.
   * 나머지 항목은 그대로 유지 (map + 조건부 스프레드).
   *
   * @param {string} id - 완료 상태를 전환할 항목의 UUID
   */
  function handleToggleComplete(id) {
    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  }

  /**
   * 인라인 수정 확정 핸들러
   * TodoItem에서 새 텍스트가 전달되면 해당 항목의 text를 교체한다.
   * 빈 문자열 방어는 TodoItem 내부에서 처리하므로 여기서는 신뢰하고 적용한다.
   *
   * @param {string} id      - 수정할 항목의 UUID
   * @param {string} newText - 새 텍스트 (TodoItem에서 trim 완료된 값)
   */
  function handleEditTodo(id, newText) {
    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, text: newText.trim() }
          : todo
      )
    );
  }

  /**
   * 필터 탭 변경 핸들러
   * TodoFilter에서 탭을 클릭하면 filterType 상태를 갱신한다.
   * todoList 원본은 변경하지 않으므로 탭 전환 후 항목 조작 시에도 데이터가 유지된다.
   *
   * @param {string} type - FILTER_ALL | FILTER_ACTIVE | FILTER_COMPLETED
   */
  function handleChangeFilter(type) {
    setFilterType(type);
  }

  // 파생 값 — 원본 todoList는 변경하지 않아 필터 전환·날짜 이동 시 데이터 손실이 없다.
  // 1단계: 날짜 필터 — selectedDate와 일치하는 항목만 통과
  // 2단계: 상태 탭 필터 — filterType에 따라 완료/미완료/전체 구분
  const filteredTodoList = todoList
    .filter((todo) => todo.date === selectedDate)
    .filter((todo) => {
      if (filterType === FILTER_ACTIVE)    return !todo.completed;
      if (filterType === FILTER_COMPLETED) return todo.completed;
      return true; // FILTER_ALL — 날짜 필터 통과한 모든 항목
    });

  return {
    todoList,
    filterType,
    filteredTodoList,
    handleAddTodo,
    handleDeleteTodo,
    handleToggleComplete,
    handleEditTodo,
    handleChangeFilter,
  };
}
