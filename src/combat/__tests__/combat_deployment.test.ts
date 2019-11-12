import { UnitType } from '../../store/units'
import { CombatParameter } from '../../store/settings'
import { verifyType, getRowTypes, getUnit, every_type, setFlankSizes, TestInfo, initInfo, testCombat, initSide, testDeploy } from './utils'
import { Side } from '../../store/battle'

describe('initial deployment', () => {

  let info: TestInfo
  beforeEach(() => { info = initInfo() })
  
  const setAttacker = (types: UnitType[]) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.concat(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.concat(Array(30).fill(type).map(type => getUnit(type))) })

  const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

  const verify = (types: UnitType[]) => {
    const half = Math.floor(info.settings[CombatParameter.CombatWidth] / 2.0)
    let index = half
    for (const type of types) {
      verifyType(-1, Side.Attacker, index, info.army_a.frontline[index], type, ' at index ' + index)
      index = nextIndex(index, half)
    }
  }

const deploy = () => {
    testDeploy(info)
  }
  it('a single unit', () => {
    setAttacker([UnitType.Archers])
    deploy()
    verifyType(-1, Side.Attacker, 15, info.army_a.frontline[15], UnitType.Archers)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    deploy()
    verifyType(-1, Side.Attacker, 15, info.army_a.frontline[15], UnitType.Archers)
    expect(info.army_a.reserve.length).toEqual(0)
    verifyType(-1, Side.Attacker, 15, info.army_d.frontline[15], UnitType.Chariots)
    expect(info.army_d.reserve.length).toEqual(0)
  })
  it('main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.LightInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry]
    fillDefender(UnitType.Archers)
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.LightInfantry]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.Archers, UnitType.LightInfantry]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Archers, UnitType.LightInfantry]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('front priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.LightInfantry]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('back priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(null, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.Archers]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('flank priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('mixed priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HeavyInfantry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.Chariots, UnitType.Archers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.HorseArchers,]
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('flank size, inactive', () => {
    setFlankSizes(info, 5, 0)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(2)
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
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(3)
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
    deploy()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(28)
  })
})

export default null
