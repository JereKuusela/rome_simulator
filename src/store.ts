import { applyMiddleware, createStore } from 'redux'
import { rootReducer } from './store/'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
//import localForage from 'localforage'
import { transformCountries, transformSettings, transformGlobalStats, transformBattle, transformTactics, transformTerrains, transformUnits, transfromTransfer } from './store/transforms'

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

const LandTransform = createTransform(
  (inboundState) => inboundState,
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
  3: (_: any) => ({})
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 3,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [
    SettingsTransform,
    TacticsTransform,
    TerrainsTransform,
    LandTransform,
    UnitsTransform,
    GlobalStatsTransform,
    TransferTransform,
    CountriesTransform,
    DataTransform
  ]
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
