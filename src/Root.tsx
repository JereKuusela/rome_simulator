import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import UnitPage from './pages/Units'
import LandPage from './pages/Land'
import ModalUnitDetail from './containers/ModalUnitDetail'
import { AppState } from './store/'

// Any additional component props go here.
interface MainProps {
  store: Store<AppState>
}

// Create an intersection type of the component props and our Redux props.
const Root = ({ store }: MainProps) => {
  return (
    <Provider store={store}>
      <ModalUnitDetail />
      <BrowserRouter>
        <Route path='/' component={LandPage} />
        <Route path='/Units' component={UnitPage} />
      </BrowserRouter>
    </Provider>
  )
}

export default Root
