import { UnitType } from '../../units'
import { CombatParameter } from '../../settings'
import { verifyType, getRowTypes, getUnit, every_type, setFlankSizes, initInfo, TestInfo, initSide, testCombat } from './utils'
import { Side } from '../../battle'

describe('reinforcement', () => {

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
      verifyType(info.round, Side.Attacker, index, info.army_a.frontline[index], type, ' at index ' + index)
      index = nextIndex(index, half)
    }
  }

  const reinforce = () => {
    const { attacker, defender } = initSide(1)
    attacker[0] = null as any
    defender[0] = null as any
    testCombat(info, [[0, 0]], attacker, defender)
  }

  it('a single unit', () => {
    setAttacker([UnitType.Archers])
    reinforce()
    verifyType(info.round, Side.Attacker, 15, info.army_a.frontline[15], UnitType.Archers)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    reinforce()
    verifyType(info.round, Side.Attacker, 15, info.army_a.frontline[15], UnitType.Archers)
    expect(info.army_a.reserve.length).toEqual(0)
    verifyType(info.round, Side.Attacker, 15, info.army_d.frontline[15], UnitType.Chariots)
    expect(info.army_d.reserve.length).toEqual(0)
  })
  it('main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    fillDefender(UnitType.Archers)
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('front priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.Archers, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('back priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(null, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('flank priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.Archers, UnitType.Archers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers, UnitType.Archers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('mixed priority', () => {
    info.army_a = { ...info.army_a, row_types: getRowTypes(UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HorseArchers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.HeavyInfantry, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.Archers]
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(0)
  })
  it('flank size, inactive', () => {
    setFlankSizes(info, 5, 0)
    fillAttacker(UnitType.Archers)
    setAttacker([UnitType.HorseArchers])
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    reinforce()
    verify(result)
  })
  it('flank size', () => {
    setFlankSizes(info, 5, 0)
    fillAttacker(UnitType.Archers)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    reinforce()
    verify(result)
  })
  it('reduced combat width', () => {
    setFlankSizes(info, 2, 0)
    info.settings[CombatParameter.CombatWidth] = 5
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    reinforce()
    verify(result)
    expect(info.army_a.reserve.length).toEqual(28)
  })
})


export default null
