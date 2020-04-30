import { getDefaultUnits, getDefaultTactics, getDefaultTerrains, getDefaultLandSettings, getDefaultSiteSettings, getDefaultParticipant, getDefaultArmy, getDefaultUnit } from 'data'
import { map, mapRange, resize, toObj, values } from 'utils'
import { mergeValues } from 'definition_values'
import { Mode, CountryName, Participant, TerrainDefinition, TacticType, Setting, SideType, UnitAttribute, UnitType, TerrainType, UnitPreferenceType, Settings, Cohort, CombatPhase, CultureType, General, GeneralAttribute, UnitPreferences, ArmyForCombatConversion, CombatCohort, CombatParticipant, UnitRole, DisciplineValue, Selections } from 'types'
import { doBattle, deploy, reinforce } from 'combat'
import { convertParticipant } from 'managers/battle'
import { removeDefeated } from 'combat/combat_utils'

const unitDefinitions = map(getDefaultUnits('' as CultureType), unit => mergeValues(unit, getDefaultUnit(UnitType.Land)))
export const getDefinitions = () => ({ [CountryName.Country1]: unitDefinitions, [CountryName.Country2]: unitDefinitions })
const tactics = getDefaultTactics()
const terrains = getDefaultTerrains()

/**
 * Everything the combat tests might need to make tests convenient to write.
 */
export interface TestInfo {
  round: number
  attacker: Participant
  defender: Participant
  army_a: ArmyForCombatConversion
  army_d: ArmyForCombatConversion
  terrains: TerrainDefinition[]
  settings: Settings
}

export interface ExpectedTypes {
  front?: (UnitType | null)[]
  back?: (UnitType | null)[]
  reserve_front?: UnitType[]
  reserve_flank?: UnitType[]
  reserve_support?: UnitType[]
  defeated?: UnitType[]
}

/**
 * Returns a clean combat state for tests.
 */
export const initInfo = () => {
  const settings = { ...getDefaultLandSettings(), ...getDefaultSiteSettings(), [Setting.Precision]: 100000 }
  const general = (): General => ({
    enabled: true,
    selections: {} as Selections,
    base_values: {} as any,
    extra_values: {} as any,
    total_values: {
      [GeneralAttribute.Martial]: 0,
      [GeneralAttribute.Maneuver]: 0,
      [CombatPhase.Default]: 0,
      [CombatPhase.Fire]: 0,
      [CombatPhase.Shock]: 0
    }
  })
  const army = (): ArmyForCombatConversion => ({
    ...getDefaultArmy(Mode.Land),
    // Frontline must be cloned to prevent tests mutating the source.
    frontline: process.env.REACT_APP_GAME === 'euiv' ? [Array(30).fill(null), Array(30).fill(null)] : [Array(30).fill(null)],
    reserve: [],
    defeated: [],
    unit_preferences: getUnitPreferences(),
    definitions: toObj(every_type, type => type, type => ({ type })) as any,
    general: general(),
    flank_ratio: 0,
    flank_size: 5,
    tactic: tactics[TacticType.Envelopment]
  })
  return {
    attacker: getDefaultParticipant(CountryName.Country1, Mode.Land),
    defender: getDefaultParticipant(CountryName.Country2, Mode.Land),
    army_a: army(),
    army_d: army(),
    round: 1,
    terrains: [],
    settings
  }
}

export const createCohort = (type: UnitType) => ({
  type,
  id: 1,
  image: '',
  mode: Mode.Land,
  role: UnitRole.Front,
  base_values: {
    ...toObj(values(UnitType), type => type, () => ({ 'key': 0 })),
    ...toObj(values(UnitAttribute), type => type, () => ({ 'key': 0 })),
    ...toObj(values(TerrainType), type => type, () => ({ 'key': 0 })),
    ...toObj(values(CombatPhase), type => type, () => ({ 'key': 0 }))
  }
})

