import { Army, Participant } from '../../battle'
import { TacticType } from '../../tactics'
import { BaseUnit, UnitCalc, UnitType } from '../../units'
import { calculateValue } from '../../../base_definition'

export interface TestInfo {
  army_a: Army
  army_d: Army,
  attacker: Participant,
  defender: Participant,
  round: number
}

const verifySub = (round: number, unit: BaseUnit | undefined, strength: number, morale: number) => {
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
  verifySub(info.round, info.army_a.frontline.get(15), manpower_a, morale_a)
  verifySub(info.round, info.army_d.frontline.get(15), manpower_d, morale_d)
}
export const verifyType = (unit: BaseUnit | undefined, type: UnitType, message: string = '') => {
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
export const setCenterUnits = (info: TestInfo, unit_a: BaseUnit, unit_b: BaseUnit) => {
  info.army_a = { ...info.army_a, frontline: info.army_a.frontline.set(15, unit_a) }
  info.army_d = { ...info.army_d, frontline: info.army_d.frontline.set(15, unit_b) }
}

describe('utils', () => {
  it('works', () => { })
})

