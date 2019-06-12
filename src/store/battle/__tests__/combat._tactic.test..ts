import { battle } from '../combat'
import { List, Map } from 'immutable'
import { getInitialArmy, Participant } from '../../land_battle/types'
import { getDefaultDefinitions as getDefaultTacticDefinitions, TacticType } from '../../tactics'
import { getDefaultDefinitions as getDefaultTerrainDefinitions, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultDefinitions as getDefaultUnitDefinitions, getDefaultGlobalDefinition, UnitType, UnitCalc, UnitDefinition, ArmyName } from '../../units'
import { addModifierValue, mergeValues } from '../../../base_definition'
import { settingsState } from '../../settings'
import { verifyCenterUnits, setRolls, setTactics, setCenterUnits } from './utils'

describe('1 vs 1', () => {
  const global_stats = getDefaultGlobalDefinition()
  const tactics = getDefaultTacticDefinitions()
  const terrains = getDefaultTerrainDefinitions()
  const units = getDefaultUnitDefinitions().map(unit => mergeValues(unit, global_stats))
  const unit = addModifierValue(units.get(UnitType.Archers)!, 'Initial', UnitCalc.Morale, -0.2)
  const definitions = Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, units).set(ArmyName.Defender, units)
  const settings = settingsState.combat

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant
  }
  let terrain: List<TerrainDefinition>
  let round: number

  beforeEach(() => {
    info.attacker = getInitialArmy()
    info.defender = getInitialArmy()
    terrain = List<TerrainDefinition>().push(terrains.get(TerrainType.Forest)!)
    setCenterUnits(info, unit, unit)
    round = 0
  })
  const doRound = () => {
    round++
    const [a, d] = battle(definitions, { ...info.attacker, tactic: tactics.get(info.attacker.tactic)! }, { ...info.defender, tactic: tactics.get(info.defender.tactic)! }, round, terrain, settings)
    info.attacker = { ...info.attacker, ...a }
    info.defender = { ...info.defender, ...d }
  }

  it('should work with extra casualties 1', () => {
    setTactics(info, TacticType.ShockAction, TacticType.ShockAction)
    setRolls(info, 1, 5)
    doRound()
    verifyCenterUnits(info, 957, 1.994, 981, 2.220)
    doRound()
    verifyCenterUnits(info, 915, 1.630, 963, 2.080)
    doRound()
    verifyCenterUnits(info, 874, 1.294, 946, 1.970)
    doRound()
    verifyCenterUnits(info, 834, 0.982, 930, 1.888)
    doRound()
    verifyCenterUnits(info, 794, 0.690, 915, 1.828)
    setRolls(info, 1, 6)
    doRound()
    verifyCenterUnits(info, 751, 0.378, 900, 1.790)
  })
  it('should work with extra casualties 2', () => {
    setTactics(info, TacticType.ShockAction, TacticType.ShockAction)
    setRolls(info, 6, 2)
    doRound()
    verifyCenterUnits(info, 972, 2.130, 957, 1.994)
    doRound()
    verifyCenterUnits(info, 945, 1.918, 916, 1.648)
    doRound()
    verifyCenterUnits(info, 919, 1.752, 876, 1.344)
    doRound()
    // Missed results.
    doRound()
    verifyCenterUnits(info, 870, 1.524, 799, 0.832)
    setRolls(info, 5, 2)
    doRound()
    verifyCenterUnits(info, 848, 1.452, 766, 0.636)
    doRound()
    verifyCenterUnits(info, 827, 1.400, 734, 0.454)
    doRound()
    verifyCenterUnits(info, 806, 1.364, 703, 0.282)
  })
  it('should work with counters', () => {
    setTactics(info, TacticType.Skirmishing, TacticType.Bottleneck)
    setRolls(info, 5, 2)
    doRound()
    verifyCenterUnits(info, 984, 2.158, 974, 2.004)
    doRound()
    verifyCenterUnits(info, 969, 1.962, 949, 1.656)
    doRound()
    verifyCenterUnits(info, 954, 1.806, 924, 1.346)
    doRound()
    verifyCenterUnits(info, 940, 1.682, 899, 1.064)
    doRound()
    verifyCenterUnits(info, 926, 1.588, 875, 0.806)
    setRolls(info, 2, 4)
    doRound()
    verifyCenterUnits(info, 908, 1.494, 860, 0.656)
    doRound()
    // Missed results. Results below may not be correct...
    doRound()
    verifyCenterUnits(info, 872, 1.362, 832, 0.394)
    doRound()
    verifyCenterUnits(info, 855, 1.320, 818, 0.274)
  })
})


export default null
