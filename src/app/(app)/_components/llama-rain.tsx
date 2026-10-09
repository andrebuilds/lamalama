"use client"

import { CloudRainIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/shared/ui/button"

const SPAWN_WINDOW = 10 // seconds of new llamas after the click
const MAX_FALL = 4.5 // slowest llama, seconds
const HERD_SIZE = 48

// Falling poses, picked at random per llama.
const SPRITES = [
  { src: "/17-mini-llama-falling-sprite.png", width: 240, height: 296 },
  { src: "/19-mini-llama-fall-side-tumble.png", width: 240, height: 192 },
  { src: "/21-mini-llama-fall-on-back.png", width: 240, height: 232 },
] as const

type Llama = {
  id: number
  sprite: (typeof SPRITES)[number]
  left: number // vw, where it falls
  size: number // px
  duration: number // s
  delay: number // s, spread across the spawn window
  spin: number // deg, end rotation
}

/**
 * Easter egg: rains llama sprites from the top edge for 10 seconds.
 * Pure CSS animation (llama-fall keyframes in globals.css); the whole
 * overlay is aria-hidden and click-through.
 */
export function LlamaRain() {
  const [llamas, setLlamas] = useState<Llama[] | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  const makeItRain = () => {
    if (llamas) return
    setLlamas(
      Array.from({ length: HERD_SIZE }, (_, id) => ({
        id,
        sprite: SPRITES[Math.floor(Math.random() * SPRITES.length)],
        left: Math.random() * 94,
        size: 40 + Math.random() * 72,
        duration: 2.5 + Math.random() * (MAX_FALL - 2.5),
        delay: Math.random() * SPAWN_WINDOW,
        spin: -270 + Math.random() * 540,
      }))
    )
    timer.current = setTimeout(
      () => setLlamas(null),
      (SPAWN_WINDOW + MAX_FALL) * 1000
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={makeItRain}
        disabled={llamas !== null}
      >
        <CloudRainIcon />
        <span className="max-sm:hidden">
          {llamas ? "Llamageddon!" : "Make it rain"}
        </span>
      </Button>
      {llamas && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          {llamas.map((llama) => (
            <Image
              key={llama.id}
              src={llama.sprite.src}
              alt=""
              width={llama.sprite.width}
              height={llama.sprite.height}
              className="absolute top-0 select-none"
              style={
                {
                  left: `${llama.left}vw`,
                  width: llama.size,
                  height: "auto",
                  animation: `llama-fall ${llama.duration}s linear ${llama.delay}s both`,
                  "--llama-spin": `${llama.spin}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
