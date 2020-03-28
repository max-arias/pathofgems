import React from "/web_modules/react.js";
import { VerticalTimeline, VerticalTimelineElement } from "/web_modules/react-vertical-timeline-component.js";
import { gemBaseUrl } from "../../utils/constants.js";
export default (({
  data
}) => {
  return React.createElement(VerticalTimeline, null, Object.keys(data).map(lvl => {
    return React.createElement(VerticalTimelineElement, {
      date: "Required level",
      contentStyle: {
        backgroundColor: '#0c0b0b',
        color: '#fff',
        borderColor: '#141414',
        border: '1px solid'
      },
      iconStyle: {
        backgroundColor: '0c0b0b',
        color: '#141414',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      },
      icon: React.createElement("span", null, lvl)
    }, React.createElement("div", null, data[lvl].map(gem => {
      const gemUrl = `/lib/images/${gem.skillId}.jpg`.replace('Support', 'Support/').replace(' ', '');
      return React.createElement("div", null, React.createElement("div", null, React.createElement("img", {
        src: gemUrl,
        alt: gem.skillId,
        width: "50"
      }), React.createElement("h4", null, gem.name)), React.createElement("hr", null), gem.questReward && gem.questReward.length && React.createElement("div", null, gem.questReward.map(q => React.createElement("div", null, React.createElement("span", null, "Act: ", q.act), React.createElement("span", null, " - ", React.createElement("a", {
        target: "_blank",
        rel: "noopener",
        href: `https://pathofexile.gamepedia.com/${q.questName}`
      }, q.questName))))), gem.vendorReward && gem.vendorReward.length && React.createElement("div", null, gem.vendorReward.map(v => React.createElement("div", null, React.createElement("span", null, "Act: ", v.act), React.createElement("span", null, " - ", React.createElement("a", {
        target: "_blank",
        rel: "noopener",
        href: `https://pathofexile.gamepedia.com/${v.questName}`
      }, v.questName)), React.createElement("br", null), React.createElement("span", null, "Vendor: ", v.vendorName)))));
    })));
  }));
});