export const site = {
  name: "LamaLama",
  tagline: "Record your screen. Ship a video that sells.",
  /** Search-result title after the name: what the product is, in the words people search with. */
  headline: "Turn screen recordings into product videos",
  /** Meta description: under 160 characters, so search results show it whole. */
  description:
    "Turn a screen recording into a product video that sells: AI-directed camera moves, text and motion graphics, right in your browser. Free and open source.",
  keywords: [
    "product video maker",
    "product demo video",
    "screen recording editor",
    "screen recorder to video",
    "SaaS demo video",
    "launch video",
    "AI video editor",
    "browser video editor",
    "online video editor",
    "open source video editor",
    "motion graphics",
    "app promo video",
    "Remotion",
  ],
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  email: "hello@lamalama.video",
  author: { name: "Andrea D'Ambrosio", url: "https://github.com/andrebuilds" },
  repo: "https://github.com/andrebuilds/lamalama",
} as const
