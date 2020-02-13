import { getDefaultUnits, getDefaultTactics, getDefaultTerrains, getDefaultLandSettings, getDefaultSiteSettings, getDefaultParticipant, getDefaultArmy, getDefaultUnit } from 'data'
import { map, mapRange } from 'utils'
import { mergeValues, calculateValue } from 'definition_values'
import { Mode, CountryName, Participant, Terrain, TacticType, Setting, Side, BaseCohort, UnitAttribute, UnitType, TerrainType, UnitPreferenceType, TacticCalc, Settings, Cohorts, UnitPreferences, General, Cohort, FrontLine } from 'types'
import { CombatUnit, CombatParticipant, doBattleFast, getBaseDamages, convertUnits, calculateTotalRoll, deploy, sortReserve } from 'combat'

const unitDefinitions = map(getDefaultUnits(), unit => mergeValues(unit, getDefaultUnit(UnitType.BaseLand)))
export const getDefinitions = () => ({ [CountryName.Country1]: unitDefinitions, [CountryName.Country2]: unitDefinitions })
const tactics = getDefaultTactics()
const terrains = getDefaultTerrains()

/**
 * Everything the combat tests might need to make tests convenient to write.
 */
export interface TestInfo {
  attacker: Participant
  defender: Participant
  general_a: number
  general_d: number
  army_a: Army
  army_d: Army
  terrains: Terrain[]
  settings: Settings
}

interface Army extends Cohorts {
  tactic: TacticType
  unit_preferences: UnitPreferences
  flank_size: number
  general: General
}

/**
 * Returns a clean combat state for tests.
 */
export const initInfo = () => ({
  attacker: getDefaultParticipant(CountryName.Country1),
  defender: getDefaultParticipant(CountryName.Country2),
  army_a: {
    ...getDefaultArmy(Mode.Land),
    // Frontline must be cloned to prevent tests mutating the source.
    frontline: [],
    reserve: {},
    defeated: {},
    tactic: TacticType.Envelopment,
    unit_preferences: getUnitPreferences()
  },
  army_d: {
    ...getDefaultArmy(Mode.Land),
    // Frontline must be cloned to prevent tests mutating the source.
    frontline: [],
    reserve: {},
    defeated: {},
    tactic: TacticType.Envelopment,
    unit_preferences: getUnitPreferences()
  },
  round: 0,
  general_a: 0,
  general_d: 0,
  terrains: [],
  settings: { ...getDefaultLandSettings(), ...getDefaultSiteSettings(), [Setting.BaseDamage]: 0.08, [Setting.RollDamage]: 0.02 }
})

const errorPrefix = (round: number, side: Side, index: number) => 'Round ' + round + ', ' + side + ' ' + index + ': '

/**
 * Verifies that unit's strength and morale values are correct (or at least close enough).
 * @param round Round number for debugging purposes.
 * @param side Side for debugging purposes.
 * @param index Unit location of frontline for debugging purposes.
 * @param unit Unit to check.
 * @param strength Expected strength (rounded down as in game).
 * @param morale Half of expected morale (as in game)
 */
