import React from "/web_modules/react.js";
export default (({
  url,
  classAndAscendancy
}) => {
  return React.createElement("div", null, React.createElement("span", null, classAndAscendancy), React.createElement("span", null, url));
});