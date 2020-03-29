import React from "/web_modules/react.js";
import ReactDOM from "/web_modules/react-dom.js";
import Main from "./page/main.js";
import ErrorBoundary from "./ErrorBoundary.js";

const App = () => React.createElement(ErrorBoundary, null, React.createElement(Main, null));

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));