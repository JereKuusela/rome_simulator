import { getDefaultTactics, getDefaultTerrains, getDefaultCountryDefinitions, getDefaultBattle, getDefaultSettings } from 'data'
import { mapRange, toObj, values, map } from 'utils'
import { Mode, CountryName, Setting, SideType, UnitAttribute, UnitType, TerrainType, UnitPreferenceType, CombatPhase, UnitPreferences, Cohort, UnitRole, CountryDefinitions, ArmyName, ModeState, SettingsAndOptions, Side, Settings, TacticDefinitions, TerrainDefinitions, CohortData, Environment, DisciplineValue, CohortDefinition, TacticType, GeneralAttribute, GeneralValueType } from 'types'
import { doCombatRound } from 'combat'
import { convertSides, getCombatEnvironment } from 'state'
import { addToReserve, selectTactic, setGeneralAttribute } from 'managers/army'
import { createArmy } from 'managers/countries'
import { flatten } from 'lodash'
import { getLeadingArmy, selectTerrain } from 'managers/battle'

/**
 * Everything the combat tests might need to make tests convenient to write.
 */
export interface TestState {
  battle: ModeState
  settings: SettingsAndOptions
  countries: CountryDefinitions
  tactics: TacticDefinitions
  terrains: TerrainDefinitions
}
/**
 * Returns initial state for a test.
 */
export const initState = (): TestState => {
  return {
    battle: getDefaultBattle(1),
    settings: getDefaultSettings(),
    countries: getDefaultCountryDefinitions(),
    terrains: getDefaultTerrains(),
    tactics: getDefaultTactics()
  }
}

/**
 * Returns a clean state for a test. All mechanics turned off.
 */
export const initCleanState = (): TestState => {
  const settings = getDefaultSettings()
  settings.siteSettings = map(settings.siteSettings, item => typeof item === 'boolean' ? false : item) as Settings
  settings.siteSettings[Setting.MoraleHitForNonSecondaryReinforcement] = 0
  settings.siteSettings[Setting.FixFlankTargeting] = true
  settings.siteSettings[Setting.CustomDeployment] = true
  settings.siteSettings[Setting.AttackerSwapping] = true
  settings.siteSettings[Setting.AttributeDiscipline] = DisciplineValue.Off
  return {
    battle: getDefaultBattle(1),
    settings,
    countries: getDefaultCountryDefinitions(),
    terrains: getDefaultTerrains(),
    tactics: getDefaultTactics()
  }
}

const getCountryNameTest = (side: SideType) => side === SideType.A ? CountryName.Country1 : CountryName.Country2
const getCountryTest = (state: TestState, side: SideType) => state.countries[getCountryNameTest(side)]

export const getArmyTest = (state: TestState, side: SideType, index: number = 0) => getCountryTest(state, side).armies[getArmyNameTest(index)]

const getArmyNameTest = (index: number) => index === 0 ? ArmyName.Army : ('Test' + index) as ArmyName

export const createArmyTest = (state: TestState, side: SideType, daysUntilBattle: number = 0) => {
  const country = getCountryTest(state, side)
  const participants = state.battle[Mode.Land].sides[side].participants
  const armyName = getArmyNameTest(participants.length)
  createArmy(country, armyName, Mode.Land)
  participants.push({
    armyName,
    countryName: getCountryNameTest(side),
    daysUntilBattle
  })
}


export const getSettingsTest = (state: TestState) => state.settings.siteSettings

export const createCohort = (type: UnitType): CohortDefinition => {

  const cohort = {
    type,
    image: '',
    mode: Mode.Land,
    role: UnitRole.Front,
    baseValues: {
      ...toObj(values(UnitType), type => type, () => ({ 'key': 0 })),
      ...toObj(values(UnitAttribute), type => type, () => ({ 'key': 0 })),
      ...toObj(values(TerrainType), type => type, () => ({ 'key': 0 })),
      ...toObj(values(CombatPhase), type => type, () => ({ 'key': 0 }))
    }
  }
  cohort.baseValues[UnitAttribute.Morale] = { 'key': 1 }
  cohort.baseValues[UnitAttribute.Strength] = { 'key': 1 }
  cohort.baseValues[UnitAttribute.Maneuver] = { 'key': 1 }
  return cohort
}

export const createDefeatedCohort = (type: UnitType): CohortDefinition => {
  const cohort = createCohort(type)
  cohort.baseValues![UnitAttribute.Morale] = { 'key': 0 }
  cohort.baseValues![UnitAttribute.Strength] = { 'key': 1 }
  return cohort
}

export const createWeakCohort = (type: UnitType): CohortDefinition => {
  const cohort = createCohort(type)
  cohort.baseValues![UnitAttribute.Morale] = { 'key': 0.3 }
  cohort.baseValues![UnitAttribute.Strength] = { 'key': 1 }
  return cohort
}
export const createFlankingCohort = (type: UnitType): CohortDefinition => {
  const cohort = createCohort(type)
  cohort.baseValues![UnitAttribute.Maneuver] = { 'key': 4 }
  cohort.role = UnitRole.Flank
  return cohort
}

