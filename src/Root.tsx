import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import UnitPage from './pages/Units'
import LandPage from './pages/Battle'
import TacticPage from './pages/Tactics'
import TerrainPage from './pages/Terrains'
import Navigation from './pages/Navigation'
import Stats from './pages/Stats'
import Transfer from './pages/Transfer'
import Instructions from './pages/Instructions'
import Governments from './pages/Governments'
import Settings from './pages/Settings'
import { AppState } from './store/'

// Any additional component props go here.
interface MainProps {
  store: Store<AppState>
  persistor: any
}

// Create an intersection type of the component props and our Redux props.
const Root = ({ store, persistor }: MainProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <Route path='/' component={Navigation} />
        <Route path='/' exact component={LandPage} />
        <Route path='/Units' component={UnitPage} />
        <Route path='/Tactics' component={TacticPage} />
        <Route path='/Terrains' component={TerrainPage} />
        <Route path='/Stats' component={Stats} />
        <Route path='/Transfer' component={Transfer} />
        <Route path='/Instructions' component={Instructions} />
        <Route path='/Governments' component={Governments} />
        <Route path='/Settings' component={Settings} />
      </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

export default Root
