import { Army, Participant, RowType } from '../../battle'
import { TacticType } from '../../tactics'
import { BaseUnit, UnitCalc, UnitType, getDefaultUnits, getDefaultGlobals } from '../../units'
import { calculateValue, mergeValues, DefinitionType } from '../../../base_definition'
import { map } from '../../../utils'
import { CountryName } from '../../countries'

export interface TestInfo {
  army_a: Army
  army_d: Army,
  attacker: Participant,
  defender: Participant,
  round: number
}

const verifySub = (round: number, unit: BaseUnit | null, strength: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  try {
    expect(Math.floor(1000 * calculateValue(unit, UnitCalc.Strength))).toEqual(strength)
  }
  catch (e) {
    throw new Error('Round ' + round + ': Strength ' + 1000 * calculateValue(unit, UnitCalc.Strength) + ' is not ' + strength);
  }
  try {
    expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - 2 * morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error('Round ' + round + ': Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + 2 * morale);
  }
}
export const verifyCenterUnits = (info: TestInfo, manpower_a: number, morale_a: number, manpower_d: number, morale_d: number) => {
  verifySub(info.round, info.army_a.frontline[15], manpower_a, morale_a)
  verifySub(info.round, info.army_d.frontline[15], manpower_d, morale_d)
}
export const verifyType = (unit: BaseUnit | null, type: UnitType, message: string = '') => {
  expect(unit).toBeTruthy()
  expect(unit!.type + message).toEqual(type + message)
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
  info.army_a = { ...info.army_a, frontline: [ ...info.army_a.frontline ] }
  info.army_d = { ...info.army_d, frontline: [ ...info.army_d.frontline ] }
  info.army_a.frontline[15] = unit_a
  info.army_d.frontline[15] = unit_d
}
export const setFlankSizes = (info: TestInfo, flank_a: number, flank_d: number) => {
  info.army_a = { ...info.army_a, flank_size: flank_a }
  info.army_d = { ...info.army_d, flank_size: flank_d }
}

describe('utils', () => {
  it('works', () => { })
})

export const getRowTypes = (front: UnitType | null = null, back: UnitType | null = null, flank: UnitType | null = null) => ({ [RowType.Front]: front, [RowType.Back]: back, [RowType.Flank]: flank })

const global_stats = getDefaultGlobals()[DefinitionType.Land]
const units = map(getDefaultUnits(), unit => mergeValues(unit, global_stats))
export const getDefinitions = () => ({ [CountryName.Country1]: units, [CountryName.Country2]: units })

export const getUnit = (type: UnitType) => ({ ...units[type] } as any as BaseUnit)

export const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]
