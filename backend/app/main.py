from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import os
from google import genai
from google.genai.errors import APIError
from google.genai import types
from dotenv import load_dotenv

# Load the API key from the .env file
load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(title="AI Teacher Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Teach the AI its persona and rules
SYSTEM_PROMPT = """
You are a friendly 3D teacher in a classroom. You explain concepts briefly.
When you teach, you MUST write the key formula or term on the board using the write_on_board tool.
After using the tool, explain the answer aloud in under 3 sentences.
"""
MODEL_NAME = "gemini-3.5-flash-lite"

# Define the Tool (Function Calling)
write_board_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="write_on_board",
            description="Write a line of text on the chalkboard",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "text": types.Schema(type="STRING", description="The text to write"),
                    "line": types.Schema(type="INTEGER", description="Which line to write on"),
                },
                required=["text"],
            ),
        )
    ]
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Teacher Backend is running"}

@app.websocket("/ws")
async def teacher_socket(ws: WebSocket):
    await ws.accept()
    print("Client connected")

    # Keep track of the conversation history
    chat_history = []

    try:
        while True:
            # Wait for a message from the frontend
            user_text = await ws.receive_text()
            print(f"User said: {user_text}")

            # Add user message to history
            chat_history.append(types.Content(role="user", parts=[types.Part(text=user_text)]))

            # Call Gemini
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=MODEL_NAME,
                    contents=chat_history,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        tools=[write_board_tool],
                    ),
                )
                candidate = response.candidates[0]
                content = candidate.content
                if content is None:
                    raise ValueError("Gemini returned no response content")

                chat_history.append(content)
                function_calls = [
                    part.function_call
                    for part in content.parts or []
                    if part.function_call is not None
                ]

                for function_call in function_calls:
                    if function_call.name != "write_on_board":
                        continue
                    board_text = dict(function_call.args or {}).get("text")
                    if board_text:
                        await ws.send_json({
                            "action": "write_on_board",
                            "params": {"text": board_text},
                        })

                spoken_text = [
                    part.text
                    for part in content.parts or []
                    if part.text
                ]

                if function_calls:
                    chat_history.append(types.Content(
                        role="user",
                        parts=[
                            types.Part.from_function_response(
                                name=function_call.name,
                                response={"success": True},
                            )
                            for function_call in function_calls
                        ],
                    ))
                    followup = await asyncio.to_thread(
                        client.models.generate_content,
                        model=MODEL_NAME,
                        contents=chat_history,
                        config=types.GenerateContentConfig(
                            system_instruction=SYSTEM_PROMPT,
                            tools=[write_board_tool],
                        ),
                    )
                    followup_content = followup.candidates[0].content
                    if followup_content is not None:
                        chat_history.append(followup_content)
                        spoken_text.extend(
                            part.text
                            for part in followup_content.parts or []
                            if part.text
                        )

                if spoken_text:
                    reply_text = " ".join(spoken_text)
                    if not function_calls:
                        await ws.send_json({
                            "action": "write_on_board",
                            "params": {"text": reply_text},
                        })
                    await ws.send_json({
                        "action": "speak",
                        "params": {"text": reply_text},
                    })
                else:
                    await ws.send_json({
                        "action": "error",
                        "params": {"text": "The AI returned no spoken response. Please try again."},
                    })
            except APIError:
                logger.exception("Gemini request failed")
                await ws.send_json({
                    "action": "error",
                    "params": {"text": "The AI service is temporarily unavailable. Please try again."},
                })
            except (IndexError, ValueError):
                logger.exception("Gemini returned an invalid response")
                await ws.send_json({
                    "action": "error",
                    "params": {"text": "The AI returned an invalid response. Please try again."},
                })

    except WebSocketDisconnect:
        print("Client disconnected")