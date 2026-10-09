/** The llama mascots a user can pick (images in public/user-avatar). */
export const mascotIds = [
  "director",
  "dj",
  "artist",
  "explorer",
  "coder",
  "astronaut",
  "rockstar",
] as const

export type MascotId = (typeof mascotIds)[number]

export type Mascot = { id: MascotId; label: string; src: string }

export const mascots: Mascot[] = [
  {
    id: "director",
    label: "Director",
    src: "/user-avatar/27-llama-avatar-director.png",
  },
  { id: "dj", label: "DJ", src: "/user-avatar/28-llama-avatar-dj.png" },
  {
    id: "artist",
    label: "Artist",
    src: "/user-avatar/29-llama-avatar-artist.png",
  },
  {
    id: "explorer",
    label: "Explorer",
    src: "/user-avatar/30-llama-avatar-explorer.png",
  },
  {
    id: "coder",
    label: "Coder",
    src: "/user-avatar/31-llama-avatar-coder.png",
  },
  {
    id: "astronaut",
    label: "Astronaut",
    src: "/user-avatar/32-llama-avatar-astronaut.png",
  },
  {
    id: "rockstar",
    label: "Rockstar",
    src: "/user-avatar/33-llama-avatar-rockstar.png",
  },
]

/** The stored mascot, or null for none (or an id that no longer exists). */
export function findMascot(id: string | null | undefined) {
  return mascots.find((mascot) => mascot.id === id) ?? null
}
