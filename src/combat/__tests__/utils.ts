import { getDefaultUnits, getDefaultTactics, getDefaultTerrains, getDefaultLandSettings, getDefaultSiteSettings, getDefaultUnit, getDefaultSide, getDefaultCountryDefinitions, getDefaultMode, getDefaultBattle } from 'data'
import { map, mapRange, resize, toObj, values } from 'utils'
import { mergeValues } from 'definition_values'
import { Mode, CountryName, TacticType, Setting, SideType, UnitAttribute, UnitType, TerrainType, UnitPreferenceType, CohortDefinition, CombatPhase, CultureType, GeneralAttribute, UnitPreferences, Cohort, Army, UnitRole, SideData, Environment, CountryDefinitions, ArmyName, Battle, ModeState, SettingsAndOptions } from 'types'
import { doBattle, deploy, reinforce } from 'combat'
import { convertArmy, convertSide } from 'managers/battle'
import { removeDefeated } from 'combat/combat_utils'
import { convertSides, AppState, getCombatField } from 'state'

const unitDefinitions = map(getDefaultUnits('' as CultureType), unit => mergeValues(unit, getDefaultUnit(UnitType.Land)))
export const getDefinitions = () => ({ [CountryName.Country1]: unitDefinitions, [CountryName.Country2]: unitDefinitions })
const tactics = getDefaultTactics()
const terrains = getDefaultTerrains()

/**
 * Everything the combat tests might need to make tests convenient to write.
 */
export interface TestState {
  environment: Environment
  battle: ModeState
  settings: SettingsAndOptions
  countries: CountryDefinitions
}

export interface ExpectedTypes {
  front?: (UnitType | null)[]
  back?: (UnitType | null)[]
  reserveFront?: UnitType[]
  reserveFlank?: UnitType[]
  reserveSupport?: UnitType[]
  defeated?: UnitType[]
}

/**
 * Returns initial state for a test.
 * @param legacyDamage Older versions of Imperator had lower damage. This option should be removed once old tests are scaled properly.
 */
export const initState = (legacyDamage?: boolean): TestState => {
  const settings = { ...getDefaultLandSettings(), ...getDefaultSiteSettings(), [Setting.Precision]: 100000 }
  if (legacyDamage) {
    settings[Setting.MoraleLostMultiplier] = settings[Setting.MoraleLostMultiplier] * 0.02 / 0.024
    settings[Setting.StrengthLostMultiplier] = settings[Setting.StrengthLostMultiplier] * 0.02 / 0.024
  }
  return {
    battle: getDefaultBattle(),
    environment: {
      day: 0,
      round: 0,
      settings,
      terrains: []
    },
    countries: getDefaultCountryDefinitions()
    }
}

export const getArmy = (state: TestState, side: SideType) => side === SideType.Attacker ? state.countries[CountryName.Country1].armies[ArmyName.Army] : state.countries[CountryName.Country2].armies[ArmyName.Army]

export const getSettings = (state: TestState) => state.environment.settings

export const createCohort = (type: UnitType) => ({
  type,
  id: 1,
  image: '',
  mode: Mode.Land,
  role: UnitRole.Front,
  baseValues: {
    ...toObj(values(UnitType), type => type, () => ({ 'key': 0 })),
    ...toObj(values(UnitAttribute), type => type, () => ({ 'key': 0 })),
    ...toObj(values(TerrainType), type => type, () => ({ 'key': 0 })),
    ...toObj(values(CombatPhase), type => type, () => ({ 'key': 0 }))
  }
})

const errorPrefix = (identifier: string | number, side: SideType, index: number) => (typeof identifier === 'number' ? 'Round ' : '') + identifier + ', ' + side + ' ' + index + ': '

