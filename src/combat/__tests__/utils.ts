import { getDefaultGlobals, getDefaultUnits, getDefaultTactics, getDefaultTerrains, getDefaultLandSettings, getDefaultSiteSettings } from 'data'
import { DefinitionType } from 'base_definition'
import { map, mapRange } from 'utils'
import { mergeValues, calculateValue } from 'definition_values'
import { CountryName, Participant, Army, TerrainDefinition, getDefaultParticipant, getDefaultArmy, TacticType, Setting, Side, BaseUnit, UnitCalc, UnitType, TerrainType, RowType, TacticCalc, Settings } from 'types'
import { CombatUnit, CombatParticipant, doBattleFast } from 'combat/combat'
import { getBaseDamages, convertUnits } from 'combat/simulation'
import { calculateTotalRoll } from 'combat/combat_utils'
import { deploy, sortReserve } from 'combat/deployment'


const global_stats = getDefaultGlobals()[DefinitionType.Land]
const units = map(getDefaultUnits(), unit => mergeValues(unit, global_stats))
export const getDefinitions = () => ({ [CountryName.Country1]: units, [CountryName.Country2]: units })
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
  terrains: TerrainDefinition[]
  settings: Settings
}

/**
 * Returns a clean combat state for tests.
 */
export const initInfo = () => ({
  attacker: getDefaultParticipant(CountryName.Country1),
  defender: getDefaultParticipant(CountryName.Country2),
  army_a: {
    ...getDefaultArmy(DefinitionType.Land),
    // Frontline must be cloned to prevent tests mutating the source.
    frontline: [...getDefaultArmy(DefinitionType.Land).frontline],
    tactic: TacticType.Envelopment,
    row_types: getRowTypes()
  },
  army_d: {
    ...getDefaultArmy(DefinitionType.Land),
    // Frontline must be cloned to prevent tests mutating the source.
    frontline: [...getDefaultArmy(DefinitionType.Land).frontline],
    tactic: TacticType.Envelopment,
    row_types: getRowTypes()
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
const verify = (round: number, side: Side, index: number, unit: BaseUnit | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  const unit_strength = Math.floor(1000 * calculateValue(unit, UnitCalc.Strength))
  try {
    expect(Math.floor(unit_strength)).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Strength ' + unit_strength + ' is not ' + strength)
  }
  const unit_morale = calculateValue(unit, UnitCalc.Morale)
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
  const unit_strength = Math.floor(1000 * unit[UnitCalc.Strength])
  try {
    expect(Math.floor(unit_strength)).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Strength ' + unit_strength + ' is not ' + strength)
  }
  const unit_morale = unit[UnitCalc.Morale]
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
export const setCenterUnits = (info: TestInfo, unit_a: BaseUnit, unit_d: BaseUnit) => {
  info.army_a.frontline[15] = unit_a
  info.army_d.frontline[15] = unit_d
}
/**
 * Sets an attacker unit (useful for more complex tests).
 */
export const setAttacker = (info: TestInfo, index: number, unit: BaseUnit) => {
  info.army_a.frontline[index] = unit
}
/**
 * Sets a defender unit (useful for more complex tests).
 */
export const setDefender = (info: TestInfo, index: number, unit: BaseUnit) => {
  info.army_d.frontline[index] = unit
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

// Dummy test to avoid an error.
describe('utils', () => {
  it('works', () => { })
})

/**
 * Returns row types object with given selections.
 * @param primary Selected primary type or null.
 * @param secondary Selected secondary type or null.
 * @param flank Selected flank tyoe or null.
 */
export const getRowTypes = (primary: UnitType | null = null, secondary: UnitType | null = null, flank: UnitType | null = null) => ({ [RowType.Primary]: primary, [RowType.Secondary]: secondary, [RowType.Flank]: flank })
/**
 * Returns a unit with a given type.
 */
export const getUnit = (type: UnitType) => ({ ...units[type] } as any as BaseUnit)

/**
 * List of every unit type for deployment/reinforcement tests.
 */
export const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]

/**
 * Performs one combat round with a given test info.
 */
const doRound = (info: TestInfo, a: CombatParticipant, d: CombatParticipant) => {
  doBattleFast(a, d, false, info.settings)
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
    row_types: info.army_a.row_types,
    flank: info.army_a.flank_size
  }
  const participant_d: CombatParticipant = {
    army: status_d,
    roll: 0,
    tactic: tactics[info.army_d.tactic],
    row_types: info.army_d.row_types,
    flank: info.army_d.flank_size
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
      verifySide(round, Side.Attacker, participant_a.army.frontline, attacker[round])
      verifySide(round, Side.Defender, participant_d.army.frontline, defender[round])
    }
  }
}
export const testDeploy = (info: TestInfo, expected_a: UnitType[] | null = null, reserve_length_a: number = 0, expected_d: UnitType[] | null = null, reserve_length_d: number = 0) => {
  const [participant_a, participant_d] = getParticipants(info)
  deploy(participant_a, participant_d, info.settings)
  verifyDeployOrReinforce(info, Side.Attacker, participant_a, expected_a, reserve_length_a)
  verifyDeployOrReinforce(info, Side.Defender, participant_d, expected_d, reserve_length_d)
}

const verifyDeployOrReinforce = (info: TestInfo, side: Side, participant: CombatParticipant, expected: UnitType[] | null = null, reserve_length: number = 0) => {
  if (expected) {
    verifyTypes(info, expected, side, participant.army.frontline)
    expect(participant.army.reserve.length).toEqual(reserve_length)
  }
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyTypes = (info: TestInfo, types: UnitType[], side: Side, frontline: (CombatUnit | null)[]) => {
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
  let sorted = sortReserve(reserve, participant_a.row_types)
  reserve.splice(0, reserve.length, ...(sorted.flank.concat(sorted.front)))
  reserve = participant_d.army.reserve
  sorted = sortReserve(reserve, participant_d.row_types)
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
