import React from 'react'
import ReactDOM from 'react-dom'
import 'semantic-ui-css/semantic.min.css'
import './index.css'
import Main from './Root'
import configureStore from 'store/store'

const store = configureStore()

ReactDOM.render(<Main store={store.store} persistor={store.persistor} />, document.getElementById('root'))
