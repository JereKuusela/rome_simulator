import { UnitType } from '../../store/units'
import { Setting } from '../../store/settings'
import { getRowTypes, getUnit, every_type, setFlankSizes, initInfo, TestInfo, testReinforce } from './utils'
import { resize } from '../../utils'

describe('reinforcement', () => {

  let info: TestInfo
  beforeEach(() => { info = initInfo() })

  const setAttacker = (types: UnitType[]) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(Array(30).fill(type).map(type => getUnit(type))) })


  it('a single unit', () => {
    setAttacker([UnitType.Archers])
    testReinforce(info, [UnitType.Archers])
  })
  it('both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    testReinforce(info, [UnitType.Archers], 0, [UnitType.Chariots], 0)
  })
  it('main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    fillDefender(UnitType.Archers)
    testReinforce(info, result)
  })
  it('flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('front priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.Archers, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('back priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(null, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    testReinforce(info, result)
  })
  it('flank priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers, UnitType.Archers]
    testReinforce(info, result)
  })
  it('mixed priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HorseArchers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.HeavyInfantry, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.Archers]
    testReinforce(info, result)
  })
  it('flank size, inactive', () => {
    setFlankSizes(info, 5, 0)
    fillAttacker(UnitType.Archers)
    setAttacker([UnitType.HorseArchers])
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    testReinforce(info, result, 1)
  })
  it('flank size', () => {
    setFlankSizes(info, 5, 0)
    fillAttacker(UnitType.Archers)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    testReinforce(info, result, 3)
  })
  it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
    info.settings[Setting.CombatWidth] = 5
    // Deploy resizes so have to do this manually.
    info.army_a = { ...info.army_a, frontline: resize(info.army_a.frontline, 5, null) }
    info.army_d = { ...info.army_d, frontline: resize(info.army_d.frontline, 5, null) }
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    testReinforce(info, result, 28)

  })
})


export default null
