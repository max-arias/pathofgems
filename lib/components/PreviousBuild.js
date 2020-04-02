import React from "/web_modules/react.js";
import Avatar from "./Avatar.js";
export default (({
  url,
  build,
  loadBuild
}) => {
  let buildClass = `${build.className} - ${build.ascendancyName}`;

  if (build.ascendancyName === 'None') {
    buildClass = build.className;
  }

  return React.createElement("div", {
    className: "flex w-1/2"
  }, React.createElement(Avatar, {
    buildName: build.className,
    ascendancyName: build.ascendancyName
  }), React.createElement("div", {
    className: "flex flex-col justify-center"
  }, React.createElement("span", null, buildClass), React.createElement("span", {
    className: "cursor-pointer underline",
    onClick: () => loadBuild(url)
  }, url)));
});