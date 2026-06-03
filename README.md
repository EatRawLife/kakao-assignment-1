# Todo App

날짜별로 할 일을 관리하는 Vanilla JS 웹 애플리케이션입니다.

## 기능

- **Todo CRUD** — 할 일 추가 / 수정 / 삭제
- **완료 처리** — 체크박스로 완료 상태 토글
- **날짜별 관리** — 날짜를 이동하며 해당 날짜의 Todo만 표시
- **필터 탭** — 전체 / 진행 중 / 완료 상태별 분류
- **데이터 영속성** — 로컬스토리지에 자동 저장, 새로고침 후에도 복원

## 기술 스택

| 분류 | 사용 기술 |
|---|---|
| 마크업 | HTML5 |
| 스타일 | CSS3 (CSS Custom Properties) |
| 로직 | Vanilla JavaScript (ES6+) |
| 저장소 | Web Storage API (localStorage) |

> 외부 라이브러리 및 프레임워크 미사용

## 파일 구조

```
assignment1/
├── index.html   # 앱 레이아웃 및 마크업
├── style.css    # 스타일시트
└── app.js       # 앱 로직 (상태 관리, 렌더링, 이벤트)
```

## 실행 방법

별도의 빌드 과정 없이 `index.html`을 브라우저에서 바로 열면 됩니다.

```bash
# VS Code Live Server 사용 시
open index.html
```

또는 `index.html` 파일을 브라우저로 드래그 앤 드롭합니다.

## 주요 구현 사항

### 날짜 관리
- `YYYY-MM-DD` 문자열 형식으로 날짜를 통일 관리해 문자열 비교(`===`)만으로 날짜 일치 여부를 판별합니다.
- `new Date(dateString + 'T00:00:00')` 형식으로 파싱해 UTC/로컬 시간대 차이로 인한 날짜 밀림 현상을 방지합니다.

### 로컬스토리지
- Todo 배열과 다음 ID를 하나의 객체로 묶어 `JSON.stringify`로 직렬화해 저장합니다.
- 페이지 로드 시 `JSON.parse`로 역직렬화해 이전 상태를 완전히 복원합니다.

### 이벤트 처리
- 필터 탭은 이벤트 위임(Event Delegation) 패턴으로 부모 요소 하나에 리스너를 등록하고, `closest()`로 클릭된 탭을 찾습니다.
