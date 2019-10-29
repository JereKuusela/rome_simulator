import { Army, Participant, RowType, Side, getDefaultParticipant, getDefaultArmy } from '../../battle'
import { TacticType, getDefaultTactics } from '../../tactics'
import { BaseUnit, UnitCalc, UnitType, getDefaultUnits, getDefaultGlobals } from '../../units'
import { calculateValue, mergeValues, DefinitionType } from '../../../base_definition'
import { map, mapRange } from '../../../utils'
import { CountryName } from '../../countries'
import { doBattle } from '../../../combat/combat'
import { getDefaultLandSettings, CombatParameter } from '../../settings'
import { TerrainDefinition, TerrainType, getDefaultTerrains } from '../../terrains'

const global_stats = getDefaultGlobals()[DefinitionType.Land]
const units = map(getDefaultUnits(), unit => mergeValues(unit, global_stats))
export const getDefinitions = () => ({ [CountryName.Country1]: units, [CountryName.Country2]: units })
const definitions = getDefinitions()
const tactics = getDefaultTactics()
const terrains = getDefaultTerrains()

/**
 * Everything the combat tests might need to make tests convenient to write.
 */
export interface TestInfo {
  attacker: Participant
  defender: Participant
  army_a: Army
  army_d: Army
  round: number
  terrains: TerrainDefinition[]
  settings: { [key in CombatParameter]: number }
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
  terrains: [],
  settings: getDefaultLandSettings()
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
  try {
    expect(Math.floor(1000 * calculateValue(unit, UnitCalc.Strength))).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Strength ' + 1000 * calculateValue(unit, UnitCalc.Strength) + ' is not ' + strength);
  }
  try {
    expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error(errorPrefix(round, side, index) + 'Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + 2 * morale);
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
export const verifyType = (round: number, side: Side, index: number, unit: BaseUnit | null, type: UnitType | null, message: string = '') => {
  if (type) {
    try {
      expect(unit).toBeTruthy()
    }
    catch (e) {
      throw new Error(errorPrefix(round, side, index) + 'Unit should exist');
    }
    try {
      expect(unit!.type + message).toEqual(type + message)
    }
    catch (e) {
      throw new Error(errorPrefix(round, side, index) + 'Type ' + unit!.type + ' is not ' + type);
    }

  }
  else {
    try {
      expect(unit).toBeFalsy()
    }
    catch (e) {
      throw new Error(errorPrefix(round, side, index) + 'Unit shouldn\'t exist');
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
const doRound = (info: TestInfo) => {
  info.round = info.round + 1
  const [a, d] = doBattle(definitions, { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.round, info.terrains, info.settings)
  info.army_a = { ...info.army_a, ...a }
  info.army_d = { ...info.army_d, ...d }
}

type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

/**
 * Tester function for combat.
 * @param info Initial combat state.
 * @param rolls List of rolls.
 * @param attacker Expected attacker units for every round. Nulls can be used to skip checks.
 * @param defender Expected defender units for every round. Nulls can be used to skip checks.
 */
export const testCombat = (info: TestInfo, rolls: number[][], attacker: Expected[], defender: Expected[]) => {
  for (let roll = 0; roll < rolls.length; roll++) {
    setRolls(info, rolls[roll][0], rolls[roll][1])
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doRound(info)
      verifySide(round, Side.Attacker, info.army_a.frontline, attacker[round])
      verifySide(round, Side.Defender, info.army_d.frontline, defender[round])
    }
  }
}

/**
 * Verifies one round for one side.
 * @param round Round to verify.
 * @param side Side to verify (for debugging purposes).
 * @param frontline Units to check.
 * @param expected Expected units. Check is skipped if null.
 */
const verifySide = (round: number, side: Side, frontline: (BaseUnit | null)[], expected: Expected | null) => {
  // Data might be missing or not relevant for the test..
  if (!expected)
    return
  expected.forEach((unit, index) => {
    if (unit) {
      const type = unit[0]
      verifyType(round, side, index, frontline[index], type)
      if (unit[1] !== null && unit[2] !== null)
        verify(round, side, index, frontline[index], unit[1], unit[2])
    }
    else
      verifyType(round, side, index, frontline[index], null)
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
