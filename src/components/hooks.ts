import { useCallback, useState } from 'react'

export const useOptionalState = <T>() => useState<T | undefined>(undefined)

export const useBooleanState = (initial: boolean) => {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])
  return [value, toggle] as const
}
