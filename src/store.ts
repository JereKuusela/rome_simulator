import { applyMiddleware, createStore } from 'redux'
import { rootReducer } from './store/'
import logger from 'redux-logger'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
//import localForage from 'localforage'
import { transformGlobalStats, transformLand, transformTactics, transformTerrains, transformUnits, transfromTransfer } from './store/transforms'


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

const persistConfig = {
  key: 'primary',
  storage: storage,
  transforms: [TacticsTransform, TerrainsTransform, LandTransform, UnitsTransform, TransferTransform, GlobalStatsTransform]
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
