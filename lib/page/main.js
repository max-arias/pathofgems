import React from "/web_modules/react.js";
import Input from "../components/input.js";
export default () => {
  return React.createElement(
    "div",
    {
      className: "grid lg:grid-cols-1_5_1 mt-24",
      style: {
        height: "calc(100vh - 6rem)",
      },
    },
    React.createElement(Input, null)
  );
};
