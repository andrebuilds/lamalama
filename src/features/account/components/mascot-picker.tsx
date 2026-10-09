"use client"

import { BanIcon } from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"

import { toast } from "@/shared/ui/toast"

import { chooseMascot } from "../actions"
import { findMascot, mascots, type MascotId } from "../lib/mascots"

const tileClass =
  "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border bg-background p-2 text-xs font-medium transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-default has-disabled:opacity-60"

/** Picks the llama shown in the user menu. Saves on click. */
export function MascotPicker({ current }: { current: string | null }) {
  const [selected, setSelected] = useState<MascotId | null>(
    findMascot(current)?.id ?? null
  )
  const [isSaving, startSave] = useTransition()

  function pick(next: MascotId | null) {
    const previous = selected
    setSelected(next)
    startSave(async () => {
      const result = await chooseMascot(next)
      if (result.ok) {
        toast.add({
          type: "success",
          title: next ? "Mascot saved" : "Mascot removed",
        })
      } else {
        setSelected(previous)
        toast.add({ type: "error", title: result.error.message })
      }
    })
  }

  return (
    <fieldset disabled={isSaving}>
      <legend className="sr-only">Mascot</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {mascots.map((mascot) => (
          <label key={mascot.id} className={tileClass}>
            <input
              type="radio"
              name="mascot"
              value={mascot.id}
              checked={selected === mascot.id}
              onChange={() => pick(mascot.id)}
              className="sr-only"
            />
            <Image
              src={mascot.src}
              alt=""
              width={96}
              height={96}
              className="size-20 object-contain"
            />
            {mascot.label}
          </label>
        ))}
        <label className={tileClass}>
          <input
            type="radio"
            name="mascot"
            value=""
            checked={selected === null}
            onChange={() => pick(null)}
            className="sr-only"
          />
          <span className="flex size-20 items-center justify-center text-muted-foreground">
            <BanIcon aria-hidden className="size-8" />
          </span>
          None
        </label>
      </div>
    </fieldset>
  )
}
