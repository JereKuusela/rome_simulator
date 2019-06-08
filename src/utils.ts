
export function mapRange<T>(length: number, func: (number: number) => T): T[] {
  const array: T[] = Array(length)
  for (let i = 0; i < length; i++) {
    array[i] = func(i)
  }
  return array
}

