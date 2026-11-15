from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.websocket("/ws")
async def teacher_socket(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            user_msg = await ws.receive_text()
            # TEMP: hardcoded response, replace with LLM later
            await ws.send_json({"type": "command", "action": "speak",
                                "params": {"text": f"You said: {user_msg}"}})
            await ws.send_json({"type": "command", "action": "write_on_board",
                                "params": {"text": "Hello!", "x": 10, "y": 20}})
    except WebSocketDisconnect:
        pass