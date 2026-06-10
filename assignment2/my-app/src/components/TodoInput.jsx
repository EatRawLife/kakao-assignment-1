import { useState, useRef, useEffect } from 'react';

/**
 * 할 일 입력 컴포넌트
 * 사용자가 텍스트를 입력하고 Enter 또는 추가 버튼으로 새 할 일을 제출한다.
 * 빈 입력 제출 시 에러 메시지를 인라인으로 표시하고, 타이핑 재개 시 자동 해제한다.
 *
 * Props:
 *   onAddTodo(text: string) — 유효한 텍스트가 확정됐을 때 호출
 */
function TodoInput({ onAddTodo = () => {} }) {
  // 입력창 텍스트 — 사용자가 타이핑하는 현재 값
  const [inputValue, setInputValue] = useState('');
  // 빈 입력 제출 에러 표시 여부 — true이면 에러 메시지가 노출된다
  const [hasError, setHasError] = useState(false);

  // 포커스 제어를 위한 ref — 마운트 시 및 추가/에러 후 포커스 복귀에 사용
  const inputRef = useRef(null);

  // 컴포넌트 마운트 시 입력창에 자동 포커스 (NF1-10)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * 입력값 변경 핸들러
   * 에러 상태가 표시된 상태에서 사용자가 타이핑을 시작하면 즉시 에러를 해제한다 (EC1-02).
   */
  function handleInputChange(e) {
    setInputValue(e.target.value);
    // 타이핑 시작 시 에러 메시지를 즉시 숨긴다
    if (hasError && e.target.value.trim() !== '') {
      setHasError(false);
    }
  }

  /**
   * 추가 제출 처리
   * trim 후 빈 문자열이면 에러 표시 (EC1-01), 유효하면 onAddTodo 호출 후 초기화.
   */
  function handleSubmit() {
    // 빈 입력 방지: 공백만 있는 경우도 차단
    if (inputValue.trim() === '') {
      setHasError(true);
      inputRef.current?.focus(); // 에러 발생 시 입력창에 포커스 복귀
      return;
    }

    onAddTodo(inputValue.trim());
    // 추가 성공 후 입력창 초기화 (F1-03)
    setInputValue('');
    setHasError(false);
    // 항목 추가 후 다음 입력을 위해 포커스 복귀 (NF1-10)
    inputRef.current?.focus();
  }

  /**
   * 키보드 이벤트 처리 — Enter 키로 제출
   */
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        {/* 할 일 입력창 — 에러 시 테두리 색이 빨간색으로 전환된다 */}
        <input
          ref={inputRef}
          id="todo-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력하세요"
          aria-label="할 일 입력"
          aria-describedby={hasError ? 'todo-input-error' : undefined}
          className={`flex-1 px-4 py-2 border rounded-lg outline-none transition-colors text-gray-800
            ${hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 focus:border-[#672be0] focus:ring-2 focus:ring-[#672be0]/20'
            }`}
        />
        {/* 추가 버튼 — 클릭 시 handleSubmit 실행 */}
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 bg-[#672be0] text-white rounded-lg
                     hover:bg-[#5a24c4] active:bg-[#4e1fab]
                     transition-colors font-medium"
        >
          추가
        </button>
      </div>

      {/* 빈 입력 에러 메시지 — hasError가 true일 때만 렌더링 (EC1-01) */}
      {hasError && (
        <p
          id="todo-input-error"
          role="alert"
          className="mt-1.5 text-sm text-red-500"
        >
          할 일을 입력해주세요.
        </p>
      )}
    </div>
  );
}

export default TodoInput;
