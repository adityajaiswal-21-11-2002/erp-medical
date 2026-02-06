"use client"

import * as THREE from "three"
import React, { useMemo, useState, useRef } from "react"
import { createPortal, useFrame, type ThreeElements } from "@react-three/fiber"
import { useFBO } from "@react-three/drei"
import * as easing from "maath/easing"

import { DofPointsMaterial } from "./shaders/pointMaterial"
import { SimulationMaterial } from "./shaders/simulationMaterial"

type ParticlesProps = {
  speed: number
  aperture: number
  focus: number
  size: number
  noiseScale?: number
  noiseIntensity?: number
  timeScale?: number
  pointSize?: number
  opacity?: number
  planeScale?: number
  useManualTime?: boolean
  manualTime?: number
  introspect?: boolean
} & ThreeElements["points"]

export function Particles({
  speed,
  aperture,
  focus,
  size = 512,
  noiseScale = 1.0,
  noiseIntensity = 0.5,
  timeScale = 0.5,
  pointSize = 2.0,
  opacity = 1.0,
  planeScale = 1.0,
  useManualTime = false,
  manualTime = 0,
  introspect = false,
  ...props
}: ParticlesProps) {
  // Reveal animation state
  const revealStartTime = useRef<number | null>(null)
  const [isRevealing, setIsRevealing] = useState(true)
  const revealDuration = 3.5 // seconds

  // Create simulation material with scale parameter
  const simulationMaterialRef = useRef<SimulationMaterial | null>(null)
  const simulationMaterial = useMemo(() => {
    const mat = new SimulationMaterial(planeScale)
    simulationMaterialRef.current = mat
    return mat
  }, [planeScale])

  const target = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  })

  const dofPointsMaterialRef = useRef<DofPointsMaterial | null>(null)
  const dofPointsMaterial = useMemo(() => {
    const m = new DofPointsMaterial()
    m.uniforms.positions.value = target.texture
    m.uniforms.initialPositions.value = simulationMaterial.uniforms.positions.value
    dofPointsMaterialRef.current = m
    return m
  }, [simulationMaterial, target.texture])

  const [scene] = useState(() => new THREE.Scene())
  const [camera] = useState(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)
  )
  const [positions] = useState(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ])
  )
  const [uvs] = useState(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])
  )

  const particles = useMemo(() => {
    const length = size * size
    const data = new Float32Array(length * 3)
    for (let i = 0; i < length; i++) {
      const i3 = i * 3
      data[i3 + 0] = (i % size) / size
      data[i3 + 1] = i / size / size
    }
    return data
  }, [size])

  useFrame((state, delta) => {
    const dofMat = dofPointsMaterialRef.current
    const simMat = simulationMaterialRef.current
    if (!dofMat || !simMat) return

    state.gl.setRenderTarget(target)
    state.gl.clear()
    // @ts-expect-error three types
    state.gl.render(scene, camera)
    state.gl.setRenderTarget(null)

    // Use manual time if enabled, otherwise use elapsed time
    const currentTime = useManualTime ? manualTime ?? 0 : state.clock.elapsedTime

    // Initialize reveal start time on first frame
    if (revealStartTime.current === null) {
      revealStartTime.current = currentTime
    }

    // Calculate reveal progress
    const revealElapsed = currentTime - revealStartTime.current
    const revealProgress = Math.min(revealElapsed / revealDuration, 1.0)

    // Ease out the reveal animation
    const easedProgress = 1 - Math.pow(1 - revealProgress, 3)

    // Map progress to reveal factor (0 = fully hidden, higher values = more revealed)
    // We want to start from center (0) and expand outward (higher values)
    const revealFactor = easedProgress * 4.0 // Larger radius for coverage

    if (revealProgress >= 1.0 && isRevealing) {
      setIsRevealing(false)
    }

    dofMat.uniforms.uTime.value = currentTime
    dofMat.uniforms.uFocus.value = focus
    dofMat.uniforms.uBlur.value = aperture

    easing.damp(
      dofMat.uniforms.uTransition,
      "value",
      introspect ? 1.0 : 0.0,
      introspect ? 0.35 : 0.2,
      delta
    )

    simMat.uniforms.uTime.value = currentTime
    simMat.uniforms.uNoiseScale.value = noiseScale
    simMat.uniforms.uNoiseIntensity.value = noiseIntensity
    simMat.uniforms.uTimeScale.value = timeScale * speed

    // Update point material uniforms
    dofMat.uniforms.uPointSize.value = pointSize
    dofMat.uniforms.uOpacity.value = opacity
    dofMat.uniforms.uRevealFactor.value = revealFactor
    dofMat.uniforms.uRevealProgress.value = easedProgress
  })

  return (
    <>
      {createPortal(
        // @ts-expect-error three types
        <mesh material={simulationMaterial}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
          </bufferGeometry>
        </mesh>,
        // @ts-expect-error three types
        scene
      )}
      {/* @ts-expect-error three types */}
      <points material={dofPointsMaterial} {...props}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
      </points>
    </>
  )
}

