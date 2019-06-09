import { applyMiddleware, createStore } from 'redux'
import { rootReducer } from './store/'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
//import localForage from 'localforage'
import { transformSettings, transformGlobalStats, transformLand, transformTactics, transformTerrains, transformUnits, transfromTransfer } from './store/transforms'
import { initialState } from './store/transfer'

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
  (outboundState: any) => transformLand(outboundState),
  { whitelist: ['land'] }
)

const migrations = {
  0: (_: any) => (initialState as any)
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 0,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [SettingsTransform, TacticsTransform, TerrainsTransform, LandTransform, UnitsTransform, TransferTransform, GlobalStatsTransform]
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
