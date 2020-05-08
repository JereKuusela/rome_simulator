import { TestInfo, initInfo, getUnit, testDeployment, setFlankSizes, setCombatWidth, createExpected } from './utils'
import { UnitType, Setting } from 'types'
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

if (process.env.REACT_APP_GAME !== 'euiv') {

  describe('initial deployment', () => {

    let info: TestInfo
    beforeEach(() => { info = initInfo() })

    const setAttacker = (types: UnitType[]) => info.armyA.reserve.push(...types.map(type => getUnit(type)))
    const fillAttacker = (type: UnitType) => info.armyA.reserve.push(...Array(info.armyA.frontline[0].length).fill(type).map(type => getUnit(type)))
    const fillDefender = (type: UnitType) => info.armyD.reserve.push(...Array(info.armyD.frontline[0].length).fill(type).map(type => getUnit(type)))

    it('deploys all land units with default order except support', () => {
      loadInput(allLandFront, info)
      const attacker = {
        front: createExpected([UnitType.Archers, 30])
      }
      const defender = {
        front: createExpected(UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry),
        reserveSupport: createExpected(UnitType.SupplyTrain)
      }
      testDeployment(info, attacker, defender)
    })
    it('can deploy front units on flank', () => {
      loadInput(frontOnly, info)
      const attacker = {
        front: createExpected([UnitType.Archers, 5])
      }
      const defender = {
        front: createExpected(UnitType.Archers)
      }
      testDeployment(info, attacker, defender)
    })
    it('can deploy flank units on front', () => {
      loadInput(flankOnly, info)
      const attacker = {
        front: createExpected([UnitType.HorseArchers, 5])
      }
      const defender = {
        front: createExpected(UnitType.Archers)
      }
      testDeployment(info, attacker, defender)
    })
    it('deploys support if nothing else is available', () => {
      loadInput(supportOnly, info)
      const attacker = {
        front: createExpected([UnitType.SupplyTrain, 5])
      }
      const defender = {
        front: createExpected(UnitType.Archers)
      }
      testDeployment(info, attacker, defender)
    })
    it('deploys flank correctly when outnumbering the enemy, dynamic', () => {
      loadInput(flankOutnumbered, info)
      info.settings[Setting.DynamicFlanking] = true
      const attacker = {
        front: createExpected([UnitType.Archers, 10], [UnitType.HorseArchers, 10], [UnitType.Archers, 10])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 10])
      }
      testDeployment(info, attacker, defender)
    })
    it('deploys flank correctly when outnumbering the enemy, static', () => {
      loadInput(flankOutnumbered, info)
      info.settings[Setting.DynamicFlanking] = false
      const attacker = {
        front: createExpected([UnitType.Archers, 20], [UnitType.HorseArchers, 10])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 10])
      }
      testDeployment(info, attacker, defender)
    })
    it('deploys front correctly with preferennces', () => {
      loadInput(unitPreferences, info)
      const attacker = {
        front: createExpected(UnitType.SupplyTrain, UnitType.HorseArchers, UnitType.WarElephants, UnitType.Chariots, UnitType.LightCavalry)
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(info, attacker, defender)
    })
    it('deploys front correctly when all preferences have the same unit', () => {
      loadInput(unitPreferencesOrder, info)
      const attacker = {
        front: createExpected(UnitType.SupplyTrain, UnitType.WarElephants, UnitType.Chariots, UnitType.HorseArchers, UnitType.LightCavalry)
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(info, attacker, defender)
    })
    it('flank size, enough flanking units', () => {
      loadInput(flanksizeSmallFlank, info)
      const attacker = {
        front: createExpected([UnitType.Archers, 26], [UnitType.HorseArchers, 4]),
        reserveFront: createExpected([UnitType.Archers, 4]),
        reserveFlank: createExpected(UnitType.HorseArchers)
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(info, attacker, defender)
    })
    it('flank size, not enough flanking units', () => {
      loadInput(flanksizeBigFlank, info)
      const attacker = {
        front: createExpected([UnitType.Archers, 20], [UnitType.HorseArchers, 5], [UnitType.Archers, 5]),
        reserve_front: createExpected([UnitType.Archers, 5])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 30])
      }
      testDeployment(info, attacker, defender)
    })
    it('reduced combat width', () => {
      setFlankSizes(info, 2, 0)
      setCombatWidth(info, 5)
      setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
      fillAttacker(UnitType.Archers)
      fillDefender(UnitType.Archers)
      const attacker = {
        front: createExpected(UnitType.Archers, [UnitType.HorseArchers, 3], UnitType.Archers),
        reserveFront: createExpected([UnitType.Archers, 3])
      }
      const defender = {
        front: createExpected([UnitType.Archers, 5])
      }
      testDeployment(info, attacker, defender)
    })
  })
}

export default null
