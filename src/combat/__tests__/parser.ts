import { UnitType, dictionaryUnitType, SideType, CharacterAttribute, UnitPreferenceType } from 'types'
import { forEach } from 'utils'
import { TestState, getArmyTest, addToReserveTest, getUnit, createArmyTest } from './utils'
import { setFlankSize, setGeneralAttribute, setUnitPreference } from 'managers/army'
import { parseFile } from 'saves/importer'

type InputUnits = UnitType[]

type Input = { [key: string]: string }

const getUnits = (input: Input) => {
  const units: InputUnits = []
  forEach(input, (item, key) => {
    const type = dictionaryUnitType[key]
    if (!type) return
    units.push(...Array(Number(item)).fill(type))
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

const setInfoFromInput = (state: TestState, side: SideType, input: Input | Input[]) => {
  if (Array.isArray(input)) {
    input.forEach((input, index) => {
      if (index !== 0) createArmyTest(state, side)
      setArmyFromInput(state, side, input, index)
    })
  } else setArmyFromInput(state, side, input, 0)
}

const setArmyFromInput = (state: TestState, side: SideType, input: Input, index: number) => {
  const army = getArmyTest(state, side, index)
  setFlankSize(army, getFlankSize(input))
  setGeneralAttribute(army, CharacterAttribute.Martial, getGeneral(input))
  const preferences = getUnitPrefences(input)
  setUnitPreference(army, UnitPreferenceType.Primary, preferences[0])
  setUnitPreference(army, UnitPreferenceType.Secondary, preferences[1])
  setUnitPreference(army, UnitPreferenceType.Flank, preferences[2])
  addToReserveTest(state, side, getUnits(input).map(getUnit), index)
}
/**
 * Loads a given input data to a given test info.
 * @param state
 * @param data
 */
export const loadInput = (data: string, state: TestState) => {
  const parsed = parseFile(data)
  const [attacker, defender] = [parsed.combat_name.attacker, parsed.combat_name.defender]
  setInfoFromInput(state, SideType.A, attacker)
  setInfoFromInput(state, SideType.B, defender)
}
