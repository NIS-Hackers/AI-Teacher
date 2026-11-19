import { useCallback, useEffect, useRef, useState } from 'react'

export type TeacherCommand =
  | { action: 'speak'; params: { text: string } }
  | { action: 'error'; params: { text: string } }
  | { action: 'write_on_board'; params: { text: string; line?: number } }
  | { action: 'move_character'; params: { x: number; y: number; z: number } }

export function useTeacherSocket(onCommand: (cmd: TeacherCommand) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const cbRef = useRef(onCommand)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    cbRef.current = onCommand
  }, [onCommand])

  useEffect(() => {
    let disposed = false
    let reconnectTimer: number | undefined
    let retryDelay = 1000

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.hostname}:8000/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        if (wsRef.current !== ws) return
        retryDelay = 1000
        setConnected(true)
      }
      ws.onclose = () => {
        if (wsRef.current !== ws) return
        setConnected(false)
        if (!disposed) {
          reconnectTimer = window.setTimeout(connect, retryDelay)
          retryDelay = Math.min(retryDelay * 2, 10000)
        }
      }
      ws.onerror = (e) => console.error('WS error', e)
      ws.onmessage = (e) => {
        if (wsRef.current !== ws) return
        try {
          cbRef.current(JSON.parse(e.data) as TeacherCommand)
        } catch (err) {
          console.error('Bad command payload', e.data, err)
        }
      }
    }

    connect()
    return () => {
      disposed = true
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((text: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(text)
      return true
    }
    console.warn('WebSocket not connected')
    return false
  }, [])

  return { send, connected }
}