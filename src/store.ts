import { applyMiddleware, createStore } from 'redux'
import { fromJS, Map, List } from 'immutable'
import { rootReducer } from './store/'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import localForage from 'localforage'
import { tacticFromJS, TacticType } from './store/tactics'
import { terrainFromJS, TerrainType } from './store/terrains'
import { unitFromJS, ArmyName, UnitType } from './store/units'
import { RowType, getInitialTerrains } from './store/land_battle'


const TacticsTransform = createTransform(
  (inboundState, _key) => inboundState,
  (outboundState: any, key) => {
    let tactics: Map<TacticType, any> = fromJS(outboundState.tactics)
    let tactics2 = tactics.map(value => tacticFromJS(value)!)
    return { ...outboundState, tactics: tactics2 }
  },
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  (inboundState, _key) => inboundState,
  (outboundState: any, key) => {
    let terrains: Map<TerrainType, any> = fromJS(outboundState.terrains)
    let terrains2 = terrains.map(value => terrainFromJS(value)!)
    return { ...outboundState, terrains: terrains2 }
  },
  { whitelist: ['terrains'] }
)

const UnitsTransform = createTransform(
  (inboundState, _key) => inboundState,
  (outboundState: any, key) => {
    let unit: Map<ArmyName, Map<UnitType, any>> = fromJS(outboundState.units)
    let unit2 = unit.map(value => value.map(value2 => unitFromJS(value2)!))
    let global: Map<ArmyName, any> = fromJS(outboundState.global_stats)
    let global2 = global.map(value => unitFromJS(value)!)
    return { ...outboundState, units: unit2, global_stats: global2 }
  },
  { whitelist: ['units'] }
)

const LandTransform = createTransform(
  (inboundState, _key) => inboundState,
  (outboundState: any, key) => {
    // Terrain can be null (corrupted), TerrainDefinition (old) or TerrainType.
    let terrains_raw: List<any> = fromJS(outboundState.terrains)
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
    const attacker = serializeParticipant(outboundState.attacker)
    const defender = serializeParticipant(outboundState.defender)
    return { ...outboundState, terrains, attacker, defender }
  },
  { whitelist: ['land'] }
)

const persistConfig = {
  key: 'primary',
  storage: localForage,
  transforms: [TacticsTransform, TerrainsTransform, LandTransform, UnitsTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default function configureStore() {
  const store = createStore(
    persistedReducer,
    applyMiddleware(logger)
  )
  let persistor = persistStore(store)
  return { store, persistor }
}
