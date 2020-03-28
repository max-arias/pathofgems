import React, { useState } from 'react'

import { githubRawUrl } from '../utils/url.js'

import Input from '../components/input.js'
import TimelineContainer from '../components/timeline/container.js'
import TimelineList from '../components/timeline/list.js'

export default () => {
  const [buildUrl, setBuildUrl] = useState(false)

  const changeCallback = data => {
    const corsUrl = githubRawUrl(data)
    setBuildUrl(corsUrl)
  }

  if (buildUrl) {
    return <TimelineContainer buildUrl={buildUrl} />
  }

  return (
    <div
      className="grid lg:grid-cols-1_5_1 mt-24"
      style={{ height: 'calc(100vh - 6rem)' }}
    >
      <Input onChange={changeCallback} />
    </div>
  )
}
