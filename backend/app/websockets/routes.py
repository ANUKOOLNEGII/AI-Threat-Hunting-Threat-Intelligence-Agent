from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Optional
from .manager import manager
from ..auth.middleware.auth import get_current_user_ws
from ..database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from ..notifications.services import NotificationService
import json

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: AsyncSession = Depends(get_session),
):
    # Get current user from token
    try:
        user = await get_current_user_ws(token, db)
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(user.id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Optional: handle incoming messages from client
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(user.id, websocket)
    except Exception as e:
        manager.disconnect(user.id, websocket)
