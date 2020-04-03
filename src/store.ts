import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import { rootReducer, restoreDefaultTactics, restoreDefaultTerrains, restoreDefaultUnits, stripRounds, setIds, restoreDefaultSettings } from 'state'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { map } from 'utils'

const TacticsTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState: any) => restoreDefaultTactics(outboundState),
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  (inboundState) => inboundState,
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
  (outboundState: any) => map(setIds(outboundState), country => ({...country, units: restoreDefaultUnits(country.units) })),
{ whitelist: ['countries'] }
)

const SettingsTransform = createTransform(
  (inboundState: any) => inboundState,
  (outboundState: any) => restoreDefaultSettings(outboundState),
  { whitelist: ['settings'] }
)

const DataTransform = createTransform(
  () => undefined,
  () => ({}),
  { whitelist: ['data', 'ui'] }
)

const migrations = {
  9: () => rootReducer(undefined, { type: 'dummy' }) as any
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 9,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [
    TacticsTransform,
    TerrainsTransform,
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
