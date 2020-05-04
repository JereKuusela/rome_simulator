import { TestInfo, initInfo, getUnit, testDeployment, createExpected, setCombatWidth } from './utils'
import { UnitType, ArmyForCombatConversion} from 'types'

import { mapRange } from 'utils'

if (process.env.REACT_APP_GAME === 'euiv') {

  describe('initial deployment', () => {

    let info: TestInfo
    beforeEach(() => { info = initInfo(false) })

    const add = (army: ArmyForCombatConversion, infantry: number, cavalry: number, artillery: number) => {
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
    it('combat width not filled', () => {
      setCombatWidth(info, 22)
      add(info.army_a, 2, 3, 0)
      add(info.army_d, 1, 0, 0)
      const attacker = {
        front: createExpected(UnitType.Infantry, [UnitType.Cavalry, 3]),
        back: createExpected([UnitType.Infantry, 1])
      }
      const defender = {
        front: createExpected(UnitType.Infantry)
      }
      testDeployment(info, attacker, defender)
    })
    it('artillery fills backline (both front and flank)', () => {
      setCombatWidth(info, 24)
      add(info.army_a, 6, 6, 6)
      add(info.army_d, 2, 0, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 2], [UnitType.Cavalry, 6], [UnitType.Infantry, 4]),
        back: createExpected([UnitType.Artillery, 6])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(info, attacker, defender)
    })
    it('artillery backline doesn\'t exceend frontline', () => {
      setCombatWidth(info, 24)
      add(info.army_a, 6, 0, 12)
      add(info.army_d, 2, 0, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 6], [UnitType.Artillery, 3]),
        back: createExpected([UnitType.Artillery, 9])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(info, attacker, defender)
    })
    it('infantry only', () => {
      setCombatWidth(info, 24)
      add(info.army_a, 6, 0, 0)
      add(info.army_d, 2, 0, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 6])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(info, attacker, defender)
    })
  })
}

export default null
