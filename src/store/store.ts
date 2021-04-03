import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import { rootReducer, AppState } from 'reducers'
import { persistStore, persistReducer, createTransform, createMigrate } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { map } from 'utils'
import { CountryDefinitions, ModeState, Settings, TacticsData, TerrainsData } from 'types'
import { initialize } from 'managers/combat'
import { PersistPartial } from 'redux-persist/es/persistReducer'
import { Reducer } from 'react'
import { Action } from 'reducers/utils'
import {
  restoreDefaultTactics,
  restoreDefaultTerrains,
  stripRounds,
  restoreDefaultUnits,
  restoreDefaultSettings
} from 'store/transforms'

const TacticsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: TacticsData) => restoreDefaultTactics(outboundState),
  { whitelist: ['tactics'] }
)

const TerrainsTransform = createTransform(
  inboundState => inboundState,
  (outboundState: TerrainsData) => restoreDefaultTerrains(outboundState),
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
  (outboundState: Settings) => restoreDefaultSettings(outboundState),
  { whitelist: ['settings'] }
)

const migrations = {
  11: () => rootReducer(undefined, { type: 'dummy' }) as never
}

const persistConfig = {
  key: 'primary',
  storage: storage,
  version: 11,
  migrate: createMigrate(migrations, { debug: false }),
  transforms: [TacticsTransform, TerrainsTransform, BattleTransform, CountriesTransform, SettingsTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

type State = (AppState & PersistPartial) | undefined

const reducer: Reducer<State, Action> = (state, action) => {
  const result = persistedReducer(state, action) as State
  return initialize(result) as State
}

export default function configureStore() {
  const store = createStore(reducer as never, devToolsEnhancer({}))
  const persistor = persistStore(store)
  return { store, persistor }
}