const verifyFast = (identifier: string | number, side: SideType, index: number, unit: Cohort | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  const unitStrength = Math.floor(1000 * unit[UnitAttribute.Strength])
  try {
    expect(Math.floor(unitStrength)).toEqual(strength)
  }
  catch (e) {
    throw new Error(errorPrefix(identifier, side, index) + 'Strength ' + unitStrength + ' should be ' + strength)
  }
  const unitMorale = unit[UnitAttribute.Morale]
  try {
    expect(Math.abs(unitMorale - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error(errorPrefix(identifier, side, index) + 'Morale ' + unitMorale + ' should be ' + 2 * morale)
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
 * Returns a unit with a given type.
 */
export const getUnit = (type: UnitType) => ({ ...unitDefinitions[type] } as any as CohortDefinition)

/**
 * List of every unit type for deployment/reinforcement tests.
 */
export const everyType = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants, UnitType.SupplyTrain]

/**
 * Performs one combat round with a given test info.
 */
const doRound = (info: TestState, a: Army, d: Army) => {
  doBattle(a, d, true, info.settings, info.round++)
}


type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

const getParticipants = (info: TestState) => {
  const participantA = convertArmy(SideType.Attacker, info.armyA, info.armyD, info.terrains, info.settings)
  const participantD = convertArmy(SideType.Defender, info.armyD, info.armyA, info.terrains, info.settings)
  return [participantA, participantD]
}

/**
 * Tester function for combat.
 * @param state Initial combat state.
 * @param rolls List of rolls.
 * @param attacker Expected attacker units for every round. Nulls can be used to skip checks.
 * @param defender Expected defender units for every round. Nulls can be used to skip checks.
 */
export const testCombat = (state: TestState, rolls: number[][], attacker: Expected[], defender: Expected[]) => {
  const [sideA, sideD] = convertSides(state as any)
  const environment = getCombatField(state as any)
  for (let roll = 0; roll < rolls.length; roll++) {
    sideA.results.dice = rolls[roll][0]
    sideD.results.dice = rolls[roll][1]
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doBattle( sideA, sideD, true)
      doRound(state, participantA, participantD)
      verifySide(round, SideType.Attacker, participantA.cohorts.frontline[0], attacker[round])
      verifySide(round, SideType.Defender, participantD.cohorts.frontline[0], defender[round])
    }
  }
  return [sideA, sideD]
}
export const testDeployment = (info: TestState, expectedA?: ExpectedTypes, expectedD?: ExpectedTypes) => {
  const [participantA, participantD] = getParticipants(info)
  deploy(participantA, participantD, info.settings)
  if (expectedA)
    verifyDeployOrReinforce(info, SideType.Attacker, participantA, expectedA)
  if (expectedD)
    verifyDeployOrReinforce(info, SideType.Defender, participantD, expectedD)
  return [participantA, participantD]
}

export const testReinforcement = (roundsToSkip: number, info: TestState, expectedA?: ExpectedTypes, expectedD?: ExpectedTypes) => {
  const [participantA, participantD] = getParticipants(info)
  deploy(participantA, participantD, info.settings)
  participantA.dice = 2
  participantD.dice = 2
  for (let round = 0; round < roundsToSkip; round++)
    doRound(info, participantA, participantD)
  removeDefeated(participantA.cohorts.frontline)
  removeDefeated(participantD.cohorts.frontline)
  reinforce(participantA, info.settings)
  reinforce(participantD, info.settings)
  if (expectedA)
    verifyDeployOrReinforce(info, SideType.Attacker, participantA, expectedA)
  if (expectedD)
    verifyDeployOrReinforce(info, SideType.Defender, participantD, expectedD)
  return [participantA, participantD]
}

const verifyDeployOrReinforce = (info: TestState, side: SideType, participant: Army, expected: ExpectedTypes) => {
  verifyTypes('Front', info, expected.front ?? [], side, participant.cohorts.frontline[0])
  verifyTypes('Back', info, expected.back ?? [], side, participant.cohorts.frontline.length ? participant.cohorts.frontline[1] : [])
  verifyTypes('Reserve front', info, expected.reserveFront ?? [], side, participant.cohorts.reserve.front)
  verifyTypes('Reserve flank', info, expected.reserveFlank ?? [], side, participant.cohorts.reserve.flank)
  verifyTypes('Reserve support', info, expected.reserveSupport ?? [], side, participant.cohorts.reserve.support)
  verifyTypes('Defeated', info, expected.defeated ?? [], side, participant.cohorts.defeated)
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyTypes = (identifier: string, info: TestState, types: (UnitType | null)[], side: SideType, cohorts: (Cohort | null)[]) => {
  const isFront = identifier === 'Front' || identifier === 'Back'
  if (!isFront) {
    try {
      expect(cohorts.length).toEqual(types.length)
    }
    catch (e) {
      throw new Error(identifier + ' length ' + cohorts.length + ' should be ' + types.length + '.')
    }
  }
  const half = Math.floor(info.settings[Setting.CombatWidth] / 2.0)
  let index = isFront ? half : 0
  for (const type of types) {
    verifyType(identifier, side, index, cohorts[index]?.properties, type, ' at index ' + index)
    index = isFront ? nextIndex(index, half) : index + 1
  }
}

/**
 * Verifies one round for one side.
 * @param round Round to verify.
 * @param side Side to verify (for debugging purposes).
 * @param frontline Units to check.
 * @param expected Expected units. Check is skipped if null.
 */
const verifySide = (round: number, side: SideType, frontline: (Cohort | null)[], expected: Expected | null) => {
  // Data might be missing or not relevant for the test..
  if (!expected)
    return
  expected.forEach((unit, index) => {
    if (unit) {
      const type = unit[0]
      verifyType(round, side, index, frontline[index]?.properties, type)
      if (unit[1] !== null && unit[2] !== null)
        verifyFast(round, side, index, frontline[index], unit[1], unit[2])
    }
    else
      verifyType(round, side, index, frontline[index]?.properties, null)
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
