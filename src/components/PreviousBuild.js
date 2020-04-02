import React from 'react'

import Avatar from './Avatar.js'

export default ({ url, build, loadBuild }) => {
  let buildClass = `${build.className} - ${build.ascendancyName}`

  if(build.ascendancyName === 'None') {
    buildClass = build.className
  }

  return (
    <div className="flex w-1/2">
      <Avatar buildName={build.className} ascendancyName={build.ascendancyName} />
      <div className="flex flex-col justify-center">
        <span>
          {buildClass}
        </span>
        <span className="cursor-pointer underline" onClick={() => loadBuild(url)}>
          {url}
        </span>
      </div>
    </div>
  )
}
