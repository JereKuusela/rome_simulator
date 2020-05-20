import { TestState, initState, getUnit, testDeployment, createExpected, getSettingsTest, addToReserveTest } from './utils'
import { UnitType, SideType, Setting} from 'types'

import { mapRange } from 'utils'
import { addToReserve } from 'managers/army'

if (process.env.REACT_APP_GAME === 'euiv') {

  describe('initial deployment', () => {

    let state: TestState
    beforeEach(() => { state = initState(false) })

    const add = (side: SideType, infantry: number, cavalry: number, artillery: number) => {
      addToReserveTest(state, side, mapRange(infantry, () => getUnit(UnitType.Infantry)))
      addToReserveTest(state, side, mapRange(cavalry, () => getUnit(UnitType.Cavalry)))
      addToReserveTest(state, side, mapRange(artillery, () => getUnit(UnitType.Artillery)))
    }

    it('more cavalry than flank size (+ backrow flank)', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 22
      add(SideType.Attacker, 26, 0, 0)
      add(SideType.Defender, 14, 16, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 22]),
        back: createExpected([UnitType.Infantry, 4])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 12], [UnitType.Cavalry, 10]),
        back: createExpected([UnitType.Infantry, 2], [null, 10], [UnitType.Cavalry, 6])
      }
      testDeployment(state, attacker, defender)
    })
    it('less cavalry than flank size', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 22
      add(SideType.Attacker, 22, 0, 0)
      add(SideType.Defender, 22, 2, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 22])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 20], [UnitType.Cavalry, 2]),
        back: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(state, attacker, defender)
    })
    it('combat width not filled', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 22
      add(SideType.Attacker, 2, 3, 0)
      add(SideType.Defender, 1, 0, 0)
      const attacker = {
        front: createExpected(UnitType.Infantry, [UnitType.Cavalry, 3]),
        back: createExpected([UnitType.Infantry, 1])
      }
      const defender = {
        front: createExpected(UnitType.Infantry)
      }
      testDeployment(state, attacker, defender)
    })
    it('artillery fills backline (both front and flank)', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 24
      add(SideType.Attacker, 6, 6, 6)
      add(SideType.Defender, 2, 0, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 2], [UnitType.Cavalry, 6], [UnitType.Infantry, 4]),
        back: createExpected([UnitType.Artillery, 6])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(state, attacker, defender)
    })
    it('artillery backline doesn\'t exceend frontline', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 24
      add(SideType.Attacker, 6, 0, 12)
      add(SideType.Defender, 2, 0, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 6], [UnitType.Artillery, 3]),
        back: createExpected([UnitType.Artillery, 9])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(state, attacker, defender)
    })
    it('infantry only', () => {
      getSettingsTest(state)[Setting.CombatWidth] = 24
      add(SideType.Attacker, 6, 0, 0)
      add(SideType.Defender, 2, 0, 0)
      const attacker = {
        front: createExpected([UnitType.Infantry, 6])
      }
      const defender = {
        front: createExpected([UnitType.Infantry, 2])
      }
      testDeployment(state, attacker, defender)
    })
  })
}

export default null
