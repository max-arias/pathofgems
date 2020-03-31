import React, { useState} from 'react'
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component'

import { toggleGem } from '../../utils/data.js'


import ListItem from './ListItem.js'

export default ({ data, url }) => {
  const [ listData, setListData ] = useState(data)
  const toggleGemChecked = gemId => {
    const updatedData = toggleGem(url, listData, gemId)
    setListData(updatedData)
  }

  return (
    <VerticalTimeline>
      {Object.keys(listData).map((lvl) => {
        return (
          <VerticalTimelineElement
            date="Required level"
            contentStyle={{
              backgroundColor: '#0c0b0b',
              border: '1px solid #141414',
            }}
            iconStyle={{
              backgroundColor: '#141414',
              color: '#141414',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
            icon={<span>{lvl}</span>}
          >
            <div>
              {listData[lvl].map((gem) => {
                return <ListItem gem={gem} toggleGemChecked={toggleGemChecked}/>
              })}
            </div>
          </VerticalTimelineElement>
        )
      })}
    </VerticalTimeline>
  )
}
