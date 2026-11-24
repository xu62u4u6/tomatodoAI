from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..auth import verify_token
from ..db import get_session
from ..models import TimerSettings, utc_now
from ..schemas import TimerSettingsPayload


router = APIRouter(
    prefix="/api/timer-settings",
    tags=["timer-settings"],
    dependencies=[Depends(verify_token)],
)


@router.get("", response_model=TimerSettingsPayload)
def get_timer_settings(session: Session = Depends(get_session)) -> TimerSettings:
    settings = session.get(TimerSettings, 1)
    if settings is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timer settings not found")
    return settings


@router.put("", response_model=TimerSettingsPayload)
def save_timer_settings(
    payload: TimerSettingsPayload,
    session: Session = Depends(get_session),
) -> TimerSettings:
    settings = session.get(TimerSettings, 1)
    if settings is None:
        settings = TimerSettings(id=1, **payload.model_dump())
    else:
        settings.pomodoro = payload.pomodoro
        settings.short_break = payload.short_break
        settings.long_break = payload.long_break
        settings.updated_at = utc_now()

    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings
