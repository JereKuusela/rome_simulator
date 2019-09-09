import { doBattle } from '../combat'
import { getDefaultArmy, Army, Participant, getDefaultParticipant } from '../../battle'
import { getDefaultTactics, TacticType } from '../../tactics'
import { getDefaultTerrains, TerrainType, TerrainDefinition } from '../../terrains'
import { getDefaultUnits, getDefaultGlobals, UnitType, UnitCalc, UnitDefinition, BaseUnit } from '../../units'
import { addValues, ValuesType, mergeValues, DefinitionType } from '../../../base_definition'
import { verifyCenterUnits, setRolls, setTactics, setCenterUnits } from './utils'
import { CountryName } from '../../countries'
import { getSettings } from '../../utils'
import { getDefaultLandSettings } from '../../settings'
import { map } from '../../../utils'

describe('1 vs 1', () => {
  const global_stats = getDefaultGlobals()[DefinitionType.Land]
  const tactics = getDefaultTactics()
  const terrains = getDefaultTerrains()
  const units = map(getDefaultUnits(), unit => mergeValues(unit, global_stats))
  const unit = addValues(units[UnitType.Archers] as any as BaseUnit, ValuesType.Modifier, 'Initial', [[UnitCalc.Morale, -0.2]])
  const definitions = Map<CountryName, Map<UnitType, UnitDefinition>>().set(CountryName.Country1, units).set(CountryName.Country2, units)
  const settings = getDefaultLandSettings()

  let info = {
    attacker: null as any as Participant,
    defender: null as any as Participant,
    army_a: null as any as Army,
    army_d: null as any as Army,
    round: 0
  }
  let terrain: List<TerrainDefinition>

  beforeEach(() => {
    info.attacker = getDefaultParticipant(CountryName.Country1)
    info.defender = getDefaultParticipant(CountryName.Country2)
    info.army_a = getDefaultArmy(DefinitionType.Land)
    info.army_d = getDefaultArmy(DefinitionType.Land)
    terrain = List<TerrainDefinition>().push(terrains[TerrainType.Forest])
    setCenterUnits(info, unit, unit)
    info.round = 0
  })
  const doRound = () => {
    info.round = info.round + 1
    const [a, d] = doBattle(definitions, { ...info.attacker, ...info.army_a, tactic: tactics.get(info.army_a.tactic)!, country: CountryName.Country1, general: 0 }, { ...info.defender, ...info.army_d, tactic: tactics.get(info.army_d.tactic)!, country: CountryName.Country2, general: 0  }, info.round, terrain, settings)
    info.army_a = { ...info.army_a, ...a }
    info.army_d = { ...info.army_d, ...d }
  }

  /*it('should work with extra casualties 1', () => {
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
  })*/
  /*it('should work with extra casualties 2', () => {
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
  })*/
  /*it('should work with counters', () => {
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
  })*/
})


export default null
