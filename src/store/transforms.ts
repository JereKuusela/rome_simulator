import { fromJS, Map, List } from 'immutable'
import { tacticFromJS, TacticType, tacticsState } from './tactics'
import { terrainFromJS, TerrainType, terrainState } from './terrains'
import { unitDefinitionFromJS, unitFromJS, ArmyName, UnitType, unitsState, globalStatsState } from './units'
import { RowType, getInitialTerrains, initialState } from './land_battle'

export const transformTactics = (state_raw: any) => {
  if (!state_raw)
    return tacticsState
  let tactics_raw: Map<TacticType, any> = fromJS(state_raw)
  let tactics = tactics_raw.map(value => tacticFromJS(value)!)
  return tactics
}

export const transformTerrains = (state_raw: any) => {
  if (!state_raw)
    return terrainState
  let terrains_raw: Map<TerrainType, any> = fromJS(state_raw)
  let terrains = terrains_raw.map(value => terrainFromJS(value)!)
  return terrains
}

export const transformUnits = (state_raw: any) => {
  if (!state_raw)
    return unitsState
  let units_raw: Map<ArmyName, Map<UnitType, any>> = fromJS(state_raw)
  let units = units_raw.map(value => value.map(value => unitDefinitionFromJS(value)!))
  return units
}

export const transformGlobalStats = (state_raw: any) => {
  if (!state_raw)
    return globalStatsState
  let global_stats_raw: Map<ArmyName, any> = fromJS(state_raw)
  let global_stats = global_stats_raw.map(value => unitDefinitionFromJS(value)!)
  return global_stats
}

export const transformLand = (state_raw: any) => {
  if (!state_raw)
    return initialState
  // Terrain can be null (corrupted), TerrainDefinition (old) or TerrainType.
  let terrains_raw: List<any> = fromJS(state_raw.terrains)
  let terrains: List<TerrainType>
  if (terrains_raw.contains(null))
    terrains = getInitialTerrains()
  else
    terrains = terrains_raw.map((value: any) => typeof value === 'string' ? value : value.type)

  const serializeUnits = (raw: List<any>) => raw.map(value => unitFromJS(value))

  const serializeParticipant = (participant: any) => {
    let army = serializeUnits(fromJS(participant.army)).setSize(30)
    let reserve = serializeUnits(fromJS(participant.reserve)).filter(value => value)
    let defeated = serializeUnits(fromJS(participant.defeated)).filter(value => value)
    let past4: List<Map<string, any>> = fromJS(participant.past)
    let past3 = past4.map(value => ({
      army: value.get('army') as List<any>,
      reserve: value.get('reserve') as List<any>,
      defeated: value.get('defeated') as List<any>,
      roll: value.get('roll') as number
    }))
    let row_types: Map<RowType, UnitType>
    if (participant.row_types)
      row_types = fromJS(participant.row_types)
    else
      row_types = Map<RowType, UnitType>().set(RowType.Front, UnitType.Archers).set(RowType.Back, UnitType.HeavyInfantry).set(RowType.Flank, UnitType.LightCavalry)
    let past = past3.map(value => ({ army: serializeUnits(value.army).setSize(30), reserve: serializeUnits(value.reserve).filter(value => value), defeated: serializeUnits(value.defeated).filter(value => value), roll: value.roll }))
    let tactic = participant.tactic
    // Tactic can be null (corrupted), TacticDefition (old) or TacticType.
    if (!tactic)
      tactic = TacticType.ShockAction
    if (typeof tactic !== 'string')
      tactic = tactic.type
    return {
      ...participant,
      army,
      reserve,
      defeated,
      past,
      row_types,
      tactic
    }
  }
  const attacker = serializeParticipant(state_raw.attacker)
  const defender = serializeParticipant(state_raw.defender)
  return { ...state_raw, terrains, attacker, defender }
}

export const transfromTransfer = (state_raw: any) => {
  const export_keys = fromJS(state_raw.export_keys || {})
  const reset_missing = state_raw.reset_missing
  return { reset_missing, export_keys }
}