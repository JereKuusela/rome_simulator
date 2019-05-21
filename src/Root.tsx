import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import UnitPage from './pages/Units'
import LandPage from './pages/Land'
import TacticPage from './pages/Tactics'
import TerrainPage from './pages/Terrains'
import Navigation from './pages/Navigation'
import Initializer from './pages/Initializer'
import { AppState } from './store/'

// Any additional component props go here.
interface MainProps {
  store: Store<AppState>
}

// Create an intersection type of the component props and our Redux props.
const Root = ({ store }: MainProps) => {
  return (
    <Provider store={store}>
      <Initializer /> 
      <BrowserRouter>
        <Navigation />
        <Route path='/' exact component={LandPage} />
        <Route path='/Units' component={UnitPage} />
        <Route path='/Tactics' component={TacticPage} />
        <Route path='/Terrains' component={TerrainPage} />
      </BrowserRouter>
    </Provider>
  )
}

export default Root
