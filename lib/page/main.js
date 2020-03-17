import React from "/web_modules/react.js";
import Input from "../components/input.js";
export default (() => {
  return React.createElement("div", {
    className: "grid grid-cols-1_5_1 h-screen"
  }, React.createElement(Input, null));
});