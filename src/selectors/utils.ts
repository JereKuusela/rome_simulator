import { createSelectorHook, TypedUseSelectorHook } from 'react-redux'
import type { AppState } from 'reducers'
import { CountryName, ArmyName } from 'types'

export const useSelector: TypedUseSelectorHook<AppState> = createSelectorHook()

export const getKey = <T>(_: unknown, key: T) => key ?? ''

export type ArmyKey = { countryName: CountryName; armyName: ArmyName }
export const getArmyKey = (_: AppState, key: ArmyKey) => key.countryName + '|' + key.armyName

/**
 * This is intended for quick optimizations with reselect.
 * For example when a selector is called multiple times with the same state.
 */
export const getState = (state: AppState) => state
