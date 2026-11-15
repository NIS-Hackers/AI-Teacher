import { useCallback, useEffect, useRef, useState } from 'react'

export type TeacherCommand =
  | { action: 'speak'; params: { text: string } }
  | { action: 'write_on_board'; params: { text: string; x: number; y: number } }
  | { action: 'move_character'; params: { x: number; y: number; z: number } }

export function useTeacherSocket(onCommand: (cmd: TeacherCommand) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const cbRef = useRef(onCommand)
  const [connected, setConnected] = useState(false)
  cbRef.current = onCommand

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = (e) => console.error('WS error', e)
    ws.onmessage = (e) => {
      try {
        cbRef.current(JSON.parse(e.data) as TeacherCommand)
      } catch (err) {
        console.error('Bad command payload', e.data, err)
      }
    }
    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((text: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(text)
    else console.warn('WebSocket not connected')
  }, [])

  return { send, connected }
}