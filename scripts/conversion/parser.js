/**
 * Converts file format used by Paradox data files to a Javascript object.
 */

let i = 0

const parseCurrentValue = tokens => {
  const token = tokens[i]
  if (token === '{') {
    return parseArrayOrObject(tokens)
  }
  if (token === 'hsv') {
    return parseValue(tokens)
  }
  return Number.isNaN(Number(token)) ? token : Number(token)
}

const parseValue = tokens => {
  i++
  return parseCurrentValue(tokens)
}

const isArray = tokens => {
  let isArray = true
  for (let j = i + 1; j < tokens.length && isArray; j++) {
    const token = tokens[j]
    if (token === '=') isArray = false
    if (token === '}') break
  }
  return isArray
}

const parseObject = tokens => {
  const result = {}
  let previous = ''
  for (i = i + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '=') {
      const value = parseValue(tokens)
      if (result[previous] && result[previous] !== value) {
        // Usually setting a key multiple times indicates an array. But replacing an empty object seems to be an exception.
        if (typeof result[previous] === 'object' && Object.keys(result[previous]).length === 0) result[previous] = value
        else {
          if (!Array.isArray(result[previous])) result[previous] = [result[previous]]
          result[previous].push(value)
        }
      } else {
        result[previous] = value
      }
    }
    if (token === '}') break
    previous = token
  }
  return result
}

const parseArray = tokens => {
  const result = []
  for (i = i + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '}') break
    result.push(parseCurrentValue(tokens))
  }
  return result
}

const parseArrayOrObject = tokens => {
  if (isArray(tokens)) return parseArray(tokens)
  return parseObject(tokens)
}

exports.parseFile = data => {
  const withoutComments = data.replace(/h*#.*\r?(?:\n|$)/g, '')
  const forceTokenizeCharacters = withoutComments.replace(/([={}])/g, ' $1 ')
  const tokens = forceTokenizeCharacters.split(/[\n\r\s]+/)
  i = -1
  return parseObject(tokens)
}

/**
 * @param data {string}
 */
exports.parseLocalization = data => {
  const withoutDataLinebreaks = data.replace(/\\n/g, '')
  const withoutComments = withoutDataLinebreaks.replace(/h*#.*/g, '')
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
  const withoutComments = data.replace(/h*#.*/g, '')
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
