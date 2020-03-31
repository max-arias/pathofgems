import React, { useState } from "/web_modules/react.js";
import { VerticalTimeline, VerticalTimelineElement } from "/web_modules/react-vertical-timeline-component.js";
import { toggleGem } from "../../utils/data.js";
import ListItem from "./ListItem.js";
export default (({
  data,
  url
}) => {
  const [listData, setListData] = useState(data);

  const toggleGemChecked = gemId => {
    const updatedData = toggleGem(url, listData, gemId);
    setListData(updatedData);
  };

  return React.createElement(VerticalTimeline, null, Object.keys(listData).map(lvl => {
    return React.createElement(VerticalTimelineElement, {
      date: "Required level",
      contentStyle: {
        backgroundColor: '#0c0b0b',
        border: '1px solid #141414'
      },
      iconStyle: {
        backgroundColor: '#141414',
        color: '#141414',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      },
      icon: React.createElement("span", null, lvl)
    }, React.createElement("div", null, listData[lvl].map(gem => {
      return React.createElement(ListItem, {
        gem: gem,
        toggleGemChecked: toggleGemChecked
      });
    })));
  }));
});