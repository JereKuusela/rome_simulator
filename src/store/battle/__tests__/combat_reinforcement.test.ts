import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, Participant, RowType } from '../../land_battle'
import { TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, getDefaultGlobalDefinition, UnitType, UnitDefinition, ArmyName } from '../../units'
import { mergeValues } from '../../../base_definition'
import { settingsState, CombatParameter } from '../../settings'
import { verifyType } from './utils'

describe('reinforcement', () => {
  const global_stats = getDefaultGlobalDefinition()
  const units = getDefaultUnitDefinitions().map(unit => mergeValues(unit, global_stats))
  const definitions = Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, units).set(ArmyName.Defender, units)
  let settings = settingsState.combat
  const row_types = Map<RowType, UnitType>().set(RowType.Front, '' as UnitType).set(RowType.Back, '' as UnitType).set(RowType.Flank, '' as UnitType)
  const every_type = [UnitType.Archers, UnitType.CamelCavalry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.HeavyInfantry, UnitType.HorseArchers, UnitType.LightCavalry, UnitType.LightInfantry, UnitType.WarElephants]

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant
  }

  beforeEach(() => {
    info.attacker = getInitialArmy()
    info.attacker = { ...info.attacker, row_types }
    info.defender = getInitialArmy()
    info.defender = { ...info.defender, row_types }
    settings = settingsState.combat
  })
  const getUnit = (type: UnitType) => units.get(type)!
  const setAttacker = (types: UnitType[]) => (info.attacker = { ...info.attacker, reserve: info.attacker.reserve.merge(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.defender = { ...info.defender, reserve: info.defender.reserve.merge(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.attacker = { ...info.attacker, reserve: info.attacker.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.defender = { ...info.defender, reserve: info.defender.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })


  const doRound = () => {
    const [a, d] = battle(definitions, { ...info.attacker, tactic: undefined, name: ArmyName.Attacker }, { ...info.defender, tactic: undefined, name: ArmyName.Defender }, 1, List<TerrainDefinition>(), settings)
    info.attacker = { ...info.attacker, ...a }
    info.defender = { ...info.defender, ...d }
  }
  const nextIndex = (index: number, half: number) => index < half ? index + 2 * (half - index) : index - 2 * (index - half) - 1

  const verify = (types: UnitType[]) => {
    const half = Math.floor(settings.get(CombatParameter.CombatWidth)! / 2.0)
    let index = half
    for (const type of types) {
      verifyType(info.attacker.army.get(index), type, ' at index ' + index)
      index = nextIndex(index, half)
    }
  }

  it('works with a single unit', () => {
    setAttacker([UnitType.Archers])
    doRound()
    verifyType(info.attacker.army.get(15), UnitType.Archers)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with both sides', () => {
    setAttacker([UnitType.Archers])
    setDefender([UnitType.Chariots])
    doRound()
    verifyType(info.attacker.army.get(15), UnitType.Archers)
    expect(info.attacker.reserve.size).toEqual(0)
    verifyType(info.defender.army.get(15), UnitType.Chariots)
    expect(info.defender.reserve.size).toEqual(0)
  })
  it('works with main front and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    fillDefender(UnitType.Archers)
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with flank only and default priorities', () => {
    setAttacker(every_type)
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with mixed field and default priorities, uneven', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with mixed field and default priorities, even', () => {
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Archers, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with front priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.Archers, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with back priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Back, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.Archers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with flank priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Flank, UnitType.Archers).set(RowType.Back, UnitType.Archers).set(RowType.Front, UnitType.Archers) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyInfantry, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.HorseArchers, UnitType.Archers]
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(0)
  })
  it('works with mixed priority', () => {
    info.attacker = { ...info.attacker, row_types: row_types.set(RowType.Flank, UnitType.Archers).set(RowType.Back, UnitType.HorseArchers).set(RowType.Front, UnitType.HeavyInfantry) }
    setAttacker(every_type)
    setDefender([UnitType.Archers, UnitType.Archers, UnitType.Archers, UnitType.Archers])
    const result = [UnitType.HorseArchers, UnitType.LightInfantry, UnitType.Chariots, UnitType.HeavyCavalry, UnitType.WarElephants, UnitType.HeavyInfantry, UnitType.LightCavalry, UnitType.CamelCavalry, UnitType.Archers]
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
    doRound()
    verify(result)
    expect(info.attacker.reserve.size).toEqual(28)
  })
})


export default null
