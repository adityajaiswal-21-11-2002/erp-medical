"use client"

import { Canvas } from "@react-three/fiber"

import { Particles } from "./particles"

export const GL = ({ hovering }: { hovering: boolean }) => {
  const config = {
    speed: 1.0,
    noiseScale: 0.6,
    noiseIntensity: 0.52,
    timeScale: 1,
    focus: 3.8,
    aperture: 1.79,
    pointSize: 10.0,
    opacity: 0.8,
    planeScale: 10.0,
    size: 512,
    useManualTime: false,
    manualTime: 0,
  }

  return (
    <div id="webgl" className="absolute inset-0 -z-10">
      <Canvas
        camera={{
          position: [1.2629783123314589, 2.664606471394044, -1.8178993743288914],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={["#000"]} />
        <Particles {...config} introspect={hovering} />
      </Canvas>
    </div>
  )
}