export const createStrongCohort = (type: UnitType): CohortDefinition => {

  const cohort = createCohort(type)
  cohort.baseValues![UnitAttribute.Morale] = { 'key': 20 }
  cohort.baseValues![UnitAttribute.Strength] = { 'key': 1 }
  return cohort
}

// Dummy test to avoid an error.
describe('utils', () => {
  it('works', () => { })
})

export const addToReserveTest = (state: TestState, side: SideType, cohorts: CohortData[], index: number = 0) => addToReserve(getArmyTest(state, side, index), cohorts)
export const selectTacticTest = (state: TestState, side: SideType, tactic: TacticType, index: number = 0) => selectTactic(getArmyTest(state, side, index), tactic)
export const selectTerrainTest = (state: TestState, terrain: TerrainType, index: number = 0) => selectTerrain(state.battle[Mode.Land], index, terrain)
export const setGeneralAttributeTest = (state: TestState, side: SideType, attribute: GeneralValueType, value: number, index: number = 0) => setGeneralAttribute(getArmyTest(state, side, index), attribute, value)

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
export const getUnit = (type: UnitType): CohortData => ({ type })

export const getBattleTest = (state: TestState) => state.battle[Mode.Land]

/**
 * List of every unit type for deployment/reinforcement tests.
 */
export const everyType = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants, UnitType.SupplyTrain]

type ExpectedCohort = ([UnitType, number, number] | UnitType | CohortDefinition | null)

type ExpectedArmy = {
  front?: ExpectedCohort[]
  targeting?: (number | undefined)[]
  back?: ExpectedCohort[]
  reserveFront?: ExpectedCohort[]
  reserveFlank?: ExpectedCohort[]
  reserveSupport?: ExpectedCohort[]
  defeated?: ExpectedCohort[]
  leader?: number
  roll?: number
}

export type Expected = {
  A: ExpectedArmy,
  B: ExpectedArmy,
  attackerFlipped?: boolean
}

export const testCombatWithDefaultRolls = (state: TestState, expected: Expected[]) => {
  return testCombatSub(state, [], expected)
}
export const testCombatWithCustomRolls = (state: TestState, rolls: number[][], expected: Expected[]) => {
  const rollsPerDay = flatten(rolls.map(rolls => Array(5).fill(rolls) as [number, number][]))
  return testCombatSub(state, rollsPerDay, expected)
}
export const testDeployment = (state: TestState, A: ExpectedArmy, B: ExpectedArmy) => testCombatSub(state, [], [{ A, B }])

export const testReinforcement = (roundsToSkip: number, state: TestState, A: ExpectedArmy, B: ExpectedArmy) => {
  return testCombatSub(state, Array(Math.max(0, roundsToSkip - 1)).fill([2, 2]).concat([[-1000, -1000]]), Array(roundsToSkip).fill(null).concat({ A, B }))
}

/**
 * Tester function for combat.
 * @param state Initial combat state.
 * @param rolls List of rolls.
 * @param expectedA Expected attacker units for every round. Nulls can be used to skip checks.
 * @param expectedB Expected defender units for every round. Nulls can be used to skip checks.
 */
const testCombatSub = (state: TestState, rolls: [number, number][], expected: Expected[]) => {
  const [sideA, sideB] = convertSides(state as any)
  const env = getCombatEnvironment(state as any)
  for (; env.day < expected.length; env.day++) {
    [sideA.results.dice, sideB.results.dice] = getRolls(rolls, env.day)
    doCombatRound(env, sideA, sideB, true)
    verify(env, sideA, expected[env.day]?.A)
    verify(env, sideB, expected[env.day]?.B)
    if (expected[env.day]?.attackerFlipped !== undefined)
      expect(env.attacker).toEqual(expected[env.day].attackerFlipped ? SideType.B : SideType.A)
  }
  return [sideA, sideB]
}

const getRolls = (rolls: number[][], day: number): [number, number] => {
  if (0 < day && day - 1 < rolls.length)
    return [rolls[day - 1][0], rolls[day - 1][1]]
  return [2, 2]
}

const verify = (env: Environment, side: Side, expected: ExpectedArmy) => {
  // No need to check anything if nothing is expected.
  if (!expected)
    return
  verifyPart('Front', env, expected.front ?? [], side.type, side.cohorts.frontline[0])
  verifyPart('Back', env, expected.back ?? [], side.type, side.cohorts.frontline.length ? side.cohorts.frontline[1] : [])
  verifyPart('Reserve front', env, expected.reserveFront ?? [], side.type, side.cohorts.reserve.front)
  verifyPart('Reserve flank', env, expected.reserveFlank ?? [], side.type, side.cohorts.reserve.flank)
  verifyPart('Reserve support', env, expected.reserveSupport ?? [], side.type, side.cohorts.reserve.support)
  verifyPart('Defeated', env, expected.defeated ?? [], side.type, side.cohorts.defeated.concat(side.cohorts.retreated))
  if (expected.targeting !== undefined)
    verifyTargeting(env, side.type, side.cohorts.frontline[0], expected.targeting)
  if (expected.leader !== undefined)
    verifyLeader(side, expected.leader)
  if (expected.roll !== undefined)
    expect(side.results.dice + side.results.terrainPips + side.results.generalPips).toEqual(expected.roll)
}

