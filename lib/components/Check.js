import React from "/web_modules/react.js";
export default (({
  checkToggle,
  checked,
  gemId
}) => {
  return React.createElement("button", {
    className: "cursor-pointer z-10",
    onClick: () => checkToggle(gemId)
  }, React.createElement("i", {
    className: `gg-check ${checked ? 'bg-green-500' : ''}`
  }));
});