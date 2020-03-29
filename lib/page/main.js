import React, { useState } from "/web_modules/react.js";
import { githubRawUrl } from "../utils/url.js";
import Input from "../components/Input.js";
import TimelineContainer from "../components/timeline/Container.js";
import PreviousBuild from "../components/PreviousBuild.js";
export default (() => {
  const [buildUrl, setBuildUrl] = useState(false);
  const previousData = Object.keys(localStorage).reduce((acc, item) => {
    return { ...acc,
      [item]: JSON.parse(localStorage.getItem(item))
    };
  }, {});

  const changeCallback = data => {
    const corsUrl = githubRawUrl(data);
    setBuildUrl(corsUrl);
  };

  if (buildUrl) {
    return React.createElement(TimelineContainer, {
      buildUrl: buildUrl
    });
  }

  const showPreviousBuilds = () => {
    if (!previousData || !Object.keys(previousData).length) {
      return null;
    }

    return React.createElement("div", {
      className: "flex flex-col mt-8"
    }, React.createElement("h2", {
      className: "text-center text-2xl mb-4"
    }, "Previous builds"), React.createElement("div", {
      className: "flex flex-row"
    }, Object.keys(previousData).map(key => React.createElement(PreviousBuild, {
      url: key,
      build: previousData[key].build,
      loadBuild: changeCallback
    }))));
  };

  return React.createElement("div", {
    className: "grid lg:grid-cols-1_5_1 mt-24",
    style: {
      height: 'calc(100vh - 6rem)'
    }
  }, React.createElement("div", {
    className: "lg:col-start-2 flex items-center flex-col"
  }, React.createElement("div", {
    className: "relative h-10 w-4/5 lg:w-2/4"
  }, React.createElement(Input, {
    onChange: changeCallback
  }), showPreviousBuilds())));
});