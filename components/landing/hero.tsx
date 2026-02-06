"use client"

import Link from "next/link"
import { useState } from "react"

import { GL } from "./gl"
import { Pill } from "./pill"
import { Button } from "./ui/button"

export function LandingHero() {
  const [hovering, setHovering] = useState(false)

  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-between overflow-hidden border-b border-border/40 bg-black text-foreground">
      {/* Particles background */}
      <GL hovering={hovering} />

      {/* Overlay gradient for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black/90" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-end px-4 pb-16 pt-28 text-center sm:pt-32 md:pt-40">
        <Pill className="mb-6">PharmaHub · Beta</Pill>

        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Orchestrate your{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            pharma network
          </span>
        </h1>

        <p className="mt-6 max-w-xl font-mono text-sm text-foreground/70 sm:text-base">
          A single digital rail for retailers, distributors, and central teams to move medicines
          faster—with full compliance and control.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link className="contents" href="/auth/login">
            <Button
              className="mt-0"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              [Login to PharmaHub]
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