const verifyTargeting = (env: Environment, side: SideType, cohorts: (Cohort | null)[], expected: (number | undefined)[]) => {
  const half = Math.floor(env.settings[Setting.BaseCombatWidth] / 2.0)
  let index = half
  for (const exp of expected) {
    const target = cohorts[index]?.state.target?.properties
    const targetIndex = target ? target.index + 1000 * target.participantIndex : undefined
    try {
      expect(targetIndex).toEqual(exp)
    }
    catch (e) {
      throw new Error(errorPrefix(env.day, side, 'Front', index) + 'Cohort should target ' + exp + ' instead of ' + targetIndex)
    }

    index = nextIndex(index, half)
  }
}

const verifyLeader = (side: Side, expected: number) => {
  expect(getLeadingArmy(side)?.participantIndex).toEqual(expected)
}

const errorPrefix = (day: string | number, side: SideType, part: string, index?: number) => (typeof day === 'number' ? 'Round ' : '') + day + ', ' + side + ' ' + part + (index === undefined ? '' : ' ' + index) + ': '

const verifyCohort = (cohort: Cohort | null, strength: number, morale: number) => {
  expect(cohort).toBeTruthy()
  if (!cohort)
    return
  strength = Math.floor(1000 * strength) / 1000
  const unitStrength = Math.floor(1000 * cohort[UnitAttribute.Strength]) / 1000
  try {
    expect(unitStrength).toBeCloseTo(strength, 3)
  }
  catch (e) {
    throw new Error('Strength ' + unitStrength + ' should be ' + strength)
  }
  const unitMorale = cohort[UnitAttribute.Morale]
  try {
    expect(unitMorale).toBeCloseTo(morale, 2)
  }
  catch (e) {
    throw new Error('Morale ' + unitMorale + ' should be ' + morale)
  }
}

const verifyType = (type: UnitType | undefined, expected: UnitType | null) => {
  if (expected) {
    try {
      expect(type).toBeTruthy()
    }
    catch (e) {
      throw new Error('Cohort should exist.')
    }
    try {
      expect(type).toEqual(expected)
    }
    catch (e) {
      throw new Error('Type ' + type + ' should be ' + expected)
    }

  }
  else {
    try {
      expect(type).toBeFalsy()
    }
    catch (e) {
      throw new Error('Cohort shouldn\'t exist.')
    }
  }
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyPart = (part: string, env: Environment, expected: ExpectedCohort[], side: SideType, cohorts: (Cohort | null)[]) => {
  const isFront = part === 'Front' || part === 'Back'
  if (!isFront) {
    try {
      expect(cohorts.length).toEqual(expected.length)
    }
    catch (e) {
      throw new Error(errorPrefix(env.day, side, part) + 'length ' + cohorts.length + ' should be ' + expected.length + '.')
    }
  }
  const half = Math.floor(env.settings[Setting.BaseCombatWidth] / 2.0)
  let index = isFront ? half : 0
  for (const exp of expected) {
    try {
      if (Array.isArray(exp)) {
        verifyType(cohorts[index]?.properties?.type, exp[0])
        if (exp[1] !== null && exp[2] !== null)
          verifyCohort(cohorts[index], exp[1], exp[2])
      } else if (typeof exp === 'object' && exp) {
        verifyType(cohorts[index]?.properties?.type, exp.type)
      } else {
        verifyType(cohorts[index]?.properties?.type, exp)
      }
    }
    catch (e) {
      throw new Error(errorPrefix(env.day, side, part, index) + (e as Error).message)
    }

    index = isFront ? nextIndex(index, half) : index + 1
  }
}

/**
 * Inits expected units with empty values.
 * @param rounds List of days to init, in ascending order.
 */
export const initExpected = (...rounds: number[]): Expected[] => {
  return mapRange(rounds[rounds.length - 1] + 1, round => {
    const includes = rounds.includes(round)
    return {
      A: initExpectedArmy(includes),
      B: initExpectedArmy(includes)
    }
  })
}

const initExpectedArmy = (included: boolean): ExpectedArmy => included ? {} : null as any

export const createExpected = (...types: ([UnitType | null, number] | UnitType)[]) => types.reduce((prev, current) => prev.concat(Array.isArray(current) ? Array(current[1]).fill(current[0]) : [current]), [] as UnitType[])
