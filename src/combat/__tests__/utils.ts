import { getDefaultUnits, getDefaultTactics, getDefaultTerrains, getDefaultLandSettings, getDefaultSiteSettings, getDefaultParticipant, getDefaultArmy, getDefaultUnit, getDefaultSide } from 'data'
import { map, mapRange, resize, toObj, values } from 'utils'
import { mergeValues } from 'definition_values'
import { Mode, CountryName, Participant, Terrain, TacticType, Setting, SideType, UnitAttribute, UnitType, TerrainType, UnitPreferenceType, Settings, CohortDefinition, CombatPhase, CultureType, GeneralDefinition, GeneralAttribute, UnitPreferences, ArmyForCombatConversion, Cohort, Army, UnitRole, DisciplineValue, Selections, SideData } from 'types'
import { doBattle, deploy, reinforce } from 'combat'
import { convertArmy } from 'managers/battle'
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
  sideA: SideData
  sideD: SideData
  armyA: ArmyForCombatConversion
  armyD: ArmyForCombatConversion
  terrains: Terrain[]
  settings: Settings
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
 * Returns a clean combat state for tests.
 */
export const initInfo = (singleRow: boolean = true) => {
  const settings = { ...getDefaultLandSettings(), ...getDefaultSiteSettings(), [Setting.Precision]: 100000 }
  const general = (): GeneralDefinition => ({
    enabled: true,
    selections: {} as Selections,
    baseValues: {} as any,
    extraValues: {} as any,
    values: {
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
    frontline: singleRow ?  [Array(30).fill(null)] : [Array(30).fill(null), Array(30).fill(null)],
    reserve: [],
    defeated: [],
    unitPreferences: getUnitPreferences(),
    definitions: toObj(everyType, type => type, type => ({ type })) as any,
    general: general(),
    flankRatio: 0,
    flankSize: 5,
    tactic: tactics[TacticType.Envelopment]
  })
  return {
    attacker: getDefaultParticipant(CountryName.Country1, Mode.Land),
    defender: getDefaultParticipant(CountryName.Country2, Mode.Land),
    sideA: getDefaultSide(SideType.Attacker, CountryName.Country1, Mode.Land),
    sideD: getDefaultSide(SideType.Defender, CountryName.Country1, Mode.Land),
    armyA: army(),
    armyD: army(),
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
/**
 * Sets rolls for combat.
 */
export const setRolls = (info: TestInfo, rollA: number, rollD: number) => {
  info.sideA = { ...info.sideA, dice: rollA }
  info.sideD = { ...info.sideD, dice: rollD }
}
/**
 * Sets tactics for combat.
 */
export const setTactics = (info: TestInfo, tacticA: TacticType, tacticD: TacticType) => {
  info.armyA = { ...info.armyA, tactic: tactics[tacticA] }
  info.armyD = { ...info.armyD, tactic: tactics[tacticD] }
}
/**
 * Sets center units (useful for 1v1 tests).
 */
export const setCenterUnits = (info: TestInfo, unitA: CohortDefinition, unitD: CohortDefinition) => {
  info.armyA.frontline[0][15] = unitA
  info.armyD.frontline[0][15] = unitD
}
/**
 * Sets an attacker unit (useful for more complex tests).
 */
export const setAttacker = (info: TestInfo, index: number, unit: CohortDefinition) => {
  info.armyA.frontline[0][index] = unit
}
/**
 * Sets a defender unit (useful for more complex tests).
 */
export const setDefender = (info: TestInfo, index: number, unit: CohortDefinition) => {
  info.armyD.frontline[0][index] = unit
}
/**
 * Sets flank sizes for deployment.
 */
export const setFlankSizes = (info: TestInfo, flankA: number, flankD: number) => {
  info.armyA = { ...info.armyA, flankSize: flankA }
  info.armyD = { ...info.armyD, flankSize: flankD }
}
/**
 * Sets general martial.
 */
export const setGeneral = (info: TestInfo, generalA: number, generalD: number) => {
  info.armyA.general.values[GeneralAttribute.Martial] = generalA
  info.armyD.general.values[GeneralAttribute.Martial] = generalD
}
/**
 * Sets flank sizes for combat.
 */
export const setTerrain = (info: TestInfo, terrain: TerrainType) => {
  info.terrains = []
  info.terrains.push(terrains[terrain])
}

export const setReserve = (info: TestInfo, attacker: UnitType[], defender: UnitType[]) => {
  info.armyA.reserve = info.armyA.reserve.concat(attacker.map(type => getUnit(type)))
  info.armyD.reserve = info.armyD.reserve.concat(defender.map(type => getUnit(type)))
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

  info.armyA = { ...info.armyA, unitPreferences: { [UnitPreferenceType.Primary]: attacker[0], [UnitPreferenceType.Secondary]: attacker[1], [UnitPreferenceType.Flank]: attacker[2] } as UnitPreferences }
  info.armyD = { ...info.armyD, unitPreferences: { [UnitPreferenceType.Primary]: defender[0], [UnitPreferenceType.Secondary]: defender[1], [UnitPreferenceType.Flank]: defender[2] } as UnitPreferences }
}

export const setCombatWidth = (info: TestInfo, value: number) => {
  info.settings[Setting.CombatWidth] = value
  info.armyA.frontline = info.armyA.frontline.map(row => resize(row, value, null))
  info.armyD.frontline = info.armyD.frontline.map(row => resize(row, value, null))
}

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
const doRound = (info: TestInfo, a: Army, d: Army) => {
  doBattle(a, d, true, info.settings, info.round++)
}


type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

const getParticipants = (info: TestInfo) => {
  const participantA = convertArmy(SideType.Attacker, info.armyA, info.armyD, info.terrains, info.settings)
  const participantD = convertArmy(SideType.Defender, info.armyD, info.armyA, info.terrains, info.settings)
  return [participantA, participantD]
}

/**
 * Tester function for combat.
 * @param info Initial combat state.
 * @param rolls List of rolls.
 * @param attacker Expected attacker units for every round. Nulls can be used to skip checks.
 * @param defender Expected defender units for every round. Nulls can be used to skip checks.
 */
export const testCombat = (info: TestInfo, rolls: number[][], attacker: Expected[], defender: Expected[]) => {
  const [participantA, participantD] = getParticipants(info)
  for (let roll = 0; roll < rolls.length; roll++) {
    participantA.dice = rolls[roll][0]
    participantD.dice = rolls[roll][1]
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doRound(info, participantA, participantD)
      verifySide(round, SideType.Attacker, participantA.cohorts.frontline[0], attacker[round])
      verifySide(round, SideType.Defender, participantD.cohorts.frontline[0], defender[round])
    }
  }
  return [participantA, participantD]
}
export const testDeployment = (info: TestInfo, expectedA?: ExpectedTypes, expectedD?: ExpectedTypes) => {
  const [participantA, participantD] = getParticipants(info)
  deploy(participantA, participantD, info.settings)
  if (expectedA)
    verifyDeployOrReinforce(info, SideType.Attacker, participantA, expectedA)
  if (expectedD)
    verifyDeployOrReinforce(info, SideType.Defender, participantD, expectedD)
  return [participantA, participantD]
}

export const testReinforcement = (roundsToSkip: number, info: TestInfo, expectedA?: ExpectedTypes, expectedD?: ExpectedTypes) => {
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

const verifyDeployOrReinforce = (info: TestInfo, side: SideType, participant: Army, expected: ExpectedTypes) => {
  verifyTypes('Front', info, expected.front ?? [], side, participant.cohorts.frontline[0])
  verifyTypes('Back', info, expected.back ?? [], side, participant.cohorts.frontline.length ? participant.cohorts.frontline[1] : [])
  verifyTypes('Reserve front', info, expected.reserveFront ?? [], side, participant.cohorts.reserve.front)
  verifyTypes('Reserve flank', info, expected.reserveFlank ?? [], side, participant.cohorts.reserve.flank)
  verifyTypes('Reserve support', info, expected.reserveSupport ?? [], side, participant.cohorts.reserve.support)
  verifyTypes('Defeated', info, expected.defeated ?? [], side, participant.cohorts.defeated)
}

const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

const verifyTypes = (identifier: string, info: TestInfo, types: (UnitType | null)[], side: SideType, cohorts: (Cohort | null)[]) => {
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
