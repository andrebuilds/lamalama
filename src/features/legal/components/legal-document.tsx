import Link from "next/link"

import { legal } from "../lib/legal"

const documents = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
] as const

/**
 * Shared frame of the legal pages: title, date, readable text. The header
 * keeps clear of the marketing layout's llama on the right, and the bottom
 * padding leaves the footer llamas room to stand below the text.
 */
export function LegalDocument({
  title,
  intro,
  children,
}: {
  title: string
  intro: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-16 pb-24 sm:px-6 sm:pt-20 lg:pb-80">
      <header className="flex flex-col gap-3 lg:pr-48">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {legal.updated}
        </p>
        <div className="text-lg text-muted-foreground">{intro}</div>
      </header>
      <div className="mt-10 leading-7 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:scroll-mt-20 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
      <nav
        aria-label="Legal documents"
        className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm text-muted-foreground"
      >
        {documents.map((document) => (
          <Link
            key={document.href}
            href={document.href}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {document.label}
          </Link>
        ))}
      </nav>
    </article>
  )
}

/** A scrollable table: legal tables are wider than phones. */
export function LegalTable({
  head,
  rows,
}: {
  head: readonly string[]
  rows: readonly (readonly React.ReactNode[])[]
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col" className="px-4 py-2.5 font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
