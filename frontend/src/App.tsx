import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useRef, useState, type FormEvent } from 'react'
import * as THREE from 'three'
import { useTeacherSocket, type TeacherCommand } from './useTeacherSocket'

function Character({ target }: { target: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (!ref.current) return
    const p = ref.current.position
    p.x = THREE.MathUtils.lerp(p.x, target[0], 0.08)
    p.y = THREE.MathUtils.lerp(p.y, target[1], 0.08)
    p.z = THREE.MathUtils.lerp(p.z, target[2], 0.08)
  })
  return (
    <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="#4a90e2" />
    </mesh>
  )
}

function Classroom({
  charTarget,
  boardText,
}: {
  charTarget: [number, number, number]
  boardText: string
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Frame (rendered first so board sits on top of it visually) */}
      <mesh position={[0, 1.8, -3.02]}>
        <planeGeometry args={[7.2, 3.7]} />
        <meshStandardMaterial color="#5c3d1e" />
      </mesh>

      {/* Green board */}
      <mesh position={[0, 1.8, -3]} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial color="#0a5c36" />
      </mesh>

      {/* Board text */}
      {boardText && (
        <Text
          position={[-3.2, 3.35, -2.97]}
          font="/fonts/Chalkduster.ttf"
          fontSize={0.22}
          color="#f5f5f0"
          anchorX="left"
          anchorY="top"
          maxWidth={6.4}
          lineHeight={1.3}
        >
          {boardText}
        </Text>
      )}
      <Character target={charTarget} />

      <OrbitControls
        target={[0, 1, -1]}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export default function App() {
  const [charTarget, setCharTarget] = useState<[number, number, number]>([0, 0.5, 0])
  const [boardText, setBoardText] = useState('')
  const [input, setInput] = useState('')

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.0
    u.pitch = 1.0
    window.speechSynthesis.speak(u)
  }

  const handleCommand = (cmd: TeacherCommand) => {
    switch (cmd.action) {
      case 'move_character':
        setCharTarget([cmd.params.x, cmd.params.y, cmd.params.z])
        break
      case 'speak':
        speak(cmd.params.text)
        break
      case 'write_on_board':
        setBoardText((prev) => (prev ? prev + '\n' : '') + cmd.params.text)
        break
    }
  }

  const { send, connected } = useTeacherSocket(handleCommand)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    send(text)
    setInput('')
  }

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 4], fov: 50 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Classroom charTarget={charTarget} boardText={boardText} />
      </Canvas>

      <div
        style={{
          position: 'fixed',
          left: 16,
          right: 16,
          bottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <form onSubmit={onSubmit} style={{ display: 'flex', flex: 1, gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your teacher..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #444',
              background: '#1f1f1f',
              color: '#eee',
              fontSize: 16,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#4a90e2',
              color: 'white',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
        <span
          style={{
            color: connected ? '#4ade80' : '#f87171',
            fontSize: 12,
            minWidth: 90,
            textAlign: 'right',
          }}
        >
          {connected ? '● connected' : '● offline'}
        </span>
      </div>
    </>
  )
}