import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, Participant } from '../../land_battle/types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition, ArmyName } from '../../units'
import { add_modifier_value, calculateValue} from '../../../base_definition'

describe('1 vs 1', () => {
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions()
  const unit = add_modifier_value(units.get(UnitType.Archers)!, 'Initial', UnitCalc.Morale, -0.2)
  const definitions = Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, units).set(ArmyName.Defender, units)

  let attacker: Participant
  let defender: Participant
  let terrain: List<TerrainDefinition>
  let round: number

  beforeEach(() => {
    attacker = getInitialArmy()
    defender = getInitialArmy()
    terrain = List<TerrainDefinition>().push(terrains.get(TerrainType.Forest)!)
    setUnits(unit, unit)
    round = 0
  })
  const verifySub = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
    expect(unit).toBeTruthy()
    if (!unit)
      return
    expect(calculateValue(unit, UnitCalc.Manpower)).toEqual(manpower)
    try {
      expect(Math.abs(calculateValue(unit, UnitCalc.Morale) - morale)).toBeLessThan(0.002)
    }
    catch (e) {
      throw new Error('Morale ' + calculateValue(unit, UnitCalc.Morale) + ' is not ' + morale);
    }
  }
  const verify = (manpower_a: number, morale_a: number, manpower_d: number, morale_d: number) => {
    verifySub(attacker.army.getIn([0, 15]), manpower_a, morale_a)
    verifySub(defender.army.getIn([0, 15]), manpower_d, morale_d)
  }
  const doRound = () => {
    round++
    const [attacker_new_army, defender_new_army] = battle(definitions, {...attacker, tactic: tactics.get(attacker.tactic)!}, {...defender, tactic: tactics.get(defender.tactic)!}, round, terrain)
    attacker = { ...attacker, army: attacker_new_army }
    defender = { ...defender, army: defender_new_army }
  }
  const setRolls = (roll_a: number, roll_d: number) => {
    attacker = { ...attacker, roll: roll_a }
    defender = { ...defender, roll: roll_d }
  }
  const setTactics = (tactic_a: TacticType, tactic_d: TacticType) => {
    attacker = { ...attacker, tactic: tactic_a }
    defender = { ...defender, tactic: tactic_d }
  }
  const setUnits = (unit_a: UnitDefinition, unit_b: UnitDefinition) => {
    attacker = { ...attacker, army: attacker.army.setIn([0, 15], unit_a) }
    defender = { ...defender, army: defender.army.setIn([0, 15], unit_b) }
  }

  it('should work with extra casualties 1', () => {
    setTactics(TacticType.ShockAction, TacticType.ShockAction)
    setRolls(1, 5)
    doRound()
    verify(957, 1.994, 981, 2.220)
    doRound()
    verify(915, 1.630, 963, 2.080)
    doRound()
    verify(874, 1.294, 946, 1.970)
    doRound()
    verify(834, 0.982, 930, 1.888)
    doRound()
    verify(794, 0.690, 915, 1.828)
    setRolls(1, 6)
    doRound()
    verify(751, 0.378, 900, 1.790)
  })
  it('should work with extra casualties 2', () => {
    setTactics(TacticType.ShockAction, TacticType.ShockAction)
    setRolls(6, 2)
    doRound()
    verify(972, 2.130, 957, 1.994)
    doRound()
    verify(945, 1.918, 916, 1.648)
    doRound()
    verify(919, 1.752, 876, 1.344)
    doRound()
    // Missed results.
    doRound()
    verify(870, 1.524, 799, 0.832)
    setRolls(5, 2)
    doRound()
    verify(848, 1.452, 766, 0.636)
    doRound()
    verify(827, 1.400, 734, 0.454)
    doRound()
    verify(806, 1.364, 703, 0.282)
  })
  it('should work with counters', () => {
    setTactics(TacticType.Skirmishing, TacticType.Bottleneck)
    setRolls(5, 2)
    doRound()
    verify(984, 2.158, 974, 2.004)
    doRound()
    verify(969, 1.962, 949, 1.656)
    doRound()
    verify(954, 1.806, 924, 1.346)
    doRound()
    verify(940, 1.682, 899, 1.064)
    doRound()
    verify(926, 1.588, 875, 0.806)
    setRolls(2, 4)
    doRound()
    verify(908, 1.494, 860, 0.656)
    doRound()
    // Missed results. Results below may not be correct...
    doRound()
    verify(872, 1.362, 832, 0.394)
    doRound()
    verify(855, 1.320, 818, 0.274)
  })
})


export default null
