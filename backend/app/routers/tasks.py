from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, select

from ..auth import verify_token
from ..db import get_session
from ..models import Task
from ..schemas import TaskBulkCreate, TaskCreate, TaskRead, TaskReorderRequest, TaskUpdate


router = APIRouter(
    prefix="/api/tasks",
    tags=["tasks"],
    dependencies=[Depends(verify_token)],
)


def list_tasks(session: Session) -> list[Task]:
    return list(session.exec(select(Task).order_by(Task.sort_order, Task.created_at)).all())


@router.get("", response_model=list[TaskRead])
def get_tasks(session: Session = Depends(get_session)) -> list[Task]:
    return list_tasks(session)


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: Session = Depends(get_session)) -> Task:
    next_order = len(list_tasks(session))
    task = Task(
        title=payload.title,
        est_pomodoros=payload.est_pomodoros,
        note=payload.note,
        sort_order=next_order,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.post("/bulk", response_model=list[TaskRead], status_code=status.HTTP_201_CREATED)
def create_tasks_bulk(payload: TaskBulkCreate, session: Session = Depends(get_session)) -> list[Task]:
    existing = list_tasks(session)
    created: list[Task] = []
    next_order = len(existing)

    for item in payload.tasks:
        task = Task(
            title=item.title,
            est_pomodoros=item.est_pomodoros,
            note=item.note,
            sort_order=next_order,
        )
        next_order += 1
        session.add(task)
        created.append(task)

    session.commit()

    for task in created:
        session.refresh(task)

    return created


@router.put("/reorder", response_model=list[TaskRead])
def reorder_tasks(payload: TaskReorderRequest, session: Session = Depends(get_session)) -> list[Task]:
    tasks = list_tasks(session)
    tasks_by_id = {task.id: task for task in tasks}

    if set(payload.ids) != set(tasks_by_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reorder ids must exactly match existing tasks",
        )

    for index, task_id in enumerate(payload.ids):
        tasks_by_id[task_id].sort_order = index
        session.add(tasks_by_id[task_id])

    session.commit()
    return list_tasks(session)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: str, payload: TaskUpdate, session: Session = Depends(get_session)) -> Task:
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(task, field_name, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, session: Session = Depends(get_session)) -> Response:
    task = session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    session.delete(task)
    session.commit()

    remaining = list_tasks(session)
    for index, item in enumerate(remaining):
        if item.sort_order != index:
            item.sort_order = index
            session.add(item)
    session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
