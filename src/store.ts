import { applyMiddleware, createStore } from 'redux'
import { fromJS, Map, List } from 'immutable'
import { AppState, rootReducer } from './store/'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { tacticFromJS, TacticType } from './store/tactics'
import { terrainFromJS, TerrainType } from './store/terrains'
import { unitFromJS, ArmyName, UnitType } from './store/units'

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
    const terrains = fromJS(outboundState.terrains).map((value: any) => terrainFromJS(value)!)

    const serializeUnits = (raw: List<List<any>>) => raw.map(value => value.map(value => unitFromJS(value)))

    const serializeParticipant = (participant: any) => {
      let army = serializeUnits(fromJS(participant.army)).take(1)
      let reserve = serializeUnits(fromJS(participant.reserve))
      let defeated = serializeUnits(fromJS(participant.defeated))
      let past: List<Map<string, any>> = fromJS(participant.past)
      let past3 = past.map(value => ({
        army: value.get('army') as List<List<any>>,
        reserve: value.get('reserve') as List<List<any>>,
        defeated: value.get('defeated') as List<List<any>>,
        roll: value.get('roll') as number
      }))
      let past2 = past3.map(value => ({ army: serializeUnits(value.army).take(1), reserve: serializeUnits(value.reserve), defeated: serializeUnits(value.defeated), roll: value.roll }))
      return {
        ...participant,
        army: army,
        reserve: reserve,
        defeated: defeated,
        past: past2,
        tactic: tacticFromJS(fromJS(participant.tactic))
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
  storage,
  transforms: [TacticsTransform, TerrainsTransform, LandTransform, UnitsTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default function configureStore(initialState: AppState) {
  const store = createStore(
    persistedReducer,
    initialState,
    applyMiddleware(logger)
  )
  let persistor = persistStore(store)
  return { store, persistor }
}
