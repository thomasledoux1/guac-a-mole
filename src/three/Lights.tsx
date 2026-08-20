import { useGameStore } from '../game/store'

export const Lights = () => {
  const shadows = useGameStore((state) => state.shadows)

  return (
    <>
      <ambientLight intensity={0.85} color='#fff3de' />
      <hemisphereLight intensity={0.4} color='#ffe9c4' groundColor='#b98f5f' />
      <directionalLight
        position={[4.5, 9, 5.5]}
        intensity={1.5}
        color='#fff6e6'
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0012}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={26}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} color='#cfe6ff' />
    </>
  )
}
