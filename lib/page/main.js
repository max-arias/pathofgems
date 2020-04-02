import React, { useState } from "/web_modules/react.js";
import { githubRawUrl } from "../utils/url.js";
import { previousBuilds, getStorageData } from "../utils/data.js";
import Input from "../components/Input.js";
import TimelineContainer from "../components/timeline/Container.js";
import PreviousBuild from "../components/PreviousBuild.js";
export default (() => {
  const [buildUrl, setBuildUrl] = useState(false);
  const [buildData, setBuildData] = useState(null);

  const loadBuildCallback = data => {
    const corsUrl = githubRawUrl(data);
    const storedData = getStorageData(corsUrl);
    setBuildData(storedData.data);
    setBuildUrl(corsUrl);
  };

  const changeCallback = data => {
    const corsUrl = githubRawUrl(data);
    setBuildUrl(corsUrl);
  };

  if (buildUrl) {
    return React.createElement(TimelineContainer, {
      buildUrl: buildUrl,
      buildData: buildData
    });
  }

  const showPreviousBuilds = () => {
    const previousBuildsData = previousBuilds();

    if (!previousBuildsData || !Object.keys(previousBuildsData).length) {
      return null;
    }

    return React.createElement("div", {
      className: "flex flex-col mt-8 md:w-full"
    }, React.createElement("h2", {
      className: "text-center text-2xl mb-4"
    }, "Previous builds"), React.createElement("div", {
      className: "flex flex-row flex-wrap md:text-center md:justify-center"
    }, Object.keys(previousBuildsData).map(key => React.createElement(PreviousBuild, {
      url: key,
      build: previousBuildsData[key].build,
      loadBuild: loadBuildCallback
    }))));
  };

  return React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-1_5_1 mt-24 p-2",
    style: {
      height: 'calc(100vh - 6rem)'
    }
  }, React.createElement("div", {
    className: "lg:col-start-2 flex items-center flex-col"
  }, React.createElement("div", {
    className: "relative h-10 w-full md:w-4/5 lg:w-2/4"
  }, React.createElement(Input, {
    onChange: changeCallback
  })), showPreviousBuilds()));
});