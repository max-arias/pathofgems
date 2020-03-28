import React from "/web_modules/react.js";
import { VerticalTimeline, VerticalTimelineElement } from "/web_modules/react-vertical-timeline-component.js";
import { gemBaseUrl } from "../../utils/constants.js"; //TODO: emotion css

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
        backgroundColor: '#141414',
        color: '#141414',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      },
      icon: React.createElement("span", null, lvl)
    }, React.createElement("div", null, data[lvl].map(gem => {
      return React.createElement("div", {
        className: "gem-container",
        style: {
          padding: '.5rem',
          marginBottom: '.5rem',
          backgroundColor: '#141414'
        }
      }, React.createElement("div", {
        className: "gem-title",
        style: {
          display: 'flex',
          marginBottom: '.5rem',
          alignItems: 'center',
          borderColor: '#141414'
        }
      }, React.createElement("img", {
        src: `/lib/images/${gem.skillId}.png`,
        alt: gem.skillId,
        width: "50"
      }), React.createElement("h4", null, React.createElement("a", {
        target: "_blank",
        rel: "noopener",
        href: `https://pathofexile.gamepedia.com/${gem.name}`,
        style: {
          textDecoration: 'underline'
        }
      }, gem.name))), React.createElement("hr", {
        style: {
          borderColor: '#A38D6D',
          marginBottom: '.5rem'
        }
      }), !gem.questReward && !gem.vendorReward && React.createElement("span", null, "This gem is not awarded to your class, you'll need to buy it."), gem.questReward && gem.questReward.length && React.createElement("div", {
        className: "gem-quest-reward"
      }, React.createElement("span", null, "Quest Reward"), gem.questReward.map(q => React.createElement("div", null, React.createElement("span", null, "Act: ", q.act), React.createElement("span", null, " - ", React.createElement("a", {
        target: "_blank",
        rel: "noopener",
        href: `https://pathofexile.gamepedia.com/${q.questName}`,
        style: {
          textDecoration: 'underline'
        }
      }, q.questName))))), gem.vendorReward && gem.vendorReward.length && React.createElement("div", {
        className: "gem-vendor-reward",
        style: {
          marginTop: 12
        }
      }, React.createElement("span", null, "Vendor Reward"), gem.vendorReward.map(v => React.createElement("div", null, React.createElement("span", null, "Act: ", v.act), v.questName && React.createElement("span", null, " - ", React.createElement("a", {
        target: "_blank",
        rel: "noopener",
        href: `https://pathofexile.gamepedia.com/${v.questName}`,
        style: {
          textDecoration: 'underline'
        }
      }, v.questName)), React.createElement("span", null, " - ", v.vendorName)))));
    })));
  }));
});