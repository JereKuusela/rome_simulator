import { battle } from '../combat'
import { List } from 'immutable'
import { getInitialArmy, getInitialTerrains, ParticipantState } from '../types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, UnitType, UnitCalc, UnitDefinition } from '../../units'

describe('1 vs 1', () => {
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions()
  const unit = units.get(UnitType.Archers)!.add_modifier_value('Initial', UnitCalc.Morale, -0.2)

  let attacker: ParticipantState
  let defender: ParticipantState
  let terrain: List<TerrainDefinition>
  let round: number

  beforeEach(() => {
    attacker = getInitialArmy()
    defender = getInitialArmy()
    terrain = getInitialTerrains().push(terrains.get(TerrainType.Forest)!)
    setUnits(unit, unit)
    round = 0
  })
  const verifySub = (unit: UnitDefinition | undefined, manpower: number, morale: number) => {
    expect(unit).toBeTruthy()
    if (!unit)
      return
    expect(unit.calculateValue(UnitCalc.Manpower)).toEqual(manpower)
    expect(unit.calculateValue(UnitCalc.Morale)).toEqual(morale)
  }
  const verify = (manpower_a: number, morale_a: number, manpower_d: number, morale_d: number) => {
    verifySub(attacker.army.getIn([0, 15]), manpower_a, morale_a)
    verifySub(defender.army.getIn([0, 15]), manpower_d, morale_d)
  }
  const doRound = () => {
    round++
    const [attacker_new_army, defender_new_army] = battle(attacker, defender, round, terrain)
    attacker = { ...attacker, army: attacker_new_army }
    defender = { ...defender, army: defender_new_army }
  }
  const setRolls = (roll_a: number, roll_d: number) => {
    attacker = { ...attacker, roll: roll_a }
    defender = { ...defender, roll: roll_d }
  }
  const setTactics = (tactic_a: TacticType, tactic_d: TacticType) => {
    attacker = { ...attacker, tactic: tactics.get(tactic_a)! }
    defender = { ...defender, tactic: tactics.get(tactic_d)! }
  }
  const setUnits = (unit_a: UnitDefinition, unit_b: UnitDefinition) => {
    attacker = { ...attacker, army: attacker.army.setIn([0, 15], unit_a) }
    defender = { ...defender, army: defender.army.setIn([0, 15], unit_b) }
  }

  it('should work with extra casualties 1', () => {
    setTactics(TacticType.ShockAction, TacticType.ShockAction)
    setRolls(1, 5)
    doRound()
    verify(957, 1.995, 981, 2.220)
    doRound()
    verify(915, 1.630, 963, 2.080)
    doRound()
    verify(874, 1.295, 946, 1.970)
    doRound()
    verify(834, 0.983, 930, 1.888)
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
    verify(972, 2.130, 957, 1.995)
    doRound()
    verify(945, 1.919, 916, 1.649)
    doRound()
    verify(919, 1.753, 876, 1.344)
    doRound()
    // Missed results.
    doRound()
    verify(870, 1.524, 799, 0.833)
    setRolls(5, 2)
    doRound()
    verify(848, 1.452, 766, 0.637)
    doRound()
    verify(827, 1.400, 734, 0.454)
    doRound()
    verify(806, 1.365, 703, 0.282)
  })
  it('should work with counters', () => {
    setTactics(TacticType.Skirmishing, TacticType.Bottleneck)
    setRolls(5, 2)
    doRound()
    verify(984, 2.159, 974, 2.005)
    doRound()
    verify(969, 1.963, 949, 1.657)
    doRound()
    verify(954, 1.806, 924, 1.346)
    doRound()
    verify(940, 1.683, 899, 1.065)
    doRound()
    verify(926, 1.588, 875, 0.807)
    setRolls(2, 4)
    doRound()
    verify(908, 1.495, 860, 0.657)
    doRound()
    // Missed results.
    doRound()
    verify(872, 1.363, 832, 0.392)
    doRound()
    verify(855, 1.321, 818, 0.272)
  })
})


export default null
