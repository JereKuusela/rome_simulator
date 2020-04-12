/**
 * Converts file format used by Paradox data files to a Javascript object.
 */

let i = 0

parseValue = tokens => {
  for (i = i + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '{') {
      return parseObject(tokens)
    }
    return Number.isNaN(Number(token)) ? token : Number(token)
  }
}

parseObject = tokens => {
  const result = {}
  let previous = ''
  for (i = i + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '=') {
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
    if (token === '}')
      break
    previous = token
  }
  return result
}

exports.parseFile = data => {
  const withoutComments = data.replace(/\h*#.*\r?(?:\n|$)/g, "")
  const tokens = withoutComments.split(/[\n\r\s]+/)
  i = -1
  return parseObject(tokens)
}
