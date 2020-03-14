import { TestInfo, initInfo, getUnit, testDeployment, setFlankSizes, setCombatWidth, createExpected } from './utils'
import { UnitType } from 'types'
import { loadInput } from './parser'

import all_land_front from './input/deployment/all_land_front.txt'
import flanksize_small_flank from './input/deployment/flanksize_small_flank.txt'
import flanksize_big_flank from './input/deployment/flanksize_big_flank.txt'
import front_only from './input/deployment/front_only.txt'
import flank_only from './input/deployment/flank_only.txt'
import support_only from './input/deployment/support_only.txt'
import flank_outnumbered from './input/deployment/flank_outnumbered.txt'
import unit_preferences from './input/deployment/unit_preferences.txt'
import unit_preferences_order from './input/deployment/unit_preferences_order.txt'

describe('initial deployment', () => {

  let info: TestInfo
  beforeEach(() => { info = initInfo() })

  const setAttacker = (types: UnitType[]) => info.army_a.reserve.push(...types.map(type => getUnit(type)))
  const fillAttacker = (type: UnitType) => info.army_a.reserve.push(...Array(info.army_a.frontline[0].length).fill(type).map(type => getUnit(type)))
  const fillDefender = (type: UnitType) => info.army_d.reserve.push(...Array(info.army_d.frontline[0].length).fill(type).map(type => getUnit(type)))

  it('deploys all land units with default order except support', () => {
    loadInput(all_land_front, info)
    const attacker = {
      front: createExpected([UnitType.Archers, 30])
    }
    const defender = {
      front: createExpected(UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry),
      reserve_support: createExpected(UnitType.SupplyTrain)
    }
    testDeployment(info, attacker, defender)
  })
  it('can deploy front units on flank', () => {
    loadInput(front_only, info)
    const attacker = {
      front: createExpected([UnitType.Archers, 5])
    }
    const defender = {
      front: createExpected(UnitType.Archers)
    }
    testDeployment(info, attacker, defender)
  })
  it('can deploy flank units on front', () => {
    loadInput(flank_only, info)
    const attacker = {
      front: createExpected([UnitType.HorseArchers, 5])
    }
    const defender = {
      front: createExpected(UnitType.Archers)
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys support if nothing else is available', () => {
    loadInput(support_only, info)
    const attacker = {
      front: createExpected([UnitType.SupplyTrain, 5])
    }
    const defender = {
      front: createExpected(UnitType.Archers)
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys flank correctly when outnumbering the enemy', () => {
    loadInput(flank_outnumbered, info)
    const attacker = {
      front: createExpected([UnitType.Archers, 10], [UnitType.HorseArchers, 10], [UnitType.Archers, 10])
    }
    const defender = {
      front: createExpected([UnitType.Archers, 10])
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys front correctly with preferennces', () => {
    loadInput(unit_preferences, info)
    const attacker = {
      front: createExpected(UnitType.SupplyTrain, UnitType.HorseArchers, UnitType.WarElephants, UnitType.Chariots, UnitType.LightCavalry)
    }
    const defender = {
      front: createExpected([UnitType.Archers, 30])
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys front correctly when all preferences have the same unit', () => {
    loadInput(unit_preferences_order, info)
    const attacker = {
      front: createExpected(UnitType.SupplyTrain, UnitType.WarElephants, UnitType.Chariots, UnitType.HorseArchers, UnitType.LightCavalry)
    }
    const defender = {
      front: createExpected([UnitType.Archers, 30])
    }
    testDeployment(info, attacker, defender)
  })
  it('flank size, enough flanking units', () => {
    loadInput(flanksize_small_flank, info)
    const attacker = {
      front: createExpected([UnitType.Archers, 26], [UnitType.HorseArchers, 4]),
      reserve_front: createExpected([UnitType.Archers, 4]),
      reserve_flank: createExpected(UnitType.HorseArchers)
    }
    const defender = {
      front: createExpected([UnitType.Archers, 30])
    }
    testDeployment(info, attacker, defender)
  })
  it('flank size, not enough flanking units', () => {
    loadInput(flanksize_big_flank, info)
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
      reserve_front: createExpected([UnitType.Archers, 3])
    }
    const defender = {
      front: createExpected([UnitType.Archers, 5])
    }
    testDeployment(info, attacker, defender)
  })
})

export default null