const errorPrefix = (identifier: string | number, side: SideType, index: number) => (typeof identifier === 'number' ? 'Round ' : '') + identifier + ', ' + side + ' ' + index + ': '

const verifyFast = (identifier: string | number, side: SideType, index: number, unit: CombatCohort | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  const unit_strength = Math.floor(1000 * unit[UnitAttribute.Strength])
  try {
    expect(Math.floor(unit_strength)).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(identifier, side, index) + 'Strength ' + unit_strength + ' should be ' + strength)
  }
  const unit_morale = unit[UnitAttribute.Morale]
  try {
    expect(Math.abs(unit_morale - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error(errorPrefix(identifier, side, index) + 'Morale ' + unit_morale + ' should be ' + 2 * morale)
  }
}

/**
 * Verifies that the unit has a correct type.
 * @param identifier Round number or other identifier for debugging purposes.
 * @param side Side for debugging purposes.
 * @param index Unit location of frontline for debugging purposes.
 * @param unit Unit to check.
 * @param type Expected type.
 * @param message Custom message on error.
 */
export const verifyType = (identifier: string | number, side: SideType, index: number, unit: { type: UnitType } | null | undefined, type: UnitType | null, message: string = '') => {
  if (type) {
    try {
      expect(unit).toBeTruthy()
    }
    catch (e) {
      throw new Error(errorPrefix(identifier, side, index) + 'Unit should exist')
    }
    try {
      expect(unit!.type + message).toEqual(type + message)
    }
    catch (e) {
      throw new Error(errorPrefix(identifier, side, index) + 'Type ' + unit!.type + ' should be ' + type)
    }

  }
  else {
    try {
      expect(unit).toBeFalsy()
    }
    catch (e) {
      throw new Error(errorPrefix(identifier, side, index) + 'Unit shouldn\'t exist')
    }
  }
}
/**
 * Sets rolls for combat.
 */
export const setRolls = (info: TestInfo, roll_a: number, roll_d: number) => {
  info.attacker = { ...info.attacker, dice: roll_a }
  info.defender = { ...info.defender, dice: roll_d }
}
/**
 * Sets tactics for combat.
 */
export const setTactics = (info: TestInfo, tactic_a: TacticType, tactic_d: TacticType) => {
  info.army_a = { ...info.army_a, tactic: tactics[tactic_a] }
  info.army_d = { ...info.army_d, tactic: tactics[tactic_d] }
}
/**
 * Sets center units (useful for 1v1 tests).
 */
export const setCenterUnits = (info: TestInfo, unit_a: Cohort, unit_d: Cohort) => {
  info.army_a.frontline[0][15] = unit_a
  info.army_d.frontline[0][15] = unit_d
}
/**
 * Sets an attacker unit (useful for more complex tests).
 */
export const setAttacker = (info: TestInfo, index: number, unit: Cohort) => {
  info.army_a.frontline[0][index] = unit
}
/**
 * Sets a defender unit (useful for more complex tests).
 */
export const setDefender = (info: TestInfo, index: number, unit: Cohort) => {
  info.army_d.frontline[0][index] = unit
}
/**
 * Sets flank sizes for deployment.
 */
export const setFlankSizes = (info: TestInfo, flank_a: number, flank_d: number) => {
  info.army_a = { ...info.army_a, flank_size: flank_a }
  info.army_d = { ...info.army_d, flank_size: flank_d }
}
/**
 * Sets general martial.
 */
export const setGeneral = (info: TestInfo, general_a: number, general_d: number) => {
  info.army_a.general.total_values[GeneralAttribute.Martial] = general_a
  info.army_d.general.total_values[GeneralAttribute.Martial] = general_d
}
/**
 * Sets flank sizes for combat.
 */
export const setTerrain = (info: TestInfo, terrain: TerrainType) => {
  info.terrains = []
  info.terrains.push(terrains[terrain])
}

export const setReserve = (info: TestInfo, attacker: UnitType[], defender: UnitType[]) => {
  info.army_a.reserve = info.army_a.reserve.concat(attacker.map(type => getUnit(type)))
  info.army_d.reserve = info.army_d.reserve.concat(defender.map(type => getUnit(type)))
}

// Dummy test to avoid an error.
describe('utils', () => {
  it('works', () => { })
})

/**
 * Returns unit prerefences object with given selections.
 * @param primary Selected primary type or null.
 * @param secondary Selected secondary type or null.
 * @param flank Selected flank tyoe or null.
 */
export const getUnitPreferences = (primary: UnitType | null = null, secondary: UnitType | null = null, flank: UnitType | null = null) => ({ [UnitPreferenceType.Primary]: primary, [UnitPreferenceType.Secondary]: secondary, [UnitPreferenceType.Flank]: flank } as UnitPreferences)

/**
 * Sets preferred unit types.
 * @param info 
 * @param attacker Array of 3 unit types.
 * @param defender Array of 3 unit types.
 */
export const setUnitPreferences = (info: TestInfo, attacker: (UnitType | null)[], defender: (UnitType | null)[]) => {

  info.army_a = { ...info.army_a, unit_preferences: { [UnitPreferenceType.Primary]: attacker[0], [UnitPreferenceType.Secondary]: attacker[1], [UnitPreferenceType.Flank]: attacker[2] } as UnitPreferences }
  info.army_d = { ...info.army_d, unit_preferences: { [UnitPreferenceType.Primary]: defender[0], [UnitPreferenceType.Secondary]: defender[1], [UnitPreferenceType.Flank]: defender[2] } as UnitPreferences }
}

export const setCombatWidth = (info: TestInfo, value: number) => {
  info.settings[Setting.CombatWidth] = value
  info.army_a.frontline = info.army_a.frontline.map(row => resize(row, value, null))
  info.army_d.frontline = info.army_d.frontline.map(row => resize(row, value, null))
}

/**
 * Returns a unit with a given type.
 */
export const getUnit = (type: UnitType) => ({ ...unitDefinitions[type] } as any as Cohort)

/**
 * List of every unit type for deployment/reinforcement tests.
 */
export const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants, UnitType.SupplyTrain]

