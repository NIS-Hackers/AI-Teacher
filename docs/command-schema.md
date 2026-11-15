// Tool Call from LLM -> Backend -> WebSocket -> Frontend
{
  "action": "move",
  "target": "character",
  "params": { "position": {"x": 0, "y": 0, "z": -2} }
}

{
  "action": "write_on_board",
  "params": { "text": "E = mc^2", "position": { "x": 10, "y": 20 } }
}

{
  "action": "play_animation",
  "params": { "name": "wave" }
}

{
  "action": "speak",
  "params": { "text": "Let's learn about physics." }
}