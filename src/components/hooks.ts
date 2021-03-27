import { useCallback, useEffect, useRef, useState } from 'react'

export const useOptionalState = <T>() => useState<T | undefined>(undefined)

export const useBooleanState = (initial: boolean) => {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])
  return [value, toggle] as const
}

/** Wraps a value in a ref to break dependencies. */
export const useRefWrapper = <T>(value: T) => {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}
