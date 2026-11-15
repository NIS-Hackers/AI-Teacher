// WebSocket message from backend → frontend
{
  "type": "command",
  "action": "move_character",
  "params": { "x": 0, "y": 0, "z": -2, "duration_ms": 800 }
}

{
  "type": "command",
  "action": "play_animation",
  "params": { "name": "wave" }
}

{
  "type": "command",
  "action": "write_on_board",
  "params": { "text": "E = mc^2", "x": 10, "y": 20, "clear_first": false }
}

{
  "type": "command",
  "action": "clear_board",
  "params": {}
}

{
  "type": "command",
  "action": "speak",
  "params": { "text": "Let's start with Newton's second law." }
}