from collections.abc import Sequence

from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class TaskCreate(CamelModel):
    title: str = Field(min_length=1)
    est_pomodoros: int = Field(default=1, ge=1, le=100)
    note: str | None = None

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Title must not be empty")
        return stripped


class TaskUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1)
    is_completed: bool | None = None
    est_pomodoros: int | None = Field(default=None, ge=1, le=100)
    act_pomodoros: int | None = Field(default=None, ge=0, le=1000)
    note: str | None = None

    @field_validator("title")
    @classmethod
    def strip_optional_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("Title must not be empty")
        return stripped


class TaskRead(CamelModel):
    id: str
    title: str
    is_completed: bool
    est_pomodoros: int
    act_pomodoros: int
    note: str | None = None


class TaskBulkCreate(CamelModel):
    tasks: Sequence[TaskCreate]


class TaskReorderRequest(CamelModel):
    ids: list[str]


class ChatRequest(CamelModel):
    message: str = Field(min_length=1)
    system_instruction: str | None = None

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message must not be empty")
        return stripped


class ChatResponse(CamelModel):
    text: str


class ChatMessageRead(CamelModel):
    role: str
    content: str


class TimerSettingsPayload(CamelModel):
    pomodoro: int = Field(ge=1)
    short_break: int = Field(ge=1)
    long_break: int = Field(ge=1)
