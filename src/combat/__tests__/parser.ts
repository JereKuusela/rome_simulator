import { UnitType, dictionaryUnitType } from 'types'
import { forEach, mapRange } from 'utils'
import { TestState, setFlankSizes, setUnitPreferences, setReserve, setGeneral } from './utils'

type InputUnits = UnitType[]

type Input = { [key: string]: string }

const parseInput = (input: string) => {
  const rows = input.split(/\r?\n/)
  const attacker: Input = {}
  const defender: Input = {}
  let parsingAttacker = false
  let parsingDefender = false
  for (let row of rows) {
    const trimmed = row.trim()
    const split = trimmed.split('=')
    const key = split[0].trim()
    const value = split.length > 1 ? split[1].trim() : ''
    if (key === 'attacker')
      parsingAttacker = true
    else if (key === 'defender')
      parsingDefender = true
    else if (key === '}')
      parsingAttacker = parsingDefender = false
    else if (value && (parsingAttacker || parsingDefender)) {
      const input = parsingAttacker ? attacker : defender
      input[key] = value
    }
  }
  return [attacker, defender]
}

const getUnits = (input: Input) => {
  const units: InputUnits = []
  forEach(input, (item, key) => {
    const type = dictionaryUnitType[key]
    if (!type)
      return
    units.push(...mapRange(Number(item), () => type))
  })
  return units
}

const getUnitPrefences = (input: Input) => [
  dictionaryUnitType[input['primary']] ?? null,
  dictionaryUnitType[input['secondary']] ?? null,
  dictionaryUnitType[input['flank']] ?? null
]

const getFlankSize = (input: Input) => Number(input['flank_size'] ?? 0)
const getGeneral = (input: Input) => Number(input['general'] ?? 0)


const setInfoFromInput = (info: TestState, attacker: Input, defender: Input) => {
  setFlankSizes(info, getFlankSize(attacker), getFlankSize(defender))
  setGeneral(info, getGeneral(attacker), getGeneral(defender))
  setUnitPreferences(info, getUnitPrefences(attacker), getUnitPrefences(defender))
}

/**
 * Loads a given input data to a given test info.
 * @param info 
 * @param data 
 */
export const loadInput = (data: string, info: TestState) => {
  const [attacker, defender] = parseInput(data)
  setInfoFromInput(info, attacker, defender)
  setReserve(info, getUnits(attacker), getUnits(defender))
}
