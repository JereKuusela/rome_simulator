import { toObj, keys } from "utils"

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

const rawTokens = {
  '0000': '',
  '0100': '=',
  '0300': '{',
  '0400': '}',
  '0C00': 'Integer',
  '0E00': 'Boolean',
  '0C28': 'father',
  '0D28': 'mother',
  '0F00': 'String',
  '0F2D': 'country',
  '0F32': 'leader_date',
  '1028': 'spouse',
  '1228': 'owner',
  '1337': 'prestige_ratio',
  '1400': 'Integer',
  '142D': 'home',
  '1427': 'difficulty',
  '1530': 'objectives_database',
  '1531': 'interval',
  '1631': 'ai_task',
  '1730': 'objectives',
  '1736': 'first_name_loc',
  '1A03': 'category',
  '1B00': 'name',
  '2134': 'enabled_mods',
  '2305': 'scope',
  '2506': 'female',
  '262B': 'prestige',
  '3106': 'mode',
  '362B': 'score',
  '3A2B': 'start_date',
  '3D30': 'zeal',
  '3E2E': 'finesse',
  '4628': 'fertility',
  '4A2E': 'family',
  '4A33': 'ironman_save_name',
  '4806': 'traits',
  '4B2E': 'nickname',
  '4B33': 'enabled_dlcs',
  '4933': 'ironman_cloud',
  '4B2A': 'strength_damage',
  '4C33': 'age_has_changed',
  '4E32': 'minor_family',
  '4E34': 'sync_ai_tasks',
  '4F2F': 'is_party_leader',
  '4F33': 'locked_alignment',
  '5103': 'list',
  '5203': 'item',
  '5505': 'variables',
  '5600': 'color',
  '5A04': 'count',
  '5A2A': 'unborn',
  '5E29': 'morale_damage',
  '5E32': 'ethnicity',
  '6701': 'Float',
  '6B00': 'target',
  '6B29': 'armies',
  '6B32': 'play_time',
  '6E00': 'speed',
  '6F34': 'ai_war',
  '7032': 'ordinal',
  '7232': 'subunit_name',
  '7529': 'morale',
  '7534': 'ai_combat',
  '7700': 'normal',
  '772F': 'home_country',
  '7B31': 'game_configuration',
  '8403': 'flag',
  '8503': 'tick',
  '8F05': 'save_game_version',
  '8932': 'scorned',
  '912E': 'experience',
  '9632': 'support_as_heir',
  '992F': 'preferred_heir',
  '9C02': 'BigInteger',
  '9F2D': 'death_date',
  'A72E': 'char',
  'A731': 'ambition',
  'A927': 'modifier',
  'AC06': 'root',
  'B306': 'random_seed',
  'B406': 'random_count',
  'B42E': 'charisma',
  'B506': 'date',
  'B52E': 'martial',
  'B604': 'next',
  'C32F': 'subunit_database',
  'C72E': 'birth_date',
  'C72F': 'character_database',
  'CA32': 'strike_team',
  'CB2E': 'family_name',
  'CB32': 'strike_team_database',
  'CE2E': 'popularity',
  'CF2A': 'dna',
  'CF2E': 'wealth',
  'D02E': 'friends',
  'D031': 'regular',
  'D12E': 'rivals',
  'D202': 'value',
  'D227': 'province',
  'D32E': 'attributes',
  'D42F': 'families',
  'D52E': 'holdings',
  'D936': 'character_experience',
  'DB00': 'identity',
  'DC00': 'key',
  'DE28': 'strength',
  'E100': 'type',
  'E32D': 'succession',
  'E629': 'meta_player_name',
  'E636': 'grateful',
  'E736': 'timed_loyalty',
  'E92E': 'children',
  'E930': 'member',
  'EC06': 'character',
  'EE00': 'version',
  'EF06': 'age',
  'F000': 'data',
  'F030': 'ctry',
  'FF04': 'prov',
  'F12D': 'mercenary',
  'F427': 'culture',
  'F706': 'seed',
  'F727': 'unit',
  'F806': 'event_targets',
  'FC27': 'religion'
}
const test = {
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
const tokens = toObj(keys(test), key => parseInt(key, 16), key => test[key])

export const parseBinary = (data: ArrayBuffer) => {
  const view = new Uint8Array(data)
  i = 0
  const result = parseBinaryText(view)

  //const blob = new Blob([result.join('')], { type: 'text/plain;charset=utf-8' })
  //saveAs(blob, 'test.txt');
  return result.join('')
}

const getBinaryToken = (data: Uint8Array) => {
  const code = data[i++] * 256 + data[i++]
  if (tokens[code])
    return tokens[code]
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
  if (type === '{') {
    return parseBinaryObject(data)
  }
  return type
}

const parseBinaryObject = (data: Uint8Array) => {
  const result = {} as { [key: string]: any }
  // Object syntax is also used for arrays. Fill both and decide at end which works better.
  const resultArray = [] as any[]
  let previous: string | number | {} = ''
  while (i < data.length && i < 1000000) {
    let token: string | number | {} = getBinaryToken(data)
    if (token === 'String' || token === 'Integer' || token === 'BigInteger' || token === 'Float' || token === 'BigFloat' || token === 'Boolean')
      token = parseBinaryValue(data, String(token))
    if (previous)
      resultArray.push(previous)

    if (token === '=') {
      const type = getBinaryToken(data)
      const value = parseBinaryValue(data, type)
      const key = previous as string
      if (result[key]) {
        if (!Array.isArray(result[key]))
          result[key] = [result[key]]
        result[key].push(value)
      }
      else {
        result[key] = value
      }
      previous = ''
    }
    if (token === '}') {
      break
    }
    previous = token
  }
  if (previous)
    resultArray.push(previous)
  return Object.keys(result).length || !resultArray.length ? result : resultArray
}

const parseBinaryText = (data: Uint8Array) => {
  const tokens = [''] as any[]
  let pad = ''
  let counter = 0
  while (i < data.length) {
    let token: string | number | {} = getBinaryToken(data)
    if (token === '=') {
      counter = -1
      tokens.push(token)
    }
    else if (token === 'String' || token === 'Integer' || token === 'BigInteger' || token === 'Float' || token === 'BigFloat' || token === 'Boolean') {
      if (counter === -1 && token === 'String')
        token = '"' + parseBinaryValue(data, String(token)) + '"'
      else
        token = parseBinaryValue(data, String(token))
      if (pad && tokens[tokens.length - 1] === '\n')
        tokens.push(pad)
      if (counter > 0)
        tokens.push(' ')
      tokens.push(token)
      if (counter === -1)
        tokens.push('\n')
      counter++
    }
    else if (token === '{' || token === '}') {
      if (token === '}') {
        if (tokens[tokens.length - 1] !== '\n')
          tokens.push('\n')
        pad = pad.substr(1)
        if (pad)
          tokens.push(pad)
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
      if (counter === -1)
        tokens.push('\n')
      counter++
    }
  }
  return tokens
}