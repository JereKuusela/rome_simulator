import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, Participant, RowType } from '../../land_battle'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, getDefaultGlobalDefinition, UnitType, UnitCalc, UnitDefinition, ArmyName } from '../../units'
import { addModifierValue, mergeValues } from '../../../base_definition'
import { settingsState } from '../../settings'
import { verifyCenterUnits, setRolls, setTactics, setCenterUnits, verifyType } from './utils'

describe('initial deployment', () => {
  const global_stats = getDefaultGlobalDefinition()
  const units = getDefaultUnitDefinitions().map(unit => mergeValues(unit, global_stats))
  const definitions = Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, units).set(ArmyName.Defender, units)
  const settings = settingsState.combat
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
  })
  const getUnit = (type: UnitType) => units.get(type)!
  const setAttacker = (types: UnitType[]) => (info.attacker = { ...info.attacker, reserve: info.attacker.reserve.merge(types.map(type => getUnit(type))) })
  const setDefender = (types: UnitType[]) => (info.defender = { ...info.defender, reserve: info.defender.reserve.merge(types.map(type => getUnit(type))) })
  const fillAttacker = (type: UnitType) => (info.attacker = { ...info.attacker, reserve: info.attacker.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })
  const fillDefender = (type: UnitType) => (info.defender = { ...info.defender, reserve: info.defender.reserve.merge(Array(30).fill(type).map(type => getUnit(type))) })


  const doRound = () => {
    const [a, d] = battle(definitions, { ...info.attacker, tactic: undefined, name: ArmyName.Attacker }, { ...info.defender, tactic: undefined, name: ArmyName.Defender }, 0, List<TerrainDefinition>(), settings)
    info.attacker = { ...info.attacker, ...a }
    info.defender = { ...info.defender, ...d }
  }
  const nextIndex = (index: number) => index < 15 ? index + 2 * (15 - index) : index - 2 * (index - 15) - 1

  const verify = (types: UnitType[]) => {
    let index = 15
    for (const type of types) {
      verifyType(info.attacker.army.get(index), type, ' at index ' + index)
      index = nextIndex(index)
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
})


export default null
