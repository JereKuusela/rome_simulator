import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import {
  rootReducer,
  restoreDefaultTactics,
  restoreDefaultTerrains,
  restoreDefaultUnits,
  stripRounds,
  restoreDefaultSettings
} from 'state'
import { persistStore, persistReducer, createTransform, createMigrate, Persistor } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { map } from 'utils'

const TacticsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: any) => restoreDefaultTactics(outboundState),
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: any) => restoreDefaultTerrains(outboundState),
  { whitelist: ['terrains'] }
)

const BattleTransform = createTransform(
  (inboundState: any) => stripRounds(inboundState),
  (outboundState: any) => outboundState,
  { whitelist: ['battle'] }
)

const CountriesTransform = createTransform(
  (inboundState: any) => inboundState,
  (outboundState: any) =>
    map(outboundState, (country: any) => ({ ...country, units: restoreDefaultUnits(country.units) })),
  { whitelist: ['countries'] }
)

const SettingsTransform = createTransform(
  (inboundState: any) => inboundState,
  (outboundState: any) => restoreDefaultSettings(outboundState),
  { whitelist: ['settings'] }
)

const IgnoreTransform = createTransform(
  () => undefined,
  () => ({}),
  { whitelist: ['data'] }
)

const migrations = {
  11: () => rootReducer(undefined, { type: 'dummy' }) as any
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 11,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [
    TacticsTransform,
    TerrainsTransform,
    BattleTransform,
    CountriesTransform,
    SettingsTransform,
    IgnoreTransform
  ]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default function configureStore(): { store: any; persistor: Persistor } {
  const store = createStore(persistedReducer, devToolsEnhancer({}))
  const persistor = persistStore(store)
  return { store, persistor }
}