/**
 * Performs one combat round with a given test info.
 */
const doRound = (info: TestInfo, a: CombatParticipant, d: CombatParticipant) => {
  doBattle(a, d, true, info.settings, info.round++)
}


type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

const getParticipants = (info: TestInfo) => {
  const participant_a = convertParticipant(SideType.Attacker, info.army_a, info.army_d, info.terrains, info.settings)
  const participant_d = convertParticipant(SideType.Defender, info.army_d, info.army_a, info.terrains, info.settings)
  return [participant_a, participant_d]
}

/**
 * Tester function for combat.
 * @param info Initial combat state.
 * @param rolls List of rolls.
 * @param attacker Expected attacker units for every round. Nulls can be used to skip checks.
 * @param defender Expected defender units for every round. Nulls can be used to skip checks.
 */
export const testCombat = (info: TestInfo, rolls: number[][], attacker: Expected[], defender: Expected[]) => {
  const [participant_a, participant_d] = getParticipants(info)
  for (let roll = 0; roll < rolls.length; roll++) {
    participant_a.dice = rolls[roll][0]
    participant_d.dice = rolls[roll][1]
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doRound(info, participant_a, participant_d)
      verifySide(round, SideType.Attacker, participant_a.cohorts.frontline[0], attacker[round])
      verifySide(round, SideType.Defender, participant_d.cohorts.frontline[0], defender[round])
    }
  }
  return [participant_a, participant_d]
}
export const testDeployment = (info: TestInfo, expected_a?: ExpectedTypes, expected_d?: ExpectedTypes) => {
  const [participant_a, participant_d] = getParticipants(info)
  deploy(participant_a, participant_d, info.settings)
  if (expected_a)
    verifyDeployOrReinforce(info, SideType.Attacker, participant_a, expected_a)
  if (expected_d)
    verifyDeployOrReinforce(info, SideType.Defender, participant_d, expected_d)
  return [participant_a, participant_d]
}

