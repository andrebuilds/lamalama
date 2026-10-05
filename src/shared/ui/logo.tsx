import Image from "next/image"

import { cn } from "@/shared/lib/utils"

/**
 * The LamaLama mark. Decorative: put it next to the name, which stays the
 * accessible label. The artwork has wide margins, so it's scaled up inside a
 * clipped box to let the llamas fill the mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-8 shrink-0 overflow-hidden",
        className
      )}
    >
      <Image
        src="/logo_no_background.png"
        alt=""
        fill
        sizes="48px"
        className="scale-[1.45] object-contain"
      />
    </span>
  )
}
