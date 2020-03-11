import { TestInfo, initInfo, getUnit, testDeploy, setFlankSizes, setCombatWidth } from './utils'
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
    const attacker = Array(30).fill(UnitType.Archers)
    const defender = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers,  UnitType.LightInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry]
    testDeploy(info, attacker, 0, defender, 1)
  })
  it('can deploy front units on flank', () => {
    loadInput(front_only, info)
    const attacker = Array(5).fill(UnitType.Archers)
    const defender = [UnitType.Archers]
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('can deploy flank units on front', () => {
    loadInput(flank_only, info)
    const attacker = Array(5).fill(UnitType.HorseArchers)
    const defender = [UnitType.Archers]
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('deploys support if nothing else is available', () => {
    loadInput(support_only, info)
    const attacker = Array(5).fill(UnitType.SupplyTrain)
    const defender = [UnitType.Archers]
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('deploys flank correctly when outnumbering the enemy', () => {
    loadInput(flank_outnumbered, info)
    const attacker = Array(10).fill(UnitType.Archers).concat(Array(10).fill(UnitType.HorseArchers)).concat(Array(10).fill(UnitType.Archers))
    const defender = Array(10).fill(UnitType.Archers)
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('deploys front correctly with preferennces', () => {
    loadInput(unit_preferences, info)
    const attacker = [UnitType.SupplyTrain, UnitType.HorseArchers, UnitType.WarElephants, UnitType.Chariots, UnitType.LightCavalry]
    const defender = Array(30).fill(UnitType.Archers)
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('deploys front correctly when all preferences have the same unit', () => {
    loadInput(unit_preferences_order, info)
    const attacker = [UnitType.SupplyTrain, UnitType.WarElephants, UnitType.Chariots, UnitType.HorseArchers, UnitType.LightCavalry]
    const defender = Array(30).fill(UnitType.Archers)
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('flank size, enough flanking units', () => {
    loadInput(flanksize_small_flank, info)
    const result = Array(30).fill(UnitType.Archers)
    result[26] = UnitType.HorseArchers
    result[27] = UnitType.HorseArchers
    result[28] = UnitType.HorseArchers
    result[29] = UnitType.HorseArchers
    testDeploy(info, result, 5)
  })
  it('flank size, not enough flanking units', () => {
    loadInput(flanksize_big_flank, info)
    const result = Array(30).fill(UnitType.Archers)
    result[20] = UnitType.HorseArchers
    result[21] = UnitType.HorseArchers
    result[22] = UnitType.HorseArchers
    result[23] = UnitType.HorseArchers
    result[24] = UnitType.HorseArchers
    testDeploy(info, result, 5)
  })
 it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
    setCombatWidth(info, 5)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    result[1] = UnitType.HorseArchers
    result[2] = UnitType.HorseArchers
    result[3] = UnitType.HorseArchers
    testDeploy(info, result, 3)
  })
})

export default null
