from fastapi import APIRouter, Depends, HTTPException, Response, status
from openai import OpenAI
from sqlmodel import Session, delete, select

from ..auth import verify_token
from ..config import Settings, get_settings
from ..db import get_session
from ..models import ChatMessage
from ..schemas import ChatMessageRead, ChatRequest, ChatResponse


router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
    dependencies=[Depends(verify_token)],
)

DEFAULT_SYSTEM_PROMPT = """You are **TomatodoAI**, an intelligent productivity assistant.

Your primary goal is to help the user break down complex projects into clear, actionable tasks.

**IMPORTANT: Always respond in Traditional Chinese if user using Traditional Chinese (繁體中文).**

When the user sends a message:
1. Analyze the user's current context, goals, and workload.
2. Produce a friendly, conversational response in the **"text"** field.
3. If there are meaningful opportunities to break down work, propose tasks in **"suggestedTasks"**.

Guidelines for suggested tasks:
- Provide **3–5** high-quality, useful task suggestions when appropriate.
- Each task must include:
  - **title** (string)
  - **estPomodoros** (integer, conservative estimate of 25-minute blocks)
- Only suggest tasks when they add real value. Otherwise, return an empty array.

Output format requirement:
- You must respond with **valid JSON only**.
- The JSON must contain exactly two properties:
  - "text": string
  - "suggestedTasks": array of objects with { "title": string, "estPomodoros": number }

Example schema (do NOT output this literally):
{
  "text": "...",
  "suggestedTasks": [
    { "title": "...", "estPomodoros": 1 },
    ...
  ]
}
"""


def load_history(session: Session) -> list[ChatMessage]:
    return list(session.exec(select(ChatMessage).order_by(ChatMessage.created_at, ChatMessage.id)).all())


def ensure_system_message(
    session: Session,
    history: list[ChatMessage],
    system_instruction: str | None,
) -> list[ChatMessage]:
    if history:
        return history

    system_message = ChatMessage(
        role="system",
        content=system_instruction or DEFAULT_SYSTEM_PROMPT,
    )
    session.add(system_message)
    session.commit()
    session.refresh(system_message)
    return [system_message]


@router.post("", response_model=ChatResponse)
def send_chat_message(
    payload: ChatRequest,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> ChatResponse:
    history = ensure_system_message(session, load_history(session), payload.system_instruction)

    user_message = ChatMessage(role="user", content=payload.message)
    session.add(user_message)
    session.commit()
    session.refresh(user_message)

    history = load_history(session)
    window = history if len(history) <= 11 else [history[0], *history[-10:]]

    client = OpenAI(api_key=settings.openai_api_key)
    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": item.role, "content": item.content} for item in window],
            response_format={"type": "json_object"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to reach OpenAI",
        ) from exc

    response_text = completion.choices[0].message.content or "{}"
    assistant_message = ChatMessage(role="assistant", content=response_text)
    session.add(assistant_message)
    session.commit()

    return ChatResponse(text=response_text)


@router.get("/history", response_model=list[ChatMessageRead])
def get_chat_history(session: Session = Depends(get_session)) -> list[ChatMessage]:
    return load_history(session)


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
def clear_chat_history(session: Session = Depends(get_session)) -> Response:
    session.exec(delete(ChatMessage))
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
