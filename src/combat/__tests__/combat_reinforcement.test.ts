import { TestState, initState, testReinforcement, createExpected, getSettingsTest } from './utils'
import { UnitType, Setting } from 'types'

import unitPreferences from './input/reinforcement/unit_preferences.txt'
import supportLateReinforcement from './input/reinforcement/support_late_reinforcement.txt'
import preferredFlankSize from './input/reinforcement/preferred_flank_size.txt'
import flankOnly from './input/reinforcement/flank_only.txt'
import { loadInput } from './parser'

if (process.env.REACT_APP_GAME === 'IR') {
  describe('reinforcement', () => {
    let state: TestState
    beforeEach(() => {
      state = initState()
    })

    it('unit preferences', () => {
      loadInput(unitPreferences, state)
      const attacker = {
        front: createExpected([UnitType.LightInfantry, 30])
      }
      const defender = {
        front: createExpected(UnitType.SupplyTrain, UnitType.Archers),
        defeated: createExpected([UnitType.SupplyTrain, 30])
      }
      testReinforcement(2, state, attacker, defender)
    })

    it('support units only when nothing else is left', () => {
      loadInput(supportLateReinforcement, state)
      const attacker = {
        front: createExpected([UnitType.HeavyCavalry, 30])
      }
      const defender = {
        front: createExpected(UnitType.SupplyTrain),
        defeated: createExpected([UnitType.Archers, 31])
      }
      testReinforcement(4, state, attacker, defender)
    })

    it('preferred flank size', () => {
      loadInput(preferredFlankSize, state)
      // Tweak to defeat whole enemy line during the same turn.
      getSettingsTest(state)[Setting.MaxPips] = 20
      const attacker = {
        front: createExpected([UnitType.HeavyCavalry, 30])
      }
      const defender = {
        front: createExpected([UnitType.HeavyCavalry, 26], [UnitType.LightCavalry, 4]),
        reserveFront: createExpected([UnitType.HeavyCavalry, 8]),
        reserveFlank: createExpected([UnitType.LightCavalry, 52]),
        defeated: createExpected([UnitType.LightCavalry, 2], [UnitType.HeavyCavalry, 26], [UnitType.LightCavalry, 2])
      }
      testReinforcement(4, state, attacker, defender)
    })

    it('frontline is reinforced first', () => {
      loadInput(flankOnly, state)
      // Tweak to defeat whole enemy line during the same turn.
      getSettingsTest(state)[Setting.MaxPips] = 20
      const attacker = {
        front: createExpected([UnitType.HeavyCavalry, 30])
      }
      const defender = {
        front: createExpected([UnitType.LightCavalry, 10]),
        defeated: createExpected([UnitType.LightCavalry, 5], [UnitType.HeavyCavalry, 20], [UnitType.LightCavalry, 5])
      }
      testReinforcement(4, state, attacker, defender)
    })
  })
}

export default null
