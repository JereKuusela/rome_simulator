import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Definitions from './pages/Definitions'
import Battle from './pages/Battle'
import Navigation from './pages/Navigation'
import Transfer from './pages/Transfer'
import Countries from './pages/Countries'
import CountriesEUIV from './pages/CountriesEU'
import Settings from './pages/Settings'
import Error from './pages/Error'
import { AppState } from 'state'
import Analyze from './pages/Analyze'
import { Container } from 'semantic-ui-react'
import Modals from 'pages/Modals'

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
            <Container>
              <Modals/>
              <Route path='/' component={Navigation} />
              <Route path='/' exact component={Battle} />
              <Route path='/Definitions' component={Definitions} />
              <Route path='/Analyze' component={Analyze} />
              <Route path='/Transfer' component={Transfer} />
              <Route path='/Countries' component={process.env.REACT_APP_GAME === 'euiv' ? CountriesEUIV : Countries} />
              <Route path='/Settings' component={Settings} />
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </Container>
          </BrowserRouter>
        </Error>
      </PersistGate>
    </Provider>
  )
}

export default Root
