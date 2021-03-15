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
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { map } from 'utils'
import { CountryDefinitions, ModeState, SettingsAndOptions, TacticDefinitions, TerrainDefinitions } from 'types'

const TacticsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: TacticDefinitions) => restoreDefaultTactics(outboundState),
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: TerrainDefinitions) => restoreDefaultTerrains(outboundState),
  { whitelist: ['terrains'] }
)

const BattleTransform = createTransform(
  (inboundState: ModeState) => stripRounds(inboundState),
  outboundState => outboundState,
  { whitelist: ['battle'] }
)

const CountriesTransform = createTransform(
  inboundState => inboundState,
  (outboundState: CountryDefinitions) =>
    map(outboundState, country => ({ ...country, units: restoreDefaultUnits(country.units) })),
  { whitelist: ['countries'] }
)

const SettingsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: SettingsAndOptions) => restoreDefaultSettings(outboundState),
  { whitelist: ['settings'] }
)

const IgnoreTransform = createTransform(
  () => undefined,
  () => ({}),
  { whitelist: ['data'] }
)

const migrations = {
  11: () => rootReducer(undefined, { type: 'dummy' }) as never
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

export default function configureStore() {
  const store = createStore(persistedReducer, devToolsEnhancer({}))
  const persistor = persistStore(store)
  return { store, persistor }
}
