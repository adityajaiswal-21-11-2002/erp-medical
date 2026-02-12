"use client"

import { useEffect, useState } from "react"

/**
 * Returns a debounced version of the value. Updates after `delay` ms of no changes.
 * Use for search inputs to avoid filtering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
