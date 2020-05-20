import { TestState, initState, getUnit, testDeployment, createExpected, getSettingsTest, addToReserveTest, getArmyTest } from './utils'
import { UnitType, Setting, SideType } from 'types'
import { loadInput } from './parser'

import allLandFront from './input/deployment/all_land_front.txt'
import flanksizeSmallFlank from './input/deployment/flanksize_small_flank.txt'
import flanksizeBigFlank from './input/deployment/flanksize_big_flank.txt'
import frontOnly from './input/deployment/front_only.txt'
import flankOnly from './input/deployment/flank_only.txt'
import supportOnly from './input/deployment/support_only.txt'
import flankOutnumbered from './input/deployment/flank_outnumbered.txt'
import unitPreferences from './input/deployment/unit_preferences.txt'
import unitPreferencesOrder from './input/deployment/unit_preferences_order.txt'
import { setFlankSize } from 'managers/army'

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('initial deployment', () => {

    let state: TestState
    beforeEach(() => { state = initState() })

    it('deploys all land units with default order except support', () => {
      loadInput(allLandFront, state)
      const attacker = {
        front: createExpected([UnitType.Archers, 30])
      }
      const defender = {
        front: createExpected(UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry),
        reserveSupport: createExpected(UnitType.SupplyTrain)
      }
      testDeployment(state, attacker, defender)
    })
    it('can deploy front units on flank', () => {
      loadInput(frontOnly, state)
      const attacker = {
        front: createExpected([UnitType.Archers, 5])
      }
      const defender = {
        front: createExpected(UnitType.Archers)
      }
      testDeployment(state, attacker, defender)
    })
    it('can deploy flank units on front', () => {
      loadInput(flankOnly, state)
      const attacker = {
        front: createExpected([UnitType.HorseArchers, 5])
      }
      const defender = {
        front: createExpected(UnitType.Archers)
      }
      testDeployment(state, attacker, defender)
    })
    it('deploys support if nothing else is available', () => {
      loadInput(supportOnly, state)
      const attacker = {
        front: createExpected([UnitType.SupplyTrain, 5])
      }
      const defender = {
        front: createExpected(UnitType.Archers)
      }
      testDeployment(state, attacker, defender)
    })
    it('deploys flank correctly when outnumbering the enemy, dynamic', () => {
      loadInput(flankOutnumbered, state)
      getSettingsTest(state)[Setting.DynamicFlanking] = true
      const attacker = {
        front: createExpected([UnitType.Archers, 10], [UnitType.HorseArchers, 10], [UnitType.Archers, 10])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 10])
      }
      testDeployment(state, attacker, defender)
    })
    it('deploys flank correctly when outnumbering the enemy, static', () => {
      loadInput(flankOutnumbered, state)
      getSettingsTest(state)[Setting.DynamicFlanking] = false
      const attacker = {
        front: createExpected([UnitType.Archers, 20], [UnitType.HorseArchers, 10])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 10])
      }
      testDeployment(state, attacker, defender)
    })
    it('deploys front correctly with preferennces', () => {
      loadInput(unitPreferences, state)
      const attacker = {
        front: createExpected(UnitType.SupplyTrain, UnitType.HorseArchers, UnitType.WarElephants, UnitType.Chariots, UnitType.LightCavalry)
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(state, attacker, defender)
    })
    it('deploys front correctly when all preferences have the same unit', () => {
      loadInput(unitPreferencesOrder, state)
      const attacker = {
        front: createExpected(UnitType.SupplyTrain, UnitType.WarElephants, UnitType.Chariots, UnitType.HorseArchers, UnitType.LightCavalry)
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(state, attacker, defender)
    })
    it('flank size, enough flanking units', () => {
      loadInput(flanksizeSmallFlank, state)
      const attacker = {
        front: createExpected([UnitType.Archers, 26], [UnitType.HorseArchers, 4]),
        reserveFront: createExpected([UnitType.Archers, 4]),
        reserveFlank: createExpected(UnitType.HorseArchers)
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(state, attacker, defender)
    })
    it('flank size, not enough flanking units', () => {
      loadInput(flanksizeBigFlank, state)
      const attacker = {
        front: createExpected([UnitType.Archers, 20], [UnitType.HorseArchers, 5], [UnitType.Archers, 5]),
        reserveFront: createExpected([UnitType.Archers, 5])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(state, attacker, defender)
    })
    it('reduced combat width', () => {
      const width = 5
      getSettingsTest(state)[Setting.CombatWidth] = width
      setFlankSize(getArmyTest(state, SideType.Attacker), 2)
      setFlankSize(getArmyTest(state, SideType.Defender), 0)

      addToReserveTest(state, SideType.Attacker, [UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers].map(type => getUnit(type)))
      addToReserveTest(state, SideType.Attacker, Array(width).fill(UnitType.Archers).map(type => getUnit(type)))
      addToReserveTest(state, SideType.Defender, Array(width).fill(UnitType.Archers).map(type => getUnit(type)))

      const attacker = {
        front: createExpected(UnitType.Archers, [UnitType.HorseArchers, 3], UnitType.Archers),
        reserveFront: createExpected([UnitType.Archers, 3])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 5])
      }
      testDeployment(state, attacker, defender)
    })
  })
}

export default null
