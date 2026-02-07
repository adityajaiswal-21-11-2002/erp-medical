"use client"

import Link from "next/link"
import Image from "next/image"

import { Pill } from "./pill"
import { Button } from "./ui/button"

export function LandingHero() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-between overflow-hidden border-b border-border/40 bg-black text-foreground">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/v1.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Split layout: text left, image right on larger screens */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-4 pb-12 pt-24 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8 lg:pt-32">
        <div className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
          <Pill className="mb-6">PharmaHub · Beta</Pill>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Orchestrate your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              pharma network
            </span>
          </h1>

          <p className="mt-6 max-w-xl font-mono text-sm text-foreground/80 sm:text-base">
            A single digital rail for retailers, distributors, and central teams to move medicines
            faster—with full compliance and control.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/auth/login" className="contents">
              <Button size="lg" className="gap-2 shadow-lg transition-all hover:scale-[1.02]">
                [Login to PharmaHub]
              </Button>
            </Link>
          </div>

          {/* Trust stats bar */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-white sm:text-3xl">500+</p>
              <p className="text-xs text-foreground/60 sm:text-sm">Retailers</p>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-white sm:text-3xl">99.5%</p>
              <p className="text-xs text-foreground/60 sm:text-sm">Order accuracy</p>
            </div>
            <div className="hidden h-8 w-px bg-white/30 sm:block" />
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-white sm:text-3xl">24/7</p>
              <p className="text-xs text-foreground/60 sm:text-sm">Support</p>
            </div>
          </div>
        </div>

        {/* Hero image - visible on larger screens */}
        <div className="relative hidden w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:block lg:max-w-lg">
          <Image
            src="/images/home-hero-office.jpeg"
            alt="PharmaHub office operations"
            width={600}
            height={400}
            className="h-auto w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>
    </section>
  )
}
