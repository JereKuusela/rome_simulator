import { toObj, keys } from 'utils'
import { uniq } from 'lodash'

import stringTokens from 'data/json/ir/binary.json'

let i = 0
let data: Uint8Array = new Uint8Array()
let errors: string[] | null = null

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

const formatTokens = {
  '0000': '',
  '0100': '=',
  '0300': '{',
  '0400': '}',
  '0C00': 'Integer',
  '0D00': 'Float',
  '0E00': 'Boolean',
  '0F00': 'String',
  '1400': 'Integer',
  '1700': 'String',
  '6701': 'BigFloat',
  '9001': 'BigFloat',
  '9C02': 'BigInteger'
}

const tokens = {
  ...toObj(keys(formatTokens), key => parseInt(key, 16), key => formatTokens[key]),
  ...toObj(keys(stringTokens), key => parseInt(key, 16), key => stringTokens[key])
}

export const binaryToPlain = (buffer: Uint8Array, getErrors: boolean): [string, string[]] => {
  i = 0
  data = buffer
  errors = getErrors ? [] : null
  const result = parseBinaryText(data)
  return [result.join(''), errors ? uniq(errors) : []]
}

const getBinaryToken = () => {
  const code = data[i++] * 256 + data[i++]
  if (tokens[code])
    return tokens[code]
  errors?.push('Token ' + code.toString(16).toUpperCase() + ' not recognized.')
  return 'x_' + code.toString(16).toUpperCase()
}

/** Looks up the next token. If it's '=' then previous token is a key. */
const isKeyValuePair = () => tokens[data[i] * 256 + data[i + 1]] === '='

const getBinaryBoolean = () => data[i++] ? 'yes' : 'no'
// Bitwise can't be used because of only 32 bytes.
const getBinaryLength = () => data[i++] + (data[i++] * 256)
const getBinaryInteger = () => data[i++] + (data[i++] * 256) + (data[i++] * 65536) + (data[i++] * 16777216)
const getBigInteger = () => (
  data[i++] + (data[i++] * 256) + (data[i++] * 65536) + (data[i++] * 16777216)
  + (data[i++] * 4294967296) + (data[i++] * 4294967296 * 256) + (data[i++] * 4294967296 * 65536 ) + (data[i++] * 4294967296* 16777216)
)

const getBinaryString = (length: number) => {
  let string = ''
  for (let j = 0; j < length; j++)
    string += String.fromCharCode(data[i + j])
  i += length
  return string
}

const parseBinaryValue = (type: string) => {
  if (type === 'Integer') {
    return getBinaryInteger()
  }
  if (type === 'String') {
    const length = getBinaryLength()
    return getBinaryString(length)
  }
  if (type === 'Float') {
    return getBinaryInteger() / 100000.0
  }
  if (type === 'BigInteger') {
    return getBigInteger()
  }
  if (type === 'BigFloat') {
    return getBigInteger() / 100000.0
  }
  if (type === 'Boolean') {
    return getBinaryBoolean()
  }
  return type
}

// Date is not its own data format so the keys must be hard coded.
const dates = new Set([
  'date', 'birthdate', 'death_date', 'start_date', 'last_trade_route_creation_date', 'arrived_here_date', 'stall_date',
  'leader_date', 'budget_dates', 'last_employed_date', 'last_owner_change', 'last_controller_change', 'looted', 'plundered'
])

const parseBinaryText = (data: Uint8Array) => {
  const tokens = [''] as any[]
  let pad = ''
  let key = ''
  let previous: string | number = ''
  let inArray = false
  while (i < data.length) {
    let token: string | number = getBinaryToken()
    if (token === '=') {
      tokens.push(token)
    }
    else if (token === 'String' || token === 'Integer' || token === 'BigInteger' || token === 'Float' || token === 'BigFloat' || token === 'Boolean') {
      const value = parseBinaryValue(String(token))
      if (token === 'String' && !isKeyValuePair())
        token = '"' + value + '"'
      else if (dates.has(key))
        token = decodateDate(Number(value))
      else
        token = value

      if (isKeyValuePair()) {
        key = String(token)
        tokens.push('\n')
        if (pad)
          tokens.push(pad)
      }
      else if (previous !== '=') {
        inArray = true
        tokens.push(' ')
      }

      tokens.push(token)
    }
    else if (token === '{' || token === '}') {
      if (token === '}') {
        key = ''
        if (tokens[tokens.length - 1] !== '\n' && !inArray)
          tokens.push('\n')
        pad = pad.substr(1)
        if (pad && !inArray)
          tokens.push(pad)
        if (inArray)
          tokens.push(' ')
        inArray = false
      }
      tokens.push(token)
      if (token === '{')
        pad += '\t'
    }
    else {
      if (isKeyValuePair()) {
        key = token
        tokens.push('\n')
        if (pad)
          tokens.push(pad)
      }
      else if (previous !== '=') {
        inArray = true
        tokens.push(' ')
      }

      tokens.push(token)
    }
    previous = token
  }
  return tokens
}

/** Transforms a numeric date to a string representation. */
const decodateDate = (input: number) => {
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // let hour = input % 24
  let year = Math.floor(-5000 + input / 24 / 365)
  let day = Math.floor(1 + input / 24 % 365)
  let month = 1

  for (let i = 0; i < months.length; i++) {
    if (day > months[i]) {
      day -= months[i]
      month++
    }
    else {
      break
    }
  }
  return year + "." + month + "." + day
}
