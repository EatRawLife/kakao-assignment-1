from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, Text, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, model_validator
from datetime import date
from typing import Optional, List

DATABASE_URL = "sqlite:///./todos.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Todo(Base):
    __tablename__ = "todos"
    id        = Column(Integer, primary_key=True, index=True)
    innertext = Column(Text, nullable=False)
    complete  = Column(Boolean, nullable=False, default=False)
    day       = Column(Date, nullable=False)



# 피단틱 모델들

# 튜플 생성용, id 는 자동생성.
class TodoCreate(BaseModel):
    innertext: str
    day: date

# 조건을 주고 업데이트 하는 용. api를 사용할때 유동적으로 조건을 바꾸기위해 모두 옵션으로.
class TodoUpdate(BaseModel):
    innertext: Optional[str] = None # 옵셔널하게 None을 채워넣음, (API 사용시 참고)
    complete:  Optional[bool] = None
    day:       Optional[date] = None

    @model_validator(mode="after")# 필드 검증 이후에 실행
    def at_least_one_field(self):
        if self.innertext is None and self.complete is None and self.day is None:
            raise ValueError("at least one field must be provided")# 기본적으로 422에러.
        return self

#리스폰스 용
class TodoResponse(BaseModel):
    id:        int
    innertext: str
    complete:  bool
    day:       date

    model_config = {"from_attributes": True} # 리스폰스 용 => 피단틱이 SQLAlchemy 객체를 읽을 수 있게


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal() # DB 세션을 열고
    try:
        yield db # 넘김
    finally:
        db.close() # 마지막에 세션닫기(자원 누수 방지)


@app.get("/todos", response_model=List[TodoResponse])
def get_todos(db: Session = Depends(get_db)):
    return db.query(Todo).all()


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(body: TodoCreate, db: Session = Depends(get_db)):
    if not body.innertext.strip():
        raise HTTPException(status_code=400, detail="innertext must not be empty")
    todo = Todo(innertext=body.innertext, day=body.day)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.patch("/todos/{todo_id}", response_model=TodoResponse) # id를 통해서 수정
def update_todo(todo_id: int, body: TodoUpdate, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()# 리스트 반환이라 first 필요
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    if body.innertext is not None:
        todo.innertext = body.innertext
    if body.complete is not None:
        todo.complete = body.complete
    if body.day is not None:
        todo.day = body.day
    db.commit()
    db.refresh(todo) # 객체 반환 위해 갱신.
    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db.delete(todo)
    db.commit()
