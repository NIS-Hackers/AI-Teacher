from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Teacher Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Teacher Backend is running"}


@app.websocket("/ws")
async def teacher_socket(ws: WebSocket):
    await ws.accept()
    print("Client connected")
    try:
        while True:
            user_msg = await ws.receive_text()
            print(f"Received: {user_msg}")

            # TEMP: hardcoded response — replace with LLM call later
            await ws.send_json({
                "type": "command",
                "action": "speak",
                "params": {"text": f"You said: {user_msg}"},
            })
            await ws.send_json({
                "type": "command",
                "action": "write_on_board",
                "params": {"text": "Hello!", "x": 0, "y": 1.8},
            })
    except WebSocketDisconnect:
        print("Client disconnected")