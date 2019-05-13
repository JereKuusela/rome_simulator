import * as React from 'react'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import { BrowserRouter, Route } from 'react-router-dom'
import IndexPage from './pages/Index'
import UnitModal from './components/UnitModal'
import { AppState } from './store/'

// Any additional component props go here.
interface MainProps {
  store: Store<AppState>
}

// Create an intersection type of the component props and our Redux props.
const Root = ({ store }: MainProps) => {
  return (
    <Provider store={store}>
      <UnitModal />
      <BrowserRouter>
        <Route path='/' component={IndexPage} />
      </BrowserRouter>
    </Provider>
  )
}

export default Root
