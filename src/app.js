import React from 'react'
import ReactDOM from 'react-dom'

import Main from './page/main.js'
import ErrorBoundary from './ErrorBoundary.js'

const App = () => <ErrorBoundary><Main /></ErrorBoundary>

ReactDOM.render(<App />, document.getElementById('app'))
