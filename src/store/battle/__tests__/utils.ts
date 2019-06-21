import { List, Map } from 'immutable'
import { Participant } from '../../land_battle'
import { TacticType } from '../../tactics'
import { Unit, UnitCalc, UnitDefinition, UnitType } from '../../units'
import { calculateValue,} from '../../../base_definition'

export interface TestInfo {
  attacker: Participant
  defender: Participant
}

const verifySub = (unit: Unit | undefined, manpower: number, morale: number) => {
  expect(unit).toBeTruthy()
  if (!unit)
    return
  expect(calculateValue(unit, UnitCalc.Manpower)).toEqual(manpower)
  try {
    expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - morale)).toBeLessThan(0.002)
  }
  catch (e) {
    throw new Error('Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + morale);
  }
}
export const verifyCenterUnits = (info: TestInfo, manpower_a: number, morale_a: number, manpower_d: number, morale_d: number) => {
  verifySub(info.attacker.frontline.get(15), manpower_a, morale_a)
  verifySub(info.defender.frontline.get(15), manpower_d, morale_d)
}
export const verifyType = (unit: Unit | undefined, type: UnitType, message: string = '') => {
  expect(unit).toBeTruthy()
  expect(unit!.type + message).toEqual(type + message)
}
export const setRolls = (info: TestInfo, roll_a: number, roll_d: number) => {
  info.attacker = { ...info.attacker, roll: roll_a }
  info.defender = { ...info.defender, roll: roll_d }
}
export const setTactics = (info: TestInfo, tactic_a: TacticType, tactic_d: TacticType) => {
  info.attacker = { ...info.attacker, tactic: tactic_a }
  info.defender = { ...info.defender, tactic: tactic_d }
}
export const setCenterUnits = (info: TestInfo, unit_a: UnitDefinition, unit_b: UnitDefinition)=> {
  info.attacker = { ...info.attacker, frontline: info.attacker.frontline.set(15, unit_a) }
  info.defender = { ...info.defender, frontline: info.defender.frontline.set(15, unit_b) }
}

describe('utils', () => {
  it('works', () => {})
})
