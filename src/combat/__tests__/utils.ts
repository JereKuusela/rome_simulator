import { getDefaultTactics, getDefaultTerrains, getDefaultCountryDefinitions, getDefaultBattle, getDefaultSettings } from 'data'
import { mapRange, toObj, values } from 'utils'
import { Mode, CountryName, Setting, SideType, UnitAttribute, UnitType, TerrainType, UnitPreferenceType, CombatPhase, UnitPreferences, Cohort, UnitRole, CountryDefinitions, ArmyName, ModeState, SettingsAndOptions, Side, Settings, TacticDefinitions, TerrainDefinitions, CohortData } from 'types'
import { doCombatRound, reinforce } from 'combat'
import { removeDefeated } from 'combat/combat_utils'
import { convertSides, getCombatField } from 'state'
import { addToReserve } from 'managers/army'
import { flatten } from 'lodash'
import { createArmy } from 'managers/countries'

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
export const initState = (): TestState => {
  return {
    battle: getDefaultBattle(1),
    settings: getDefaultSettings(),
    countries: getDefaultCountryDefinitions(),
    terrains: getDefaultTerrains(),
    tactics: getDefaultTactics()
  }
}

const getCountryNameTest = (side: SideType) => side === SideType.A ? CountryName.Country1 : CountryName.Country2
const getCountryTest = (state: TestState, side: SideType) => state.countries[getCountryNameTest(side)]

export const getArmyTest = (state: TestState, side: SideType, index: number = 0) => getCountryTest(state, side).armies[getArmyNameTest(index)]

const getArmyNameTest = (index: number) => index === 0 ? ArmyName.Army : ('Test' + index) as ArmyName

export const createArmyTest = (state: TestState, side: SideType) => {
  const country = getCountryTest(state, side)
  const participants = state.battle[Mode.Land].sides[side].participants
  const armyName = getArmyNameTest(participants.length)
  createArmy(country, armyName, Mode.Land)
  participants.push({
    armyName,
    countryName: getCountryNameTest(side),
    daysUntilBattle: 0
  })
}


export const getSettingsTest = (state: TestState) => state.settings.siteSettings

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
    expect(Math.abs(unitMorale - morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error(errorPrefix(identifier, side, index) + 'Morale ' + unitMorale + ' should be ' + morale)
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

export const addToReserveTest = (state: TestState, side: SideType, cohorts: CohortData[], index: number = 0) => addToReserve(getArmyTest(state, side, index), cohorts)

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

type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

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
  doCombatRound(environment, sideA, sideD, true)
  for (let roll = 0; roll < rolls.length; roll++) {
    sideA.results.dice = rolls[roll][0]
    sideD.results.dice = rolls[roll][1]
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doCombatRound(environment, sideA, sideD, true)
      verifySide(round, SideType.A, sideA.cohorts.frontline[0], attacker[round])
      verifySide(round, SideType.B, sideD.cohorts.frontline[0], defender[round])
    }
  }
  return [sideA, sideD]
}
export const testDeployment = (state: TestState, expectedA?: ExpectedTypes, expectedD?: ExpectedTypes) => {
  const [sideA, sideD] = convertSides(state as any)
  const environment = getCombatField(state as any)
  doCombatRound(environment, sideA, sideD, true)
  //console.log(sideA.cohorts.frontline[0].map(c => c ? c.properties.type : ''))
  if (expectedA)
    verifyDeployOrReinforce(environment.settings, SideType.A, sideA, expectedA)
  if (expectedD)
    verifyDeployOrReinforce(environment.settings, SideType.B, sideD, expectedD)
  return [sideA, sideD]
}

export const testReinforcement = (roundsToSkip: number, state: TestState, expectedA?: ExpectedTypes, expectedD?: ExpectedTypes) => {
  const [sideA, sideD] = convertSides(state as any)
  const environment = getCombatField(state as any)
  doCombatRound(environment, sideA, sideD, true)
  sideA.results.dice = 2
  sideD.results.dice = 2
  for (let round = 0; round < roundsToSkip; round++)
    doCombatRound(environment, sideA, sideD, true)
  removeDefeated(sideD.cohorts.frontline)
  removeDefeated(sideD.cohorts.frontline)
  reinforce(environment, sideA)
  reinforce(environment, sideD)
  if (expectedA)
    verifyDeployOrReinforce(environment.settings, SideType.A, sideA, expectedA)
  if (expectedD)
    verifyDeployOrReinforce(environment.settings, SideType.B, sideD, expectedD)
  return [sideA, sideD]
}

const verifyDeployOrReinforce = (settings: Settings, side: SideType, participant: Side, expected: ExpectedTypes) => {
  verifyTypes('Front', settings, expected.front ?? [], side, participant.cohorts.frontline[0])
  verifyTypes('Back', settings, expected.back ?? [], side, participant.cohorts.frontline.length ? participant.cohorts.frontline[1] : [])
  verifyTypes('Reserve front', settings, expected.reserveFront ?? [], side, participant.cohorts.reserve.front)
  verifyTypes('Reserve flank', settings, expected.reserveFlank ?? [], side, participant.cohorts.reserve.flank)
  verifyTypes('Reserve support', settings, expected.reserveSupport ?? [], side, participant.cohorts.reserve.support)
  verifyTypes('Defeated', settings, expected.defeated ?? [], side, participant.cohorts.defeated)
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyTypes = (identifier: string, settings: Settings, types: (UnitType | null)[], side: SideType, cohorts: (Cohort | null)[]) => {
  const isFront = identifier === 'Front' || identifier === 'Back'
  if (!isFront) {
    try {
      expect(cohorts.length).toEqual(types.length)
    }
    catch (e) {
      throw new Error(side + ' ' + identifier + ' length ' + cohorts.length + ' should be ' + types.length + '.')
    }
  }
  const half = Math.floor(settings[Setting.CombatWidth] / 2.0)
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
export const initExpected = (...rounds: number[]) => {
  const expected = () => mapRange(rounds[rounds.length - 1] + 1, round => rounds.includes(round) ? initFrontline() : null as any)
  return {
    attacker: expected(),
    defender: expected()
  }
}

/**
 * Returns empty values for one round.
 */
const initFrontline = (): ExpectedUnits[] => (
  [null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null]
)

export const createExpected = (...types: ([UnitType | null, number] | UnitType)[]) => types.reduce((prev, current) => prev.concat(Array.isArray(current) ? Array(current[1]).fill(current[0]) : [current]), [] as UnitType[])
