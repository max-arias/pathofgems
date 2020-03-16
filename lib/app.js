import React from "/web_modules/react.js";
import ReactDOM from "/web_modules/react-dom.js";

const App = () => React.createElement("h1", null, "Hey!, world!");

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));