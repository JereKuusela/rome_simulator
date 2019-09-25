import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Units from './pages/Units'
import Battle from './pages/Battle'
import Tactics from './pages/Tactics'
import Terrains from './pages/Terrains'
import Navigation from './pages/Navigation'
import Stats from './pages/Stats'
import Transfer from './pages/Transfer'
import Instructions from './pages/Instructions'
import Countries from './pages/Countries'
import Settings from './pages/Settings'
import Error from './pages/Error'
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
        <Error>
          <BrowserRouter>
            <Route path='/' component={Navigation} />
            <Route path='/' exact component={Battle} />
            <Route path='/Units' component={Units} />
            <Route path='/Tactics' component={Tactics} />
            <Route path='/Terrains' component={Terrains} />
            <Route path='/Stats' component={Stats} />
            <Route path='/Transfer' component={Transfer} />
            <Route path='/Instructions' component={Instructions} />
            <Route path='/Countries' component={Countries} />
            <Route path='/Settings' component={Settings} />
          </BrowserRouter>
        </Error>
      </PersistGate>
    </Provider>
  )
}

export default Root
