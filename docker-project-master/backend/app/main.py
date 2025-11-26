#Sidecar pour les logs du backend
import logging
import os

os.makedirs("/app/logs", exist_ok=True)  

logging.basicConfig(
    filename='/app/logs/backend.log',  
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
)
logging.info("Backend démarré")

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, database
from .database import engine, SessionLocal
from .utils import APIResponse

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database.create_tables_if_not_exist([models.Task])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        # Log any database-related exceptions
        print(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

@app.get("/")
async def root():
    return APIResponse(
        success=True,
        message="Welcome to Trippi API",
        data={
            "docs": f"/api/v1/docs",
            "redoc": f"/api/v1/redoc",
            "version": "1.0.0" 
        }
    )
@app.post("/create_task", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/get_task", response_model=list[schemas.Task])
def read_tasks(
    archived: bool = False,
    starred: bool = None,
    priority: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Task).filter(models.Task.archived == archived)
    
    if starred is not None:
        query = query.filter(models.Task.starred == starred)
    
    if priority:
        query = query.filter(models.Task.priority == priority)
    
    return query.order_by(models.Task.due_date).all()

@app.put("/task/{task_id}")
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Log pour débogage
    print(f"Updating task {task_id} with:", task.dict())
    
    update_data = task.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    
    return db_task

@app.delete("/task/{task_id}", response_model=APIResponse)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    
    return APIResponse(
        success=True,
        message="Task deleted successfully",
        data={"deleted_task_id": task_id}
    )

@app.get("/health")
async def health_check():
    return {"status": "ok"}