# Todo App

백엔드(FastAPI) + 프론트엔드(Next.js)로 구성된 Todo 앱.

## 프로젝트 구조

```
backend/    # FastAPI 서버
frontend/   # Next.js 앱
```

## 백엔드

- **스택**: FastAPI, SQLAlchemy, Pydantic, SQLite
- **역할**: Todo 데이터 CRUD API 제공 (조회, 생성, 수정, 삭제)
- **진입점**: `backend/main.py` (기본 골격 작성됨)
- **실행**: `backend/` 디렉토리에서 `uvicorn main:app --reload`
- **패키지 설치**: `backend/` 디렉토리에서 `pip install -r requirements.txt`

## 프론트엔드

- **스택**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **실행**: `frontend/` 디렉토리에서 `npm run dev`
- **디자인**: 깔끔하고 미니멀한 생산성 앱 스타일, 메인 컬러 `#672be0`

## 공통 규칙

### 데이터 모델 (프론트-백 공유 스펙)

Todo 항목의 핵심 필드:

| 필드명    | 타입    | 설명                              |
|-----------|---------|-----------------------------------|
| id        | number  | 고유 식별자 (백엔드 자동 부여)    |
| innertext | string  | 할 일 내용 (비어있으면 생성 불가) |
| complete  | boolean | 완료 여부 (기본값: false)         |
| day       | date    | 날짜 `YYYY-MM-DD` (날짜별 필터링) |

### 날짜 연동

- 백엔드는 전체 목록을 반환하고, 날짜별 필터링은 프론트엔드에서 `day` 필드로 수행.
- 날짜 형식은 `YYYY-MM-DD`로 통일.

### 상세 규칙 위치

- 백엔드: `.claude/rules/backend/rule.md`
- 프론트엔드: `.claude/rules/frontend/rule.md`
