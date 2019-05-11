import { Store, createStore } from 'redux'
import { AppState, rootReducer } from './store/'

export default function configureStore(initialState: AppState): Store<AppState> {
  return createStore(
    rootReducer,
    initialState
  )
}