export const testReinforcement = (rounds_to_skip: number, info: TestInfo, expected_a?: ExpectedTypes, expected_d?: ExpectedTypes) => {
  const [participant_a, participant_d] = getParticipants(info)
  deploy(participant_a, participant_d, info.settings)
  participant_a.dice = 2
  participant_d.dice = 2
  for (let round = 0; round < rounds_to_skip; round++)
    doRound(info, participant_a, participant_d)
  removeDefeated(participant_a.cohorts.frontline)
  removeDefeated(participant_d.cohorts.frontline)
  reinforce(participant_a, info.settings)
  reinforce(participant_d, info.settings)
  if (expected_a)
    verifyDeployOrReinforce(info, SideType.Attacker, participant_a, expected_a)
  if (expected_d)
    verifyDeployOrReinforce(info, SideType.Defender, participant_d, expected_d)
  return [participant_a, participant_d]
}

const verifyDeployOrReinforce = (info: TestInfo, side: SideType, participant: CombatParticipant, expected: ExpectedTypes) => {
  verifyTypes('Front', info, expected.front ?? [], side, participant.cohorts.frontline[0])
  verifyTypes('Back', info, expected.back ?? [], side, participant.cohorts.frontline.length ? participant.cohorts.frontline[1] : [])
  verifyTypes('Reserve front', info, expected.reserve_front ?? [], side, participant.cohorts.reserve.front)
  verifyTypes('Reserve flank', info, expected.reserve_flank ?? [], side, participant.cohorts.reserve.flank)
  verifyTypes('Reserve support', info, expected.reserve_support ?? [], side, participant.cohorts.reserve.support)
  verifyTypes('Defeated', info, expected.defeated ?? [], side, participant.cohorts.defeated)
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyTypes = (identifier: string, info: TestInfo, types: (UnitType | null)[], side: SideType, cohorts: (CombatCohort | null)[]) => {
  const is_front = identifier === 'Front' || identifier === 'Back'
  if (!is_front) {
    try {
      expect(cohorts.length).toEqual(types.length)
    }
    catch (e) {
      throw new Error(identifier + ' length ' + cohorts.length + ' should be ' + types.length + '.')
    }
  }
  const half = Math.floor(info.settings[Setting.CombatWidth] / 2.0)
  let index = is_front ? half : 0
  for (const type of types) {
    verifyType(identifier, side, index, cohorts[index]?.definition, type, ' at index ' + index)
    index = is_front ? nextIndex(index, half) : index + 1
  }
}

/**
 * Verifies one round for one side.
 * @param round Round to verify.
 * @param side Side to verify (for debugging purposes).
 * @param frontline Units to check.
 * @param expected Expected units. Check is skipped if null.
 */
const verifySide = (round: number, side: SideType, frontline: (CombatCohort | null)[], expected: Expected | null) => {
  // Data might be missing or not relevant for the test..
  if (!expected)
    return
  expected.forEach((unit, index) => {
    if (unit) {
      const type = unit[0]
      verifyType(round, side, index, frontline[index]?.definition, type)
      if (unit[1] !== null && unit[2] !== null)
        verifyFast(round, side, index, frontline[index], unit[1], unit[2])
    }
    else
      verifyType(round, side, index, frontline[index]?.definition, null)
  })
}
/**
 * Inits expected units with empty values.
 * @param rounds Amount of rounds to init.
 */
export const initSide = (rounds: number) => ({
  attacker: mapRange(rounds, initFrontline), defender: mapRange(rounds, initFrontline)
})

/**
 * Returns empty values for one round.
 */
const initFrontline = (): ExpectedUnits[] => (
  [null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null]
)

export const createExpected = (...types: ([UnitType | null, number] | UnitType)[]) => types.reduce((prev, current) => prev.concat(Array.isArray(current) ? Array(current[1]).fill(current[0]) : [current]), [] as UnitType[])
