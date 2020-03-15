import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import { rootReducer, restoreBaseTactics, restoreBaseTerrains, restoreBaseUnits, stripRounds, setIds, restoreBaseSettings } from 'state'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

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

const BattleTransform = createTransform(
  (inboundState: any) => stripRounds(inboundState),
  (outboundState: any) => outboundState,
  { whitelist: ['battle'] }
)

const CountriesTransform = createTransform(
  (inboundState: any) => inboundState,
  (outboundState: any) => setIds(outboundState),
  { whitelist: ['countries'] }
)

const SettingsTransform = createTransform(
  (inboundState: any) => inboundState,
  (outboundState: any) => restoreBaseSettings(outboundState),
  { whitelist: ['settings'] }
)

const DataTransform = createTransform(
  () => undefined,
  () => ({}),
  { whitelist: ['data'] }
)

const migrations = {
  9: () => rootReducer(undefined, { type: 'fooo'}) as any
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 9,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [
    TacticsTransform,
    TerrainsTransform,
    UnitsTransform,
    DataTransform,
    BattleTransform,
    CountriesTransform,
    SettingsTransform
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
