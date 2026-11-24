from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Task(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    title: str
    is_completed: bool = False
    est_pomodoros: int = 1
    act_pomodoros: int = 0
    note: str | None = None
    sort_order: int = Field(default=0, index=True)
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str
    content: str
    created_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )


class TimerSettings(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    pomodoro: int
    short_break: int
    long_break: int
    updated_at: datetime = Field(
        default_factory=utc_now,
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
