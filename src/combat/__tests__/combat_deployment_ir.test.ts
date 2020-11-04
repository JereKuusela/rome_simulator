import {
  TestState,
  initState,
  getUnit,
  testDeployment,
  createExpected,
  getSettingsTest,
  addToReserveTest,
  getArmyTest,
  createArmyTest,
  initExpected,
  testCombatWithDefaultRolls
} from './utils'
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
import multiArmy from './input/deployment/multi_army.txt'
import multiArmyPooling from './input/deployment/multi_army_pooling.txt'
import { setFlankSize } from 'managers/army'

if (process.env.REACT_APP_GAME === 'IR') {
  describe('initial deployment', () => {
    let state: TestState
    beforeEach(() => {
      state = initState()
    })

    it('deploys all land units with default order except support', () => {
      loadInput(allLandFront, state)
      const attacker = {
        front: createExpected([UnitType.Archers, 30])
      }
      const defender = {
        front: createExpected(
          UnitType.WarElephants,
          UnitType.HeavyCavalry,
          UnitType.HeavyInfantry,
          UnitType.Archers,
          UnitType.LightInfantry,
          UnitType.Chariots,
          UnitType.HorseArchers,
          UnitType.CamelCavalry,
          UnitType.LightCavalry
        ),
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
        front: createExpected(
          UnitType.SupplyTrain,
          UnitType.HorseArchers,
          UnitType.WarElephants,
          UnitType.Chariots,
          UnitType.LightCavalry
        )
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(state, attacker, defender)
    })
    it('deploys front correctly when all preferences have the same unit', () => {
      loadInput(unitPreferencesOrder, state)
      const attacker = {
        front: createExpected(
          UnitType.SupplyTrain,
          UnitType.WarElephants,
          UnitType.Chariots,
          UnitType.HorseArchers,
          UnitType.LightCavalry
        )
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
      getSettingsTest(state)[Setting.BaseCombatWidth] = width
      setFlankSize(getArmyTest(state, SideType.A), 2)
      setFlankSize(getArmyTest(state, SideType.B), 0)

      addToReserveTest(
        state,
        SideType.A,
        [UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers].map(type => getUnit(type))
      )
      addToReserveTest(
        state,
        SideType.A,
        Array(width)
          .fill(UnitType.Archers)
          .map(type => getUnit(type))
      )
      addToReserveTest(
        state,
        SideType.B,
        Array(width)
          .fill(UnitType.Archers)
          .map(type => getUnit(type))
      )

      const attacker = {
        front: createExpected(UnitType.Archers, [UnitType.HorseArchers, 3], UnitType.Archers),
        reserveFront: createExpected([UnitType.Archers, 3])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 5])
      }
      testDeployment(state, attacker, defender)
    })
    it('multiple armies with different preferences', () => {
      loadInput(multiArmy, state)
      const expected = {
        front: createExpected(
          [UnitType.Archers, 10],
          [UnitType.HeavyInfantry, 10],
          [UnitType.HorseArchers, 5],
          [UnitType.HeavyInfantry, 1],
          [UnitType.HorseArchers, 4]
        ),
        reserveFront: createExpected([UnitType.HeavyInfantry, 4]),
        reserveFlank: createExpected([UnitType.HorseArchers, 1])
      }
      testDeployment(state, expected, expected)
    })
    it('multiple armies with pooling', () => {
      loadInput(multiArmyPooling, state)
      const expected = {
        front: createExpected([UnitType.Archers, 20], [UnitType.HorseArchers, 10]),
        reserveFront: createExpected([UnitType.HorseArchers, 30]),
        reserveFlank: createExpected([UnitType.Archers, 20])
      }
      testDeployment(state, expected, expected)
    })
    it('late deployment penalty', () => {
      createArmyTest(state, SideType.A, 5)

      addToReserveTest(
        state,
        SideType.A,
        [UnitType.LightInfantry].map(type => getUnit(type))
      )
      addToReserveTest(
        state,
        SideType.A,
        [UnitType.LightInfantry].map(type => getUnit(type)),
        1
      )
      addToReserveTest(
        state,
        SideType.B,
        [UnitType.LightInfantry].map(type => getUnit(type))
      )

      const expected = initExpected(5)
      expected[5].A.front = [UnitType.LightInfantry, [UnitType.LightInfantry, 1.0, 2.7]]
      expected[5].B.front = [UnitType.LightInfantry]

      testCombatWithDefaultRolls(state, expected)
    })
  })
}

export default null
