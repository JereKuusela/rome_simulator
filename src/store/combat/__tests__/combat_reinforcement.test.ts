import { doBattle } from '../combat'
import { List, Map } from 'immutable'
import { getDefaultArmy, Army, RowType, Participant, getDefaultParticipant  } from '../../battle'
import { TerrainDefinition } from '../../terrains'
import { getDefaultUnits, getDefaultGlobal, UnitType, UnitDefinition, BaseUnit} from '../../units'
import { mergeValues, DefinitionType } from '../../../base_definition'
import { CombatParameter } from '../../settings'
import { verifyType, getSettings } from './utils'
import { CountryName } from '../../countries'

describe('reinforcement', () => {
  const global_stats = getDefaultGlobal().get(DefinitionType.Land)!
  const units = getDefaultUnits().map(unit => mergeValues(unit, global_stats))
  const definitions = Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, units).set(CountryName.Country2, units)
  let settings = getSettings(DefinitionType.Land)
  const row_types = Map<RowType, UnitType>().set(RowType.Front, '' as UnitType).set(RowType.Back, '' as UnitType).set(RowType.Flank, '' as UnitType)
  const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant,
    army_a: null as any as Army,
    army_d: null as any as Army,
    round: 0
  }

  beforeEach(() => {
    info.attacker = getDefaultParticipant(CountryName.Country1)
    info.defender = getDefaultParticipant(CountryName.Country2)
    info.army_a = getDefaultArmy(DefinitionType.Land)
    info.army_d = getDefaultArmy(DefinitionType.Land)
    info.army_a = { ...info.army_a, row_types }
    info.army_d = { ...info.army_d, row_types }
    settings = getSettings(DefinitionType.Land)
  })
  const getUnit = (type: UnitType) => units.get(type) as any as BaseUnit
  const setAttacker = (types: UnitType[]) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.merge(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.merge(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.army_a = { ...info.army_a, reserve: info.army_a.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.army_d = { ...info.army_d, reserve: info.army_d.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })


  const doRound = () => {
    const [a, d] = doBattle(definitions, { ...info.attacker, ...info.army_a, tactic: undefined, country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: undefined, country: CountryName.Country2, general: 0 }, 1, List<TerrainDefinition>(), settings)
    info.army_a = { ...info.army_a, ...a }
    info.army_d = { ...info.army_d, ...d }
  }
  const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

  const verify = (types: UnitType[]) => {
    const half = Math.floor(settings.get(CombatParameter.CombatWidth)! / 2.0)
    let index = half
    for (const type of types) {
      verifyType(info.army_a.frontline.get(index), type, ' at index ' + index)
      index = nextIndex(index, half)
    }
  }

  it('works with a single unit', () => {
    setAttacker([UnitType.Archers])
    doRound()
    verifyType(info.army_a.frontline.get(15), UnitType.Archers)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    doRound()
    verifyType(info.army_a.frontline.get(15), UnitType.Archers)
    expect(info.army_a.reserve.size).toEqual(0)
    verifyType(info.army_d.frontline.get(15), UnitType.Chariots)
    expect(info.army_d.reserve.size).toEqual(0)
  })
  it('works with main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    fillDefender(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with front priority', () => {
    info.army_a = { ...info.army_a, row_types: row_types.set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.Archers, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with back priority', () => {
    info.army_a = { ...info.army_a, row_types: row_types.set(RowType.Back, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with flank priority', () => {
    info.army_a = { ...info.army_a, row_types: row_types.set(RowType.Flank, UnitType.Archers).set(RowType.Back, UnitType.Archers).set(RowType.Front, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers, UnitType.Archers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with mixed priority', () => {
    info.army_a = { ...info.army_a, row_types: row_types.set(RowType.Flank, UnitType.Archers).set(RowType.Back, UnitType.HorseArchers).set(RowType.Front, UnitType.HeavyInfantry) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HorseArchers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.HeavyInfantry, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.Archers]
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(0)
  })
  it('works with flank size, inactive', () => {
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(2)
  })
  it('works with flank size', () => {
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(30).fill(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(3)
  })
  it('works with reduce combat width', () => {
    settings = settings.set(CombatParameter.CombatWidth, 5)
    setAttacker([UnitType.HorseArchers, UnitType.HorseArchers, UnitType.HorseArchers])
    fillAttacker(UnitType.Archers)
    fillDefender(UnitType.Archers)
    const result = Array(5).fill(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.army_a.reserve.size).toEqual(28)
  })
})


export default null
