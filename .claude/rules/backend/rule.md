# 백엔드 구현 규칙

## 기술 스택

- FastAPI, SQLAlchemy, Pydantic, SQLite

## 데이터베이스 테이블 구조

테이블명: `todos`  
단일 테이블, 참조 관계 없음.

| 어트리뷰트 | 타입    | 제약 조건              | 설명                        |
|------------|---------|------------------------|-----------------------------|
| id         | Integer | Primary Key, index     | 항목 구분용 고유 식별자 (기작성) |
| innertext  | Text    | NOT NULL               | 할 일 내용 (빈 값 생성 불가) |
| complete   | Boolean | NOT NULL, default=False | 완료 여부                   |
| day        | Date    | NOT NULL               | 해당 날짜 (날짜별 목록 필터링) |

### 필드 상세

- **innertext**: 사용자가 텍스트 입력창에 입력한 내용. 빈 문자열이면 생성 요청을 거부함.
- **complete**: 완료 토글 상태. 기본값 `false`, `true`/`false`만 허용.
- **day**: 프론트엔드에서 선택된 날짜. 이 값이 바뀌면 해당 날짜의 Todo 목록만 반환함. 형식: `YYYY-MM-DD`.

---

## SQLAlchemy 모델

```python
from sqlalchemy import Column, Integer, Text, Boolean, Date

class Todo(Base):
    __tablename__ = "todos"
    id         = Column(Integer, primary_key=True, index=True)
    innertext  = Column(Text, nullable=False)
    complete   = Column(Boolean, nullable=False, default=False)
    day        = Column(Date, nullable=False)
```

---

## Pydantic 스키마

```python
from datetime import date
from typing import Optional

class TodoCreate(BaseModel):
    innertext: str
    day: date

class TodoUpdate(BaseModel):
    innertext: Optional[str] = None
    complete: Optional[bool] = None
    day: Optional[date] = None

class TodoResponse(BaseModel):
    id: int
    innertext: str
    complete: bool
    day: date

    model_config = {"from_attributes": True}
```

---

## API 엔드포인트

| 메서드 | 경로          | 설명                    |
|--------|---------------|-------------------------|
| GET    | `/todos`      | 전체 Todo 목록 조회     |
| POST   | `/todos`      | 새 Todo 생성            |
| PATCH  | `/todos/{id}` | 특정 Todo 수정          |
| DELETE | `/todos/{id}` | 특정 Todo 삭제          |

### GET `/todos`

- 입력값 없음.
- `todos` 테이블의 전체 튜플 반환.
- 응답: `List[TodoResponse]`

### POST `/todos`

- 요청 바디: `innertext` (not null), `day` (not null)
- `complete`는 기본값 `false`로 삽입.
- `innertext`가 빈 문자열이면 `400 Bad Request` 반환.
- 응답: `TodoResponse` (`201 Created`)

### PATCH `/todos/{id}`

- 경로 파라미터: `id`
- 요청 바디: `innertext`, `complete`, `day` 중 변경할 것만 포함 (모두 Optional)
- 보내지 않은 필드는 기존 값 유지.
- 존재하지 않는 id면 `404 Not Found`.
- 응답: 수정된 `TodoResponse`

### DELETE `/todos/{id}`

- 경로 파라미터: `id`
- 존재하지 않는 id면 `404 Not Found`.
- 응답: `204 No Content`

---

## CORS 설정

프론트엔드(Next.js)가 `http://localhost:3000`에서 실행되므로 해당 출처를 허용.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## DB 세션 의존성

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 구현 규칙

- `innertext` 빈 문자열 검증은 엔드포인트 내부에서 처리 (`if not body.innertext.strip()`).
- PATCH 시 `TodoUpdate`의 필드가 `None`인 경우 해당 컬럼은 업데이트하지 않음.
- 응답 모델은 항상 `response_model=TodoResponse` 또는 `List[TodoResponse]`로 명시.
- DB 세션은 반드시 `Depends(get_db)`로 주입.
