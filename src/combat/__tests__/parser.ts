import { UnitType, dictionaryUnitType, SideType, GeneralAttribute, UnitPreferenceType } from 'types'
import { forEach, mapRange } from 'utils'
import { TestState, getArmyTest, addToReserveTest, getUnit } from './utils'
import { setFlankSize, setGeneralAttribute, setUnitPreference } from 'managers/army'

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


const setInfoFromInput = (state: TestState, attacker: Input, defender: Input) => {
  const armyA = getArmyTest(state, SideType.Attacker)
  const armyD = getArmyTest(state, SideType.Defender)
  setFlankSize(armyA, getFlankSize(attacker))
  setFlankSize(armyD, getFlankSize(defender))
  setGeneralAttribute(armyA, GeneralAttribute.Martial, getGeneral(attacker))
  setGeneralAttribute(armyD, GeneralAttribute.Martial, getGeneral(defender))
  const preferencesA = getUnitPrefences(attacker)
  setUnitPreference(armyA, UnitPreferenceType.Primary, preferencesA[0])
  setUnitPreference(armyA, UnitPreferenceType.Secondary, preferencesA[1])
  setUnitPreference(armyA, UnitPreferenceType.Flank, preferencesA[2])
  const preferencesD = getUnitPrefences(defender)
  setUnitPreference(armyD, UnitPreferenceType.Primary, preferencesD[0])
  setUnitPreference(armyD, UnitPreferenceType.Secondary, preferencesD[1])
  setUnitPreference(armyD, UnitPreferenceType.Flank, preferencesD[2])
}

/**
 * Loads a given input data to a given test info.
 * @param state 
 * @param data 
 */
export const loadInput = (data: string, state: TestState) => {
  const [attacker, defender] = parseInput(data)
  setInfoFromInput(state, attacker, defender)
  addToReserveTest(state, SideType.Attacker, getUnits(attacker).map(getUnit))
  addToReserveTest(state, SideType.Defender, getUnits(defender).map(getUnit))
}
