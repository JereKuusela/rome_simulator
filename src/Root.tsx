import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Definitions from './pages/Definitions'
import Battle from './pages/Battle'
import Navigation from './pages/Navigation'
import CountriesIR from './pages/CountriesIR'
import CountriesEU4 from './pages/CountriesEU4'
import Settings from './pages/Settings'
import Error from './pages/Error'
import { AppState } from 'state'
import Analyze from './pages/Analyze'
import SaveTool from 'pages/SaveTool'
import ExportTool from 'pages/ExportTool'
import { Container } from 'semantic-ui-react'
import Modals from 'pages/Modals'
import { Persistor } from 'redux-persist'

// Any additional component props go here.
interface MainProps {
  store: Store<AppState>
  persistor: Persistor
}

// Create an intersection type of the component props and our Redux props.
const Root = ({ store, persistor }: MainProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Error>
          <BrowserRouter>
            <Container style={{ width: 1280 }}>
              <Modals />
              <Route path='/' component={Navigation} />
              <Route path='/' exact component={Battle} />
              <Route path='/Definitions' component={Definitions} />
              <Route path='/Analyze' component={Analyze} />
              <Route path='/Countries' component={process.env.REACT_APP_GAME === 'EU4' ? CountriesEU4 : CountriesIR} />
              <Route path='/Settings' component={Settings} />
              <Route path='/Import' component={SaveTool} />
              <Route path='/Export' component={ExportTool} />
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
