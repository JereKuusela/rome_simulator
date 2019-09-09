import { TacticDefinitions, getDefaultTactic } from './tactics'
import { TerrainDefinitions, getDefaultTerrain } from './terrains'
import { GlobalStats, Units, getDefaultUnit, getDefaultGlobal, GlobalKey } from './units'
import { ModeState } from './battle'
import { clearAllValues, mergeValues } from '../base_definition'
import { map } from '../utils'


export const restoreBaseTactics = (state: TacticDefinitions): TacticDefinitions => map(state, (tactic, type) => mergeValues(clearAllValues(tactic, type), getDefaultTactic(type)))
export const restoreBaseTerrains = (state: TerrainDefinitions): TerrainDefinitions => map(state, (terrain, type) => mergeValues(clearAllValues(terrain, type), getDefaultTerrain(type)))
export const restoreBaseUnits = (state: Units): Units => map(state, definitions => map(definitions, (unit, type) => mergeValues(clearAllValues(unit, type), getDefaultUnit(type))))
export const restoreBaseGlobalStats = (state: GlobalStats): GlobalStats => map(state, definitions => map(definitions, (global, type) => mergeValues(clearAllValues(global, GlobalKey), getDefaultGlobal(type))))

export const stripRounds = (battle: ModeState): ModeState => map(battle, value => ({ ...value, outdated: true, participants: map(value.participants, value => ({ ...value, rounds: [] })) }))
