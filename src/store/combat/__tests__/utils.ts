import { Army, Participant, RowType, Side, getDefaultParticipant, getDefaultArmy } from '../../battle'
import { TacticType, getDefaultTactics } from '../../tactics'
import { BaseUnit, UnitCalc, UnitType, getDefaultUnits, getDefaultGlobals } from '../../units'
import { calculateValue, mergeValues, DefinitionType } from '../../../base_definition'
import { map, mapRange } from '../../../utils'
import { CountryName } from '../../countries'
import { doBattle } from '../combat'
import { getDefaultLandSettings, CombatParameter } from '../../settings'
import { TerrainDefinition, TerrainType, getDefaultTerrains } from '../../terrains'

const global_stats = getDefaultGlobals()[DefinitionType.Land]
const units = map(getDefaultUnits(), unit => mergeValues(unit, global_stats))
export const getDefinitions = () => ({ [CountryName.Country1]: units, [CountryName.Country2]: units })
const definitions = getDefinitions()
const tactics = getDefaultTactics()
const terrains = getDefaultTerrains()

export interface TestInfo {
  attacker: Participant
  defender: Participant
  army_a: Army
  army_d: Army
  round: number
  terrains: TerrainDefinition[]
  settings: { [key in CombatParameter]: number }
}

export const initInfo = () => ({
  attacker: getDefaultParticipant(CountryName.Country1),
  defender: getDefaultParticipant(CountryName.Country2),
  army_a: { ...getDefaultArmy(DefinitionType.Land), tactic: TacticType.Envelopment, row_types: getRowTypes() },
  army_d: { ...getDefaultArmy(DefinitionType.Land), tactic: TacticType.Envelopment, row_types: getRowTypes() },
  round: 0,
  terrains: [],
  settings:  getDefaultLandSettings()
})

const verify = (round: number, side: Side, index: number, unit: BaseUnit | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  try {
    expect(Math.floor(1000 * calculateValue(unit, UnitCalc.Strength))).toEqual(strength)
  }
  catch (e) {
    throw new Error('Round ' + round + ', ' + side + ' ' + index + ': Strength ' + 1000 * calculateValue(unit, UnitCalc.Strength) + ' is not ' + strength);
  }
  try {
    expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error('Round ' + round + ', ' + side + ' ' + index + ': Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + 2 * morale);
  }
}

export const verifyType = (unit: BaseUnit | null, type: UnitType | null, message: string = '') => {
  if (type) {
    expect(unit).toBeTruthy()
    expect(unit!.type + message).toEqual(type + message)
  }
  else
    expect(unit).toBeFalsy()
}
export const setRolls = (info: TestInfo, roll_a: number, roll_d: number) => {
  info.attacker = { ...info.attacker, roll: roll_a }
  info.defender = { ...info.defender, roll: roll_d }
}
export const setTactics = (info: TestInfo, tactic_a: TacticType, tactic_d: TacticType) => {
  info.army_a = { ...info.army_a, tactic: tactic_a }
  info.army_d = { ...info.army_d, tactic: tactic_d }
}
export const setCenterUnits = (info: TestInfo, unit_a: BaseUnit, unit_d: BaseUnit) => {
  info.army_a = { ...info.army_a, frontline: [...info.army_a.frontline] }
  info.army_d = { ...info.army_d, frontline: [...info.army_d.frontline] }
  info.army_a.frontline[15] = unit_a
  info.army_d.frontline[15] = unit_d
}
export const setFlankSizes = (info: TestInfo, flank_a: number, flank_d: number) => {
  info.army_a = { ...info.army_a, flank_size: flank_a }
  info.army_d = { ...info.army_d, flank_size: flank_d }
}

export const setTerrain = (info: TestInfo, terrain: TerrainType) => {
  info.terrains = []
  info.terrains.push(terrains[terrain])
}

describe('utils', () => {
  it('works', () => { })
})

export const getRowTypes = (front: UnitType | null = null, back: UnitType | null = null, flank: UnitType | null = null) => ({ [RowType.Front]: front, [RowType.Back]: back, [RowType.Flank]: flank })

export const getUnit = (type: UnitType) => ({ ...units[type] } as any as BaseUnit)

export const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]

const doRound = (info: TestInfo) => {
  info.round = info.round + 1
  const [a, d] = doBattle(definitions, { ...info.attacker, ...info.army_a, tactic: tactics[info.army_a.tactic], country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics[info.army_d.tactic], country: CountryName.Country2, general: 0 }, info.round, info.terrains, info.settings)
  info.army_a = { ...info.army_a, ...a }
  info.army_d = { ...info.army_d, ...d }
}

type ExpectedUnits = ([UnitType | null, number | null, number | null] | null)
type Expected = (ExpectedUnits[] | null)

export const testCombat = (info: TestInfo, rolls: number[][], attacker: Expected[], defender: Expected[]) => {
  for (let roll = 0; roll < rolls.length; roll++) {
    setRolls(info, rolls[roll][0], rolls[roll][1])
    const limit = Math.min((roll + 1) * 5, attacker.length)
    for (let round = roll * 5; round < limit; round++) {
      doRound(info)
      verifySide(round, Side.Attacker, info.army_a.frontline, attacker)
      verifySide(round, Side.Defender, info.army_d.frontline, defender)
    }
  }
}

const verifySide = (round: number, side: Side, frontline: (BaseUnit | null)[], expected: Expected[]) => {
  const units = expected[round]
  // Data might be missing.
  if (!units)
    return
  for (let index = 0; index < units.length; index++) {
    const unit = units[index]
    if (unit) {
      const type = unit[0]
      verifyType(frontline[index], type)
      if (unit[1] !== null && unit[2] !== null)
        verify(round, side, index, frontline[index], unit[1], unit[2])
    }
    else
      verifyType(frontline[index], null)
  }
}

export const initSide = (rounds: number) => (
  mapRange(rounds, initFrontline)
)

const initFrontline = (): ExpectedUnits[] => (
  [null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, null, null]
)
