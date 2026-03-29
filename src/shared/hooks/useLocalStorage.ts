import { useEffect, useState } from 'react'

export type Serializer<T> = (value: T) => string
export type Deserializer<T> = (value: string) => T

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: Serializer<T>
    deserialize?: Deserializer<T>
  },
) {
  const serialize = options?.serialize ?? JSON.stringify
  const deserialize = options?.deserialize ?? ((value: string) => JSON.parse(value) as T)

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const stored = window.localStorage.getItem(key)
      return stored ? deserialize(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(value))
    } catch {
      // Ignore write errors in environments without storage support.
    }
  }, [key, serialize, value])

  return [value, setValue] as const
}
