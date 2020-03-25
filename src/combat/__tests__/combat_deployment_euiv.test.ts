import { TestInfo, initInfo, getUnit, testDeployment, createExpected, setCombatWidth } from './utils'
import { UnitType, Setting, unitValueToString } from 'types'

import { ArmyForCombat } from 'state'
import { mapRange } from 'utils'

if (process.env.REACT_APP_GAME === 'euiv') {

  describe('initial deployment', () => {

    let info: TestInfo
    beforeEach(() => { info = initInfo() })

    const add = (army: ArmyForCombat, infantry: number, cavalry: number, artillery: number) => {
      army.reserve.push(...mapRange(infantry, () => getUnit(UnitType.Infantry)))
      army.reserve.push(...mapRange(cavalry, () => getUnit(UnitType.Cavalry)))
      army.reserve.push(...mapRange(artillery, () => getUnit(UnitType.Artillery)))
    }

    it('more cavalry than flank size (+ backrow flank)', () => {
      setCombatWidth(info, 22)
      add(info.army_a, 26, 0, 0)
      add(info.army_d, 14, 16, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 22]),
        back: createExpected([UnitType.Infantry, 4])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 12], [UnitType.Cavalry, 10]),
        back: createExpected([UnitType.Infantry, 2], [null, 10], [UnitType.Cavalry, 6])
      }
      testDeployment(info, attacker, defender)
    })

    it('less cavalry than flank size', () => {
      setCombatWidth(info, 22)
      add(info.army_a, 22, 0, 0)
      add(info.army_d, 22, 2, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 22])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 20], [UnitType.Cavalry, 2]),
        back: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(info, attacker, defender)
    })
  })
}

export default null
