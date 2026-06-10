import { useState, useRef, useEffect } from 'react';

/**
 * 개별 할 일 항목 컴포넌트
 * 완료 체크박스, 텍스트(또는 인라인 수정 input), 수정·삭제 버튼을 렌더링한다.
 * 수정 모드 상태(isEditing)는 이 컴포넌트의 로컬 state로 관리한다.
 *
 * Props:
 *   todo: { id: string, text: string, completed: boolean, date: string }
 *   onDeleteTodo(id: string)                        — 삭제 요청 콜백
 *   onToggleComplete(id: string)                    — 완료 토글 콜백
 *   onEditTodo(id: string, newText: string)         — 수정 확정 콜백
 */
function TodoItem({
  todo,
  onDeleteTodo = () => {},
  onToggleComplete = () => {},
  onEditTodo = () => {},
}) {
  // 인라인 수정 모드 여부 — true이면 텍스트 대신 input이 렌더링된다 (F1-08)
  const [isEditing, setIsEditing] = useState(false);
  // 수정 중인 텍스트 값 — 수정 모드 진입 시 todo.text로 초기화된다
  const [editValue, setEditValue] = useState(todo.text);

  // 수정 모드 진입 시 input에 자동 포커스를 맞추기 위한 ref
  const editInputRef = useRef(null);

  // isEditing이 true로 바뀔 때 수정 input에 자동 포커스
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  /**
   * 수정 모드 시작
   * 현재 텍스트를 editValue로 초기화한 뒤 수정 모드로 전환한다.
   * 완료된 항목은 수정 버튼이 disabled이므로 이 함수가 호출되지 않는다 (F1-10).
   */
  function handleStartEdit() {
    setEditValue(todo.text);
    setIsEditing(true);
  }

  /**
   * 수정 확정
   * trim 후 빈 문자열이면 포커스만 유지하고 확정하지 않는다 (EC1-03).
   * 유효한 값이면 상위로 전달하고 수정 모드를 종료한다.
   */
  function handleConfirmEdit() {
    if (editValue.trim() === '') {
      // 빈 값 제출 시 수정 모드를 유지하고 포커스를 돌려준다
      editInputRef.current?.focus();
      return;
    }
    onEditTodo(todo.id, editValue.trim());
    setIsEditing(false);
  }

  /**
   * 수정 취소
   * 변경 사항을 버리고 원래 텍스트로 복원한 뒤 수정 모드를 종료한다 (F1-09).
   */
  function handleCancelEdit() {
    setEditValue(todo.text); // 원래 텍스트로 복원
    setIsEditing(false);
  }

  /**
   * 수정 input 키보드 이벤트 처리
   * Enter: 확정 / Escape: 취소
   */
  function handleEditKeyDown(e) {
    if (e.key === 'Enter') {
      handleConfirmEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }

  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm transition-colors
        ${todo.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
    >
      {/* 완료 토글 체크박스 — 클릭 시 completed 상태를 반전시킨다 (F1-06) */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo.id)}
        aria-label={`"${todo.text}" 완료 표시`}
        className="w-5 h-5 rounded cursor-pointer flex-shrink-0 accent-[#672be0]"
      />

      {/* 수정 모드: input 렌더링 / 일반 모드: 텍스트 렌더링 (F1-08) */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          aria-label="할 일 수정"
          className="flex-1 px-3 py-1 border border-[#672be0] rounded-md outline-none
                     focus:ring-2 focus:ring-[#672be0]/20 text-gray-800 text-sm"
        />
      ) : (
        // 완료 항목은 취소선 + 흐린 색으로 시각적 구분 (F1-07)
        <span
          className={`flex-1 text-sm break-all
            ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {todo.text}
        </span>
      )}

      {/* 버튼 영역: 수정 모드에서는 저장/취소, 일반 모드에서는 수정/삭제 */}
      <div className="flex gap-1.5 flex-shrink-0">
        {isEditing ? (
          <>
            {/* 수정 확정 버튼 */}
            <button
              type="button"
              onClick={handleConfirmEdit}
              aria-label="수정 저장"
              className="px-3 py-1 text-xs font-medium bg-[#672be0] text-white
                         rounded hover:bg-[#5a24c4] transition-colors"
            >
              저장
            </button>
            {/* 수정 취소 버튼 */}
            <button
              type="button"
              onClick={handleCancelEdit}
              aria-label="수정 취소"
              className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700
                         rounded hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </>
        ) : (
          <>
            {/* 수정 버튼 — 완료 항목은 비활성화 (F1-10) */}
            <button
              type="button"
              onClick={handleStartEdit}
              disabled={todo.completed}
              aria-label="할 일 수정"
              className={`px-3 py-1 text-xs font-medium rounded transition-colors
                ${todo.completed
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              수정
            </button>
            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => onDeleteTodo(todo.id)}
              aria-label="할 일 삭제"
              className="px-3 py-1 text-xs font-medium bg-red-50 text-red-500
                         rounded hover:bg-red-100 transition-colors"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TodoItem;
