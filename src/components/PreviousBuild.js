import React from 'react'

import Avatar from './Avatar.js'

export default ({ url, build, loadBuild }) => {
  let buildClass = `${build.className} - ${build.ascendancyName}`

  if(build.ascendancyName === 'None') {
    buildClass = build.className
  }

  return (
    <div className="flex w-full md:w-auto lg:w-2/5 xl:w-auto mb-2 mr-4">
      <Avatar buildName={build.className} ascendancyName={build.ascendancyName} />
      <div className="flex flex-col justify-center ml-2 lg:ml-0 w-3/5 xl:w-auto text-center xl:text-left">
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
