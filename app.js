// ===== 상수 =====
const STORAGE_KEY = 'todo-app-data'; // 로컬스토리지 저장 키

// ===== DOM 요소 참조 =====
const todoInput = document.getElementById('todoInput');
const addButton = document.getElementById('addButton');
const todoList = document.getElementById('todoList');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const todoSummary = document.getElementById('todoSummary');
const filterTabs = document.getElementById('filterTabs');
const dateLabel = document.getElementById('dateLabel');           // 날짜 텍스트
const todayBadge = document.getElementById('todayBadge');         // '오늘' 배지
const prevDateButton = document.getElementById('prevDateButton'); // 이전 날짜 버튼
const nextDateButton = document.getElementById('nextDateButton'); // 다음 날짜 버튼

// ===== 상태 =====
let todos = [];
let nextId = 1;
let currentFilter = 'all';

// 현재 선택된 날짜. 'YYYY-MM-DD' 형식의 문자열로 관리.
// 날짜를 문자열로 통일하면 비교가 단순해지고 시간대(timezone) 문제를 피할 수 있다.
let selectedDate = getTodayString();

// ===== 날짜 유틸리티 =====

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환한다.
 * new Date()는 로컬 시간 기준이므로 getFullYear/Month/Date로 직접 조합한다.
 * @returns {string}
 */
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 'YYYY-MM-DD' 문자열을 '2024년 1월 15일 (화)' 형식으로 변환한다.
 * 'T00:00:00'을 붙여 로컬 자정 기준으로 파싱해 날짜가 하루 밀리는 문제를 방지한다.
 * @param {string} dateString - 'YYYY-MM-DD'
 * @returns {string}
 */
function formatDateDisplay(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
}

/**
 * Date 객체를 'YYYY-MM-DD' 문자열로 변환한다.
 * @param {Date} date
 * @returns {string}
 */
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * selectedDate를 direction만큼 이동한다.
 * Date.setDate()는 월말/연말 경계를 자동으로 처리해준다.
 * @param {number} direction - 이전: -1, 다음: +1
 */
function navigateDate(direction) {
  const date = new Date(selectedDate + 'T00:00:00');
  date.setDate(date.getDate() + direction); // 날짜를 하루 앞뒤로 이동
  selectedDate = formatDateKey(date);
  renderDateDisplay();
  renderTodos();
}

/**
 * 날짜 네비게이션 UI를 현재 selectedDate에 맞게 갱신한다.
 * 오늘 날짜일 때만 '오늘' 배지를 표시한다.
 */
function renderDateDisplay() {
  dateLabel.textContent = formatDateDisplay(selectedDate);
  const isToday = selectedDate === getTodayString();
  todayBadge.classList.toggle('hidden', !isToday); // 오늘이면 배지 노출, 아니면 숨김
}

// ===== 로컬스토리지 =====

/**
 * 현재 todos 배열과 nextId를 로컬스토리지에 저장한다.
 * JSON.stringify로 직렬화해 문자열로 보관한다.
 */
function saveTodos() {
  const data = { todos, nextId };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 로컬스토리지에서 데이터를 불러와 상태를 복원한다.
 * 저장된 값이 없으면 초기 상태(빈 배열)를 그대로 유지한다.
 */
function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    todos = data.todos || [];
    nextId = data.nextId || 1;
  }
  renderDateDisplay();
  renderTodos();
}

// ===== Todo 생성 =====

/**
 * 입력창의 값을 읽어 새로운 Todo를 추가한다.
 * 생성 시 현재 selectedDate를 date 필드에 자동 저장한다.
 */
function createTodo() {
  const text = todoInput.value.trim();

  if (!text) {
    showError();
    return;
  }

  hideError();

  const newTodo = {
    id: nextId++,
    text: text,
    completed: false,
    date: selectedDate, // 현재 선택된 날짜를 저장
  };

  todos.push(newTodo);
  saveTodos(); // 추가 후 저장
  todoInput.value = '';
  renderTodos();
}

// ===== Todo 수정 =====

function startEditTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const listItem = document.querySelector(`[data-id="${id}"]`);
  if (!listItem) return;

  const textEl = listItem.querySelector('.todo-text');
  if (!textEl) return; // 이미 수정 모드인 경우 중복 진입 방지

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'todo-edit-input';
  editInput.value = todo.text;
  editInput.maxLength = 100;
  textEl.replaceWith(editInput);
  editInput.focus();

  const editBtn = listItem.querySelector('.action-button--edit');
  editBtn.textContent = '저장';
  editBtn.className = 'action-button action-button--save';
  editBtn.onclick = () => saveEditTodo(id, editInput);

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEditTodo(id, editInput);
    if (e.key === 'Escape') renderTodos();
  });
}

