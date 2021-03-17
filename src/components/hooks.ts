import { useState } from 'react'

export const useOptionalState = <T>() => useState<T | undefined>(undefined)
