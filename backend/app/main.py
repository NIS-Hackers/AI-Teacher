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

            await ws.send_json({
                "action": "speak",
                "params": {"text": f"You said: {user_msg}"},
            })
            await ws.send_json({
                "action": "move_character",
                "params": {"x": 1.5, "y": 0.5, "z": -1.5},
            })
            await ws.send_json({
                "action": "write_on_board",
                "params": {"text": f"Q: {user_msg}", "x": 0, "y": 0},
            })
    except WebSocketDisconnect:
        print("Client disconnected")