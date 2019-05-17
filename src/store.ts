import { Store, applyMiddleware, createStore } from 'redux'
import { AppState, rootReducer } from './store/'
import logger from 'redux-logger'

export default function configureStore(initialState: AppState): Store<AppState> {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(logger)
  )
}