function saveEditTodo(id, editInput) {
  const newText = editInput.value.trim();

  if (!newText) {
    editInput.focus();
    return;
  }

  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = newText;
  }

  saveTodos(); // 수정 후 저장
  renderTodos();
}

// ===== Todo 완료 처리 =====

function toggleTodoCompleted(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
  saveTodos(); // 상태 변경 후 저장
  renderTodos();
}

// ===== Todo 삭제 =====

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos(); // 삭제 후 저장
  renderTodos();
}

// ===== 필터 =====

/**
 * selectedDate와 currentFilter를 모두 적용해 표시할 Todo 목록을 반환한다.
 * 날짜 필터를 먼저 적용한 뒤, 완료 상태 필터를 추가로 적용한다.
 */
function getFilteredTodos() {
  // 1차: 선택된 날짜의 Todo만 추림
  const todosOnDate = todos.filter((t) => t.date === selectedDate);

  // 2차: 완료 상태 탭 필터 적용
  if (currentFilter === 'active')    return todosOnDate.filter((t) => !t.completed);
  if (currentFilter === 'completed') return todosOnDate.filter((t) => t.completed);
  return todosOnDate;
}

function setFilter(filter) {
  currentFilter = filter;
  updateFilterTabUI();
  renderTodos();
}

function updateFilterTabUI() {
  filterTabs.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.filter === currentFilter);
  });
}

// ===== 렌더링 =====

function renderTodos() {
  todoList.innerHTML = '';

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    emptyState.classList.remove('hidden');
    emptyStateMessage.textContent = getEmptyMessage();
    todoSummary.innerHTML = '';
    return;
  }

  emptyState.classList.add('hidden');

  // 요약은 선택된 날짜 전체 기준 (탭 필터와 무관)
  const todosOnDate = todos.filter((t) => t.date === selectedDate);
  const completedCount = todosOnDate.filter((t) => t.completed).length;
  todoSummary.innerHTML = `전체 <span>${todosOnDate.length}</span>개 &nbsp;·&nbsp; 완료 <span>${completedCount}</span>개`;

  filteredTodos.forEach((todo) => {
    const listItem = createTodoElement(todo);
    todoList.appendChild(listItem);
  });
}

function getEmptyMessage() {
  if (currentFilter === 'active')    return '진행 중인 할 일이 없어요.';
  if (currentFilter === 'completed') return '완료된 할 일이 없어요.';
  return '이 날의 할 일이 없어요.';
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item${todo.completed ? ' is-completed' : ''}`;
  li.dataset.id = todo.id;

  const checkbox = document.createElement('div');
  checkbox.className = 'todo-checkbox';
  checkbox.title = todo.completed ? '완료 취소' : '완료 처리';
  checkbox.addEventListener('click', () => toggleTodoCompleted(todo.id));

  const textEl = document.createElement('span');
  textEl.className = 'todo-text';
  textEl.textContent = todo.text;

  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = '수정';
  editBtn.className = 'action-button action-button--edit';
  editBtn.disabled = todo.completed;
  editBtn.addEventListener('click', () => startEditTodo(todo.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '삭제';
  deleteBtn.className = 'action-button action-button--delete';
  deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(textEl);
  li.appendChild(actions);

  return li;
}

// ===== 오류 메시지 제어 =====

function showError() {
  errorMessage.classList.remove('hidden');
  todoInput.classList.add('is-error');
  todoInput.focus();
}

function hideError() {
  errorMessage.classList.add('hidden');
  todoInput.classList.remove('is-error');
}

// ===== 이벤트 등록 =====

addButton.addEventListener('click', createTodo);

todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createTodo();
});

todoInput.addEventListener('input', () => {
  if (todoInput.value.trim()) hideError();
});

filterTabs.addEventListener('click', (e) => {
  const tab = e.target.closest('.filter-tab');
  if (!tab) return;
  setFilter(tab.dataset.filter);
});

// 날짜 이동 버튼 이벤트
prevDateButton.addEventListener('click', () => navigateDate(-1));
nextDateButton.addEventListener('click', () => navigateDate(+1));

// ===== 초기화 =====
// 로컬스토리지에서 데이터를 불러온 뒤 렌더링한다.
// 저장된 데이터가 없으면 빈 상태로 시작한다.
loadTodos();
