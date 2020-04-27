import { toObj, keys } from 'utils'
import { uniq } from 'lodash'

import stringTokens from 'data/json/ir/binary.json'

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

let errors: string[] | null = null

export const binaryToPlain = (data: Uint8Array, getErrors: boolean): [string, string[]] => {
  i = 0
  errors = getErrors ? [] : null
  const result = parseBinaryText(data)
  return [result.join(''), errors ? uniq(errors) : []]
}

const getBinaryToken = (data: Uint8Array) => {
  const code = data[i++] * 256 + data[i++]
  if (tokens[code])
    return tokens[code]
  errors?.push('Token ' + code.toString(16).toUpperCase() + ' not recognized.')
  return 'x_' + code.toString(16).toUpperCase()
}

const getBinaryBoolean = (data: Uint8Array) => data[i++] ? 'yes' : 'no'
const getBinaryLength = (data: Uint8Array) => data[i++] + (data[i++] << 8)
const getBinaryInteger = (data: Uint8Array) => data[i++] + (data[i++] << 8) + (data[i++] << 16) + (data[i++] << 24)
const getBigInteger = (data: Uint8Array) => (
  data[i++] + (data[i++] << 8) + (data[i++] << 16) + (data[i++] << 24)
  + (data[i++] << 32) + (data[i++] << 40) + (data[i++] << 48) + (data[i++] << 56)
)

const getBinaryString = (data: Uint8Array, length: number) => {
  let string = ''
  for (let j = 0; j < length; j++)
    string += String.fromCharCode(data[i + j])
  i += length
  return string
}

const parseBinaryValue = (data: Uint8Array, type: string) => {
  if (type === 'Integer') {
    return getBinaryInteger(data)
  }
  if (type === 'String') {
    const length = getBinaryLength(data)
    return getBinaryString(data, length)
  }
  if (type === 'Float') {
    return getBinaryInteger(data) / 100000.0
  }
  if (type === 'BigInteger') {
    return getBigInteger(data)
  }
  if (type === 'BigFloat') {
    return getBigInteger(data) / 100000.0
  }
  if (type === 'Boolean') {
    return getBinaryBoolean(data)
  }
  return type
}

// Date is not its own data format so the keys must be hard coded.
const dates = new Set([
  'date', 'birthdate', 'death_date', 'start_date', 'last_trade_route_creation_date', 'arrived_here_date', 'stall_date',
  'leader_date', 'budget_dates', 'last_employed_date'
])

const parseBinaryText = (data: Uint8Array) => {
  const tokens = [''] as any[]
  let pad = ''
  let counter = 0
  let key = ''
  while (i < data.length) {
    let token: string | number | {} = getBinaryToken(data)
    if (token === '=') {
      counter = -1
      key = tokens[tokens.length - 1]
      tokens.push(token)
    }
    else if (token === 'String' || token === 'Integer' || token === 'BigInteger' || token === 'Float' || token === 'BigFloat' || token === 'Boolean') {
      // If token used as key then not stringified, must detect is array or not which requires storing state...
      if (token === 'String')
        token = '"' + parseBinaryValue(data, String(token)) + '"'
      else if (dates.has(key))
        token = decodateDate(Number(parseBinaryValue(data, String(token))))
      else
        token = parseBinaryValue(data, String(token))
      if (pad && tokens[tokens.length - 1] === '\n')
        tokens.push(pad)
      if (counter > 0)
        tokens.push(' ')
      tokens.push(token)
      if (counter === -1) {
        key = ''
        tokens.push('\n')
      }
      counter++
    }
    else if (token === '{' || token === '}') {
      if (token === '}') {
        if (tokens[tokens.length - 1] !== '\n')
          tokens.push('\n')
        pad = pad.substr(1)
        if (pad)
          tokens.push(pad)
        key = ''
      }
      tokens.push(token)
      tokens.push('\n')
      if (token === '{')
        pad += '\t'
      counter = 0
    }
    else {
      if (pad && tokens[tokens.length - 1] === '\n')
        tokens.push(pad)
      if (counter > 0)
        tokens.push(' ')
      tokens.push(token)
      if (counter === -1) {
        key = ''
        tokens.push('\n')
      }
      counter++
    }
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
