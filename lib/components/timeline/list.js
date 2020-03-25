import React from "/web_modules/react.js";
import { VerticalTimeline, VerticalTimelineElement } from "/web_modules/react-vertical-timeline-component.js";
export default (() => {
  return React.createElement(VerticalTimeline, null, React.createElement(VerticalTimelineElement, {
    className: "vertical-timeline-element--work",
    contentStyle: {
      background: 'rgb(33, 150, 243)',
      color: '#fff'
    },
    contentArrowStyle: {
      borderRight: '7px solid  rgb(33, 150, 243)'
    },
    date: "Level 1"
  }, "lorem ipsum"), React.createElement(VerticalTimelineElement, {
    className: "vertical-timeline-element--work",
    date: "Level 10"
  }, "lorem ipsum"), React.createElement(VerticalTimelineElement, {
    className: "vertical-timeline-element--work",
    date: "Level 29"
  }, "lorem ipsum"), React.createElement(VerticalTimelineElement, {
    className: "vertical-timeline-element--work",
    date: "Level 30"
  }, "lorem ipsum"));
});