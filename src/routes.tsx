import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import IndexPage from './pages/Index'

const Routes: React.SFC = () => (
  <Switch>
    <Route exact path="/" component={IndexPage} />
    <Route component={() => <div>Not Found</div>} />
  </Switch>
)

export default Routes
