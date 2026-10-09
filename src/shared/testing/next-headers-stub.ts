// Next's request APIs only work inside a request. Tests get an in-memory
// cookie jar (empty at the start of each file) and no headers.
const jar = new Map<string, string>()

export async function cookies() {
  return {
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name)! } : undefined,
    set: (name: string, value: string) => {
      jar.set(name, value)
    },
    delete: (name: string) => {
      jar.delete(name)
    },
  }
}

export async function headers() {
  return new Headers()
}
