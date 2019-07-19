import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getDefaultArmy, Participant, RowType } from '../../battle'
import { TerrainDefinition } from '../../terrains'
import { getDefaultUnits, getDefaultGlobal, UnitType, UnitDefinition } from '../../units'
import { mergeValues, DefinitionType } from '../../../base_definition'
import { CombatParameter } from '../../settings'
import { verifyType, getSettings } from './utils'
import { CountryName } from '../../countries'

describe('initial deployment', () => {
  const global_stats = getDefaultGlobal().get(DefinitionType.Land)!
  const units = getDefaultUnits().map(unit => mergeValues(unit, global_stats))
  const definitions = Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, units).set(CountryName.Country2, units)
  let settings = getSettings(DefinitionType.Land)
  const row_types = Map<RowType, UnitType>().set(RowType.Front, '' as UnitType).set(RowType.Back, '' as UnitType).set(RowType.Flank, '' as UnitType)
  const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant
  }

  beforeEach(() => {
    info.attacker = getDefaultArmy(DefinitionType.Land)
    info.attacker = { ...info.attacker, row_types }
    info.defender = getDefaultArmy(DefinitionType.Land)
    info.defender = { ...info.defender, row_types }
    settings = getSettings(DefinitionType.Land)
  })
  const getUnit = (type: UnitType) => units.get(type)!
  const setAttacker = (types: UnitType[]) => (info.attacker = { ...info.attacker, reserve: info.attacker.reserve.merge(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.defender = { ...info.defender, reserve: info.defender.reserve.merge(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.attacker = { ...info.attacker, reserve: info.attacker.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.defender = { ...info.defender, reserve: info.defender.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })


  const doRound = () => {
    const [a, d] = battle(definitions, { ...info.attacker, tactic: undefined, country: CountryName.Country1, general: 0 }, { ...info.defender, tactic: undefined, country: CountryName.Country2, general: 0 }, 0, List<TerrainDefinition>(), settings)
    info.attacker = { ...info.attacker, ...a }
    info.defender = { ...info.defender, ...d }
  }
  const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

  const verify = (types: UnitType[]) => {
    const half = Math.floor(settings.get(CombatParameter.CombatWidth)! / 2.0)
    let index = half
    for (const type of types) {
      verifyType(info.attacker.frontline.get(index), type, ' at index ' + index)
      index = nextIndex(index, half)
    }
  }

  it('works with a single unit', () => {
    setAttacker([UnitType.Archers])
    doRound()
    verifyType(info.attacker.frontline.get(15), UnitType.Archers)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    doRound()
    verifyType(info.attacker.frontline.get(15), UnitType.Archers)
    expect(info.attacker.reserve.size).toEqual(0)
    verifyType(info.defender.frontline.get(15), UnitType.Chariots)
    expect(info.defender.reserve.size).toEqual(0)
  })
  it('works with main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.LightInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry]
    fillDefender(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.LightInfantry]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.Archers, UnitType.LightInfantry]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Archers, UnitType.LightInfantry]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with front priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.Chariots, UnitType.LightInfantry]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with back priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Back, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.Archers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with flank priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Flank, UnitType.Archers).set(RowType.Back, UnitType.Archers).set(RowType.Front, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.Chariots, UnitType.Archers, UnitType.HorseArchers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with mixed priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Flank, UnitType.Archers).set(RowType.Back, UnitType.HorseArchers).set(RowType.Front, UnitType.HeavyInfantry) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HeavyInfantry, UnitType.WarElephants, UnitType.HeavyCavalry, UnitType.Chariots, UnitType.Archers, UnitType.CamelCavalry, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.HorseArchers,]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with flank size, inactive', () => {
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(2)
  })
  it('works with flank size', () => {
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    result[20] = UnitType.HorseArchers
    result[21] = UnitType.HorseArchers
    result[22] = UnitType.HorseArchers
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(3)
  })
  it('works with reduce combat width', () => {
    settings = settings.set(CombatParameter.CombatWidth, 5)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    result[0] = UnitType.HorseArchers
    result[1] = UnitType.HorseArchers
    result[2] = UnitType.HorseArchers
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(28)
  })
})


export default null
