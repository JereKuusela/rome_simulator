import { TestInfo, initInfo, getUnit, testDeployment, setFlankSizes, setCombatWidth } from './utils'
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
      front: Array(30).fill(UnitType.Archers)
    }
    const defender = {
      front: [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry],
      reserve: [UnitType.SupplyTrain]
    }
    testDeployment(info, attacker, defender)
  })
  it('can deploy front units on flank', () => {
    loadInput(front_only, info)
    const attacker = {
      front: Array(5).fill(UnitType.Archers)
    }
    const defender = {
      front: [UnitType.Archers]
    }
    testDeployment(info, attacker, defender)
  })
  it('can deploy flank units on front', () => {
    loadInput(flank_only, info)
    const attacker = {
      front: Array(5).fill(UnitType.HorseArchers)
    }
    const defender = {
      front: [UnitType.Archers]
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys support if nothing else is available', () => {
    loadInput(support_only, info)
    const attacker = {
      front: Array(5).fill(UnitType.SupplyTrain)
    }
    const defender = {
      front: [UnitType.Archers]
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys flank correctly when outnumbering the enemy', () => {
    loadInput(flank_outnumbered, info)
    const attacker = {
      front: Array(10).fill(UnitType.Archers).concat(Array(10).fill(UnitType.HorseArchers)).concat(Array(10).fill(UnitType.Archers))
    }
    const defender = {
      front: Array(10).fill(UnitType.Archers)
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys front correctly with preferennces', () => {
    loadInput(unit_preferences, info)
    const attacker = {
      front: [UnitType.SupplyTrain, UnitType.HorseArchers, UnitType.WarElephants, UnitType.Chariots, UnitType.LightCavalry]
    }
    const defender = {
      front: Array(30).fill(UnitType.Archers)
    }
    testDeployment(info, attacker, defender)
  })
  it('deploys front correctly when all preferences have the same unit', () => {
    loadInput(unit_preferences_order, info)
    const attacker = {
      front: [UnitType.SupplyTrain, UnitType.WarElephants, UnitType.Chariots, UnitType.HorseArchers, UnitType.LightCavalry]
    }
    const defender = {
      front: Array(30).fill(UnitType.Archers)
    }
    testDeployment(info, attacker, defender)
  })
  it('flank size, enough flanking units', () => {
    loadInput(flanksize_small_flank, info)
    const attacker = {
      front: Array(30).fill(UnitType.Archers),
      reserve: Array(5).fill(UnitType.Archers)
    }
    const defender = {
      front: Array(30).fill(UnitType.Archers)
    }
    attacker.front[26] = UnitType.HorseArchers
    attacker.front[27] = UnitType.HorseArchers
    attacker.front[28] = UnitType.HorseArchers
    attacker.front[29] = UnitType.HorseArchers
    attacker.reserve[0] = UnitType.HorseArchers
    testDeployment(info, attacker, defender)
  })
  it('flank size, not enough flanking units', () => {
    loadInput(flanksize_big_flank, info)
    const attacker = {
      front: Array(30).fill(UnitType.Archers),
      reserve: Array(5).fill(UnitType.Archers)
    }
    const defender = {
      front: Array(30).fill(UnitType.Archers)
    }
    attacker.front[20] = UnitType.HorseArchers
    attacker.front[21] = UnitType.HorseArchers
    attacker.front[22] = UnitType.HorseArchers
    attacker.front[23] = UnitType.HorseArchers
    attacker.front[24] = UnitType.HorseArchers
    testDeployment(info, attacker, defender)
  })
  it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
    setCombatWidth(info, 5)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const attacker = {
      front: Array(5).fill(UnitType.Archers),
      reserve: Array(3).fill(UnitType.Archers)
    }
    const defender = {
      front: Array(5).fill(UnitType.Archers)
    }
    attacker.front[1] = UnitType.HorseArchers
    attacker.front[2] = UnitType.HorseArchers
    attacker.front[3] = UnitType.HorseArchers
    testDeployment(info, attacker, defender)
  })
})

export default null
