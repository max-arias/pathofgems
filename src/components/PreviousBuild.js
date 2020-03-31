import React from 'react'

import Avatar from './Avatar.js'

export default ({ url, build, loadBuild }) => {
  return (
    <div className="flex w-1/2">
      <Avatar buildClass={build.ascendancyName} />
      <div className="flex flex-col justify-center">
        <span>
          {build.className} - {build.ascendancyName}
        </span>
        <span className="cursor-pointer underline" onClick={() => loadBuild(url)}>
          {url}
        </span>
      </div>
    </div>
  )
}
