import React from "/web_modules/react.js";
import Avatar from "./Avatar.js";
export default (({
  url,
  build,
  loadBuild
}) => {
  return React.createElement("div", {
    className: "flex w-1/2"
  }, React.createElement(Avatar, {
    buildClass: build.ascendancyName
  }), React.createElement("div", {
    className: "flex flex-col justify-center"
  }, React.createElement("span", null, build.className, " - ", build.ascendancyName), React.createElement("span", {
    className: "cursor-pointer",
    onClick: () => loadBuild(url)
  }, url)));
});