
let i = 0

const parseToken = (token: string) => {
  const isNumber = !Number.isNaN(Number(token))
  if (isNumber)
    return Number(token)
  if (token.startsWith('"'))
    return token.substr(1, token.length - 2)
  return token
}

const parseValue = (tokens: string[]) => {
  for (i = i + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '{') {
      return parseObject(tokens)
    }
    if (token === 'hsv') {
      parseObject(tokens)
    }
    return parseToken(token)
  }
  return null
}

const parseObject = (tokens: string[]) => {
  const result = {} as { [key: string]: any }
  // Object syntax is also used for arrays. Fill both and decide at end which works better.
  const resultArray = [] as any[]
  let previous = ''
  let extras = 0
  for (i = i + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '{') {
      extras++
    }
    else if (token === '=') {
      const value = parseValue(tokens)
      if (result[previous]) {
        if (!Array.isArray(result[previous]))
          result[previous] = [result[previous]]
        result[previous].push(value)
      }
      else {
        result[previous] = value
      }
    }
    else if (token === '}') {
      if (extras)
        extras--
      else
        break
    }
    else {
      resultArray.push(parseToken(token))
    }
    previous = token
  }
  return Object.keys(result).length ? result : resultArray
}

export const parseFile = (data: string) => {
  /* eslint-disable-next-line */
  const withoutComments = data.replace(/\h*#.*\r?(?:\n|$)/g, '')
  const forceTokenizeEqualCharacter = withoutComments.replace(/=/g, ' = ')
  const tokens = forceTokenizeEqualCharacter.split(/[\n\r\s]+/)
  i = -1
  return parseObject(tokens)
}