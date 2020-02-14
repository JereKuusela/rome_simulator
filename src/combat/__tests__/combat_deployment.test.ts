import { TestInfo, initInfo, getUnit, testDeploy, every_type, setFlankSizes, getUnitPreferences, setCombatWidth } from './utils'
import { UnitType, Setting } from 'types'
import { loadInput } from './parser'

import basic from './input/deployment/basic.txt'
import all_land_front from './input/deployment/all_land_front.txt'
import flanksize_small_flank from './input/deployment/flanksize_small_flank.txt'
import flanksize_big_flank from './input/deployment/flanksize_big_flank.txt'
import { resize } from 'utils'

describe('initial deployment', () => {

  let info: TestInfo
  beforeEach(() => { info = initInfo() })
  
  const setAttacker = (types: UnitType[]) => info.army_a.reserve.push(...types.map(type => getUnit(type)))
  const setDefender = (types: UnitType[]) => info.army_d.reserve.push(...types.map(type => getUnit(type)))
  const fillAttacker = (type: UnitType) => info.army_a.reserve.push(...Array(info.army_a.frontline[0].length).fill(type).map(type => getUnit(type)))
  const fillDefender = (type: UnitType) => info.army_d.reserve.push(...Array(info.army_d.frontline[0].length).fill(type).map(type => getUnit(type)))

  it('1 vs 1', () => {
    loadInput(basic, info)
    testDeploy(info, [UnitType.Archers], 0, [UnitType.Chariots], 0)
  })
  it('all land units against full frontline', () => {
    loadInput(all_land_front, info)
    const attacker = Array(30).fill(UnitType.Archers)
    const defender = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers,  UnitType.LightInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.SupplyTrain]
    testDeploy(info, attacker, 0, defender, 0)
  })
  it('flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.Chariots, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Archers, UnitType.Chariots, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('front priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('back priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(null, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.Archers]
    testDeploy(info, result)
  })
  it('flank priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(UnitType.Archers, UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('mixed priority', () => {
    info.army_a = { ...info.army_a, unit_preferences: getUnitPreferences(UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HeavyInfantry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.Chariots, UnitType.Archers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.HorseArchers]
    testDeploy(info, result)
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
    result[24] = UnitType.HorseArchers
    result[25] = UnitType.HorseArchers
    result[26] = UnitType.HorseArchers
    result[27] = UnitType.HorseArchers
    result[28] = UnitType.HorseArchers
    testDeploy(info, result, 5)
  })
  it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
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
