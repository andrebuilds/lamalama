export const site = {
  name: "LamaLama",
  tagline: "Your product, in videos that show it off.",
  description:
    "Record your app and turn it into a polished product video in minutes: camera moves, text and motion graphics, edited in your browser.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  author: { name: "Andrea D'Ambrosio", url: "https://github.com/andrebuilds" },
  repo: "https://github.com/andrebuilds/lamalama",
} as const
