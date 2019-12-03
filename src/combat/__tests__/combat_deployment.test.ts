import { UnitType } from '../../store/units'
import { CombatParameter } from '../../store/settings'
import { getRowTypes, getUnit, every_type, setFlankSizes, TestInfo, initInfo, testDeploy } from './utils'

describe('initial deployment', () => {

  let info: TestInfo
  beforeEach(() => { info = initInfo() })
  
  const setAttacker = (types: UnitType[]) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(Array(30).fill(type).map(type => getUnit(type))) })

  it('a single unit', () => {
    setAttacker([UnitType.Archers])
    testDeploy(info, [UnitType.Archers])
  })
  it('both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    testDeploy(info, [UnitType.Archers], 0, [UnitType.Chariots], 0)
  })
  it('main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Archers, UnitType.Chariots, UnitType.LightInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry]
    fillDefender(UnitType.Archers)
    testDeploy(info, result)
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
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('back priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(null, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.Archers]
    testDeploy(info, result)
  })
  it('flank priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry]
    testDeploy(info, result)
  })
  it('mixed priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HeavyInfantry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.Chariots, UnitType.Archers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.HorseArchers]
    testDeploy(info, result)
  })
  it('flank size, inactive', () => {
    setFlankSizes(info, 5, 0)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    testDeploy(info, result, 2)
  })
  it('flank size', () => {
    setFlankSizes(info, 5, 0)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    result[20] = UnitType.HorseArchers
    result[21] = UnitType.HorseArchers
    result[22] = UnitType.HorseArchers
    testDeploy(info, result, 3)
  })
  it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
    info.settings[CombatParameter.CombatWidth] = 5
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    result[1] = UnitType.HorseArchers
    result[2] = UnitType.HorseArchers
    result[3] = UnitType.HorseArchers
    testDeploy(info, result, 28)
  })
})

export default null
