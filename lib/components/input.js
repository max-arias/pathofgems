import React, { useEffect, useState } from "/web_modules/react.js";
import decode from "../utils/decode.js";
const corsProxy = "https://api.allorigins.win/get?url=";
export default () => {
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlValue = e.target.elements.url.value;
    setIsFetching(true);
    const urlToParse = new URL(urlValue);
    const rawUrlToParse = `${urlToParse.origin}/raw${urlToParse.pathname}`;
    const response = await fetch(
      `${corsProxy}${encodeURIComponent(rawUrlToParse)}`
    );
    const data = await response.json();
    const xml = decode(data.contents);
    console.log(xml);
    setIsFetching(false);
  };

  return React.createElement(
    "div",
    {
      className: "lg:col-start-2 flex items-center flex-col",
    },
    React.createElement(
      "div",
      {
        className: "relative h-10 w-4/5 lg:w-2/4",
      },
      React.createElement(
        "form",
        {
          onSubmit: handleSubmit,
        },
        React.createElement("input", {
          required: true,
          placeholder: "Input Path Of Building URL",
          type: "text",
          name: "url",
          className:
            "h-10 w-full bg-white focus:outline-none focus:shadow-outline border border-gray-200 rounded-lg py-2 px-4 block appearance-none leading-normal",
          pattern: "https?:\\/\\/pastebin.com\\/[a-zA-Z0-9]{8}",
        }),
        React.createElement(
          "button",
          {
            type: "submit",
            className: "absolute right-0 top-0 mt-3 mr-4 bg-white",
          },
          React.createElement("i", {
            className: isFetching ? "gg-spinner" : "gg-enter",
          })
        )
      )
    )
  );
};
