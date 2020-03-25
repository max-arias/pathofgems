import React, { useState } from "/web_modules/react.js";
import { githubRawUrl } from "../utils/url.js";
import Input from "../components/input.js";
import TimelineContainer from "../components/timeline/container.js";
import TimelineList from "../components/timeline/list.js";
export default (() => {
  const [buildUrl, setBuildUrl] = useState(false);

  const changeCallback = data => {
    const corsUrl = githubRawUrl(data);
    setBuildUrl(corsUrl);
  }; // return <TimelineList />


  if (buildUrl) {
    return React.createElement(TimelineContainer, {
      buildUrl: buildUrl
    });
  }

  return React.createElement("div", {
    className: "grid lg:grid-cols-1_5_1 mt-24",
    style: {
      height: 'calc(100vh - 6rem)'
    }
  }, React.createElement(Input, {
    onChange: changeCallback
  }));
});