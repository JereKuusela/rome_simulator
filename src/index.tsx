import React from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css'
import './index.css';
import Main from './Root';
import configureStore from './store'
import * as serviceWorker from './serviceWorker';

const initialState = (window as any).initialReduxState;
const store = configureStore(initialState)

ReactDOM.render(<Main store={store} />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
