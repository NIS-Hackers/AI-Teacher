import asyncio
import websockets

async def test():
    uri = "ws://127.0.0.1:8000/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to server!")
        
        # Ask the AI a question
        question = "Teach me the formula for the area of a circle."
        print(f"Sending: {question}")
        await websocket.send(question)
        
        # Listen for 3 messages from the server (it might send tool call, then speak)
        for _ in range(3):
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                print(f"Received from AI: {response}")
            except asyncio.TimeoutError:
                print("Finished listening.")
                break

asyncio.run(test())