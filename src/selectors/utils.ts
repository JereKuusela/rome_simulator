import { createSelectorHook, TypedUseSelectorHook } from 'react-redux'
import { AppState } from 'state'
import { CountryName, ArmyName } from 'types'

export const useSelector: TypedUseSelectorHook<AppState> = createSelectorHook()

export const getKey = <T>(_: unknown, key: T) => key ?? ''

export type ArmyKey = { countryName: CountryName; armyName: ArmyName }
export const getArmyKey = (_: AppState, key: ArmyKey) => key.countryName + '|' + key.armyName
