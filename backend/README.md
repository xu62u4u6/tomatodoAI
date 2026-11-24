# TomatodoAI Backend

## Setup

```bash
cd backend
uv sync
cp .env.example .env
```

Fill in `.env`:

```env
TOMATODO_TOKEN=change-me
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-5-mini
DATABASE_URL=sqlite:///./tomatodo.db
```

Run the API locally:

```bash
cd backend
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The frontend should use:

```env
VITE_API_BASE=http://127.0.0.1:8000
VITE_TOMATODO_TOKEN=change-me
```

## API Summary

- `GET /api/tasks`
- `POST /api/tasks`
- `POST /api/tasks/bulk`
- `PATCH /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `PUT /api/tasks/reorder`
- `POST /api/chat`
- `GET /api/chat/history`
- `DELETE /api/chat/history`
- `GET /api/timer-settings`
- `PUT /api/timer-settings`

All `/api/*` routes require `Authorization: Bearer <TOMATODO_TOKEN>`.

## Verification

```bash
curl -H "Authorization: Bearer $TOMATODO_TOKEN" http://127.0.0.1:8000/api/tasks
curl -X POST \
  -H "Authorization: Bearer $TOMATODO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Write backend README","estPomodoros":1}' \
  http://127.0.0.1:8000/api/tasks
```

## 心得 / Notes

- The frontend already depended on a broad `StorageAdapter` that saves whole task arrays. To avoid touching `components/*`, the new HTTP adapter translates those array writes into backend CRUD plus reorder calls and keeps a local temp-ID to server-ID map for tasks created in the current session.
- Chat history now lives in SQLite and is written by the backend during `/api/chat`. The frontend still calls the old history adapter methods, so the HTTP adapter treats normal saves as compatibility no-ops and only converts the existing "clear chat" UI action into `DELETE /api/chat/history`.
- I removed the previous default task bootstrap from the app because a fresh backend should stay empty on first load. Without that change, the frontend would immediately repopulate SQLite and violate the fresh-start requirement.
- The API responses use camelCase aliases from Pydantic models so the existing `types.ts` stays untouched while SQLModel fields remain snake_case in Python and SQLite.
- A future improvement would be replacing the whole-array storage adapter contract with explicit task operations in the frontend. That would remove the diffing layer, reduce network chatter, and simplify optimistic updates.
