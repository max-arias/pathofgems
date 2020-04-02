import React from "/web_modules/react.js";
import Check from "../Check.js";
export default (({
  gem,
  toggleGemChecked
}) => {
  const toggleCheck = gemId => {
    toggleGemChecked(gemId);
  };

  return React.createElement("div", {
    className: `gem-container p-2 mb-2 bg-secondary relative ${gem.checked ? 'opacity-50' : ''}`
  }, React.createElement("div", {
    className: "absolute top-0 right-0 mr-2 mt-2"
  }, React.createElement(Check, {
    checked: gem.checked,
    checkToggle: toggleCheck,
    gemId: gem.skillId
  })), React.createElement("div", {
    className: "gem-title flex mb-2 items-center border-dark"
  }, React.createElement("img", {
    src: `/lib/images/${gem.skillId}.png`,
    alt: gem.skillId,
    width: "50"
  }), React.createElement("h4", {
    className: "ml-2"
  }, React.createElement("a", {
    target: "_blank",
    rel: "noopener",
    href: `https://pathofexile.gamepedia.com/${gem.name}`,
    className: "underline"
  }, gem.name))), React.createElement("hr", {
    className: "border-primary mb-2"
  }), !gem.questReward && !gem.vendorReward && React.createElement("span", null, "This gem is not awarded to your class, you'll need to buy it."), gem.questReward && gem.questReward.length && React.createElement("div", {
    className: "gem-quest-reward"
  }, React.createElement("span", null, "Quest Reward"), gem.questReward.map(q => React.createElement("div", null, React.createElement("span", null, "Act: ", q.act), React.createElement("span", null, ' ', "-", ' ', React.createElement("a", {
    target: "_blank",
    rel: "noopener",
    href: `https://pathofexile.gamepedia.com/${q.questName}`,
    className: "underline"
  }, q.questName))))), gem.vendorReward && gem.vendorReward.length && React.createElement("div", {
    className: "gem-vendor-reward",
    style: {
      marginTop: 12
    }
  }, React.createElement("span", null, "Vendor Reward"), gem.vendorReward.map(v => React.createElement("div", null, React.createElement("span", null, "Act: ", v.act), v.questName && React.createElement("span", null, ' ', "-", ' ', React.createElement("a", {
    target: "_blank",
    rel: "noopener",
    href: `https://pathofexile.gamepedia.com/${v.questName}`,
    className: "underline"
  }, v.questName)), React.createElement("span", null, " - ", v.vendorName)))));
});