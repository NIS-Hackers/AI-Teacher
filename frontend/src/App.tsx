import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Classroom() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1} castShadow />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Green chalkboard on the back wall */}
      <mesh position={[0, 1.8, -3]} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial color="#0a5c36" />
      </mesh>

      {/* Chalkboard frame (thin border) */}
      <mesh position={[0, 1.8, -3.01]}>
        <planeGeometry args={[7.2, 3.7]} />
        <meshStandardMaterial color="#5c3d1e" />
      </mesh>

      {/* Character placeholder: a cube "teacher" */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>

      {/* Camera controls (temporary, will be locked later) */}
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
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.8, 4], fov: 50 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <Classroom />
    </Canvas>
  )
}