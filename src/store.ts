import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import { rootReducer } from './store/'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import { refreshBattle } from './store/battle'
import storage from 'redux-persist/lib/storage'
//import localForage from 'localforage'
import {
  transformCountries, transformSettings, transformGlobalStats, transformBattle, transformTactics, transformTerrains, transformUnits, transfromTransfer,
  stripRounds
} from './store/transforms'

const TacticsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transformTactics(outboundState),
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transformTerrains(outboundState),
  { whitelist: ['terrains'] }
)

const UnitsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transformUnits(outboundState),
  { whitelist: ['units'] }
)

const GlobalStatsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transformGlobalStats(outboundState),
  { whitelist: ['global_stats'] }
)

const SettingsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transformSettings(outboundState),
  { whitelist: ['settings'] }
)

const TransferTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transfromTransfer(outboundState),
  { whitelist: ['transfer'] }
)

const BattleTransform = createTransform(
  (inboundState: any) => stripRounds(inboundState),
  (outboundState: any) => transformBattle(outboundState),
  { whitelist: ['battle'] }
)

const CountriesTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => transformCountries(outboundState),
  { whitelist: ['countries'] }
)

const DataTransform = createTransform(
  (inboundState) => undefined,
  (outboundState) => ({}),
  { whitelist: ['data'] }
)

const migrations = {
  4: (_: any) => ({})
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 4,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [
    SettingsTransform,
    TacticsTransform,
    TerrainsTransform,
    BattleTransform,
    UnitsTransform,
    GlobalStatsTransform,
    TransferTransform,
    CountriesTransform,
    DataTransform
  ]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const callback = (store: any) => {
  store.dispatch(refreshBattle())
  return 1
}

export default function configureStore() {
  const store = createStore(
    persistedReducer, devToolsEnhancer({})
  )
  let persistor = persistStore(store, undefined, () => callback(store))
  return { store, persistor }
}