const verify = (round: number, side: Side, index: number, unit: BaseCohort | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  const unit_strength = Math.floor(1000 * calculateValue(unit, UnitAttribute.Strength))
  try {
    expect(Math.floor(unit_strength)).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Strength ' + unit_strength + ' is not ' + strength)
  }
  const unit_morale = calculateValue(unit, UnitAttribute.Morale)
  try {
    expect(Math.abs(unit_morale - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Morale ' + unit_morale + ' is not ' + 2 * morale)
  }
}
const verifyFast = (round: number, side: Side, index: number, unit: CombatUnit | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  const unit_strength = Math.floor(1000 * unit[UnitAttribute.Strength])
  try {
    expect(Math.floor(unit_strength)).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Strength ' + unit_strength + ' is not ' + strength)
  }
  const unit_morale = unit[UnitAttribute.Morale]
  try {
    expect(Math.abs(unit_morale - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Morale ' + unit_morale + ' is not ' + 2 * morale)
  }
}

/**
 * Verifies that the unit has a correct type.
 *  @param round Round number for debugging purposes.
 * @param side Side for debugging purposes.
 * @param index Unit location of frontline for debugging purposes.
 * @param unit Unit to check.
 * @param type Expected type.
 * @param message Custom message on error.
 */
export const verifyType = (round: number, side: Side, index: number, unit: { type: UnitType } | null | undefined, type: UnitType | null, message: string = '') => {
  if (type) {
    try {
      expect(unit).toBeTruthy()
    }
    catch (e) {
      throw new Error(errorPrefix(round, side, index) + 'Unit should exist')
    }
    try {
      expect(unit!.type + message).toEqual(type + message)
    }
    catch (e) {
      throw new Error(errorPrefix(round, side, index) + 'Type ' + unit!.type + ' is not ' + type)
    }

  }
  else {
    try {
      expect(unit).toBeFalsy()
    }
    catch (e) {
      throw new Error(errorPrefix(round, side, index) + 'Unit shouldn\'t exist')
    }
  }
}
/**
 * Sets rolls for combat.
 */
export const setRolls = (info: TestInfo, roll_a: number, roll_d: number) => {
  info.attacker = { ...info.attacker, roll: roll_a }
  info.defender = { ...info.defender, roll: roll_d }
}
/**
 * Sets tactics for combat.
 */
export const setTactics = (info: TestInfo, tactic_a: TacticType, tactic_d: TacticType) => {
  info.army_a = { ...info.army_a, tactic: tactic_a }
  info.army_d = { ...info.army_d, tactic: tactic_d }
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
 * Sets flank sizes for combat.
 */
export const setTerrain = (info: TestInfo, terrain: TerrainType) => {
  info.terrains = []
  info.terrains.push(terrains[terrain])
}

export const setReserve = (info: TestInfo, attacker: UnitType[], defender: UnitType[]) => {
  info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(attacker.map(type => getUnit(type))) }
  info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(defender.map(type => getUnit(type))) }
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
export const getUnitPreferences = (primary: UnitType | null = null, secondary: UnitType | null = null, flank: UnitType | null = null) => ({ [UnitPreferenceType.Primary]: primary, [UnitPreferenceType.Secondary]: secondary, [UnitPreferenceType.Flank]: flank })

/**
 * Sets preferred unit types.
 * @param info 
 * @param attacker Array of 3 unit types.
 * @param defender Array of 3 unit types.
 */
export const setUnitPreferences = (info: TestInfo, attacker: (UnitType | null)[], defender: (UnitType | null)[]) => {
  
  info.army_a = { ...info.army_a, unit_preferences: { [UnitPreferenceType.Primary]: attacker[0], [UnitPreferenceType.Secondary]: attacker[1], [UnitPreferenceType.Flank]: attacker[2] } }
  info.army_d = { ...info.army_d, unit_preferences: { [UnitPreferenceType.Primary]: defender[0], [UnitPreferenceType.Secondary]: defender[1], [UnitPreferenceType.Flank]: defender[2] } }
}

/**
 * Returns a unit with a given type.
 */
export const getUnit = (type: UnitType) => ({ ...unitDefinitions[type] } as any as Cohort)

/**
 * List of every unit type for deployment/reinforcement tests.
 */
export const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]

/**
 * Performs one combat round with a given test info.
 */
const doRound = (info: TestInfo, a: CombatParticipant, d: CombatParticipant) => {
  doBattleFast(a, d, false, info.settings, 1)
}


type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

const getParticipants = (info: TestInfo) => {
  const dice = info.settings[Setting.DiceMaximum] - info.settings[Setting.DiceMinimum] + 1
  const base_damages_a = getBaseDamages(info.settings, dice, calculateTotalRoll(0, info.terrains, info.general_a, info.general_d))
  const base_damages_d = getBaseDamages(info.settings, dice, calculateTotalRoll(0, [], info.general_d, info.general_a))
  const tactic_casualties = calculateValue(tactics[info.army_a.tactic], TacticCalc.Casualties) + calculateValue(tactics[info.army_d.tactic], TacticCalc.Casualties)
  const status_a = convertUnits(info.army_a, info.settings, tactic_casualties, base_damages_a, info.terrains, every_type)
  const status_d = convertUnits(info.army_d, info.settings, tactic_casualties, base_damages_d, info.terrains, every_type)
  const participant_a: CombatParticipant = {
    army: status_a,
    roll: 0,
    tactic: tactics[info.army_a.tactic],
    unit_preferences: info.army_a.unit_preferences,
    flank: info.army_a.flank_size,
    unit_types: {} as any
  }
  const participant_d: CombatParticipant = {
    army: status_d,
    roll: 0,
    tactic: tactics[info.army_d.tactic],
    unit_preferences: info.army_d.unit_preferences,
    flank: info.army_d.flank_size,
    unit_types: {} as any
  }
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
    participant_a.roll = rolls[roll][0]
    participant_d.roll = rolls[roll][1]
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doRound(info, participant_a, participant_d)
      verifySide(round, Side.Attacker, participant_a.army.frontline[0], attacker[round])
      verifySide(round, Side.Defender, participant_d.army.frontline[0], defender[round])
    }
  }
}
export const testDeploy = (info: TestInfo, expected_a: (UnitType | null)[] | null = null, reserve_length_a: number = 0, expected_d: (UnitType | null)[] | null = null, reserve_length_d: number = 0) => {
  const [participant_a, participant_d] = getParticipants(info)
  deploy(participant_a, participant_d, info.settings)
  verifyDeployOrReinforce(info, Side.Attacker, participant_a, expected_a, reserve_length_a)
  verifyDeployOrReinforce(info, Side.Defender, participant_d, expected_d, reserve_length_d)
}

const verifyDeployOrReinforce = (info: TestInfo, side: Side, participant: CombatParticipant, expected: (UnitType | null)[] | null = null, reserve_length: number = 0) => {
  if (expected) {
    verifyTypes(info, expected, side, participant.army.frontline[0])
    expect(participant.army.reserve.length).toEqual(reserve_length)
  }
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyTypes = (info: TestInfo, types: (UnitType | null)[], side: Side, frontline: (CombatUnit | null)[]) => {
  const half = Math.floor(info.settings[Setting.CombatWidth] / 2.0)
  let index = half
  for (const type of types) {
    verifyType(-1, side, index, frontline[index]?.definition, type, ' at index ' + index)
    index = nextIndex(index, half)
  }
}

export const testReinforce = (info: TestInfo, expected_a: UnitType[] | null = null, reserve_length_a: number = 0, expected_d: UnitType[] | null = null, reserve_length_d: number = 0) => {
  const [participant_a, participant_d] = getParticipants(info)
  let reserve = participant_a.army.reserve
  let sorted = sortReserve(reserve, participant_a.unit_preferences)
  reserve.splice(0, reserve.length, ...(sorted.flank.concat(sorted.front)))
  reserve = participant_d.army.reserve
  sorted = sortReserve(reserve, participant_d.unit_preferences)
  reserve.splice(0, reserve.length, ...(sorted.flank.concat(sorted.front)))
  doRound(info, participant_a, participant_d)
  verifyDeployOrReinforce(info, Side.Attacker, participant_a, expected_a, reserve_length_a)
  verifyDeployOrReinforce(info, Side.Defender, participant_d, expected_d, reserve_length_d)
}

/**
 * Verifies one round for one side.
 * @param round Round to verify.
 * @param side Side to verify (for debugging purposes).
 * @param frontline Units to check.
 * @param expected Expected units. Check is skipped if null.
 */
const verifySide = (round: number, side: Side, frontline: (CombatUnit | null)[], expected: Expected | null) => {
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
