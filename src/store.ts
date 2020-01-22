import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import { rootReducer } from './store/'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {
  restoreBaseGlobalStats, restoreBaseTactics, restoreBaseTerrains, restoreBaseUnits, stripRounds, setIds
} from './store/transforms'
import { forEach } from 'utils'
import { UnitDefinitions } from 'reducers'
import { UnitType, Setting } from 'types'
import { DefinitionType } from 'base_definition'

const TacticsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => restoreBaseTactics(outboundState),
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => restoreBaseTerrains(outboundState),
  { whitelist: ['terrains'] }
)

const UnitsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => restoreBaseUnits(outboundState),
  { whitelist: ['units'] }
)

const GlobalStatsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => restoreBaseGlobalStats(outboundState),
  { whitelist: ['global_stats'] }
)

const BattleTransform = createTransform(
  (inboundState: any) => stripRounds(inboundState),
  (outboundState: any) => setIds(outboundState),
  { whitelist: ['battle'] }
)

const DataTransform = createTransform(
  () => undefined,
  () => ({}),
  { whitelist: ['data'] }
)

const migrations = {
  6: (state: any) => {
    forEach(state.units, (definitions: UnitDefinitions) => definitions[UnitType.SupplyTrain] = {} as any)
    return state
  },
  7: (state: any) => {
    state.settings.combat[DefinitionType.Land][Setting.BaseDamage] = 0.096
    state.settings.combat[DefinitionType.Naval][Setting.BaseDamage] = 0.096
    state.settings.combat[DefinitionType.Land][Setting.RollDamage] = 0.024
    state.settings.combat[DefinitionType.Naval][Setting.RollDamage] = 0.024
    state.settings.combat[DefinitionType.Land][Setting.MaxBaseDamage] = 0.36
    state.settings.combat[DefinitionType.Naval][Setting.MaxBaseDamage] = 0.36
    return state
  }
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 7,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [
    TacticsTransform,
    TerrainsTransform,
    UnitsTransform,
    GlobalStatsTransform,
    DataTransform,
    BattleTransform
  ]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default function configureStore() {
  const store = createStore(
    persistedReducer, devToolsEnhancer({})
  )
  let persistor = persistStore(store)
  return { store, persistor }
}
