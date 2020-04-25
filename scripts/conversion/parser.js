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
    if (token === 'hsv') {
      parseObject(tokens)
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
  const withoutComments = data.replace(/\h*#.*\r?(?:\n|$)/g, '')
  const forceTokenizeEqualCharacter = withoutComments.replace(/=/g, ' = ')
  const tokens = forceTokenizeEqualCharacter.split(/[\n\r\s]+/)
  i = -1
  return parseObject(tokens)
}

/**
 * @param data {string}
 */
exports.parseLocalization = data => {
  const withoutDataLinebreaks = data.replace(/\\n/g, '')
  const withoutComments = withoutDataLinebreaks.replace(/\h*#.*/g, '')
  const withoutSentences = withoutComments.replace(/\./g, '')
  const lines = withoutSentences.split('\n')
  const results = {}
  lines.forEach(line => {
    if (line.trim().toLowerCase().startsWith('#')) {
      console.log(line)
      console.log('alert')
    }
    const tokens = line.split(/:\d/)
    if (tokens.length > 1) {
      const trimmed = tokens[1].trim()
      results[tokens[0].trim().toLowerCase()] = trimmed.substr(1, trimmed.length - 2)
    }
  })
  return results
}

/**
 * @param data {string}
 */
exports.parseScriptValues = data => {
  const withoutComments = data.replace(/\h*#.*/g, '')
  const lines = withoutComments.split('\n')
  const results = {}
  lines.forEach(line => {
    const tokens = line.split('=')
    if (tokens.length > 1) {
      const trimmed = tokens[1].trim()
      results[tokens[0].trim().toLowerCase()] = Number(trimmed)
    }
  })
  return results
}
