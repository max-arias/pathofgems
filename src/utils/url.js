import { corsProxyUrl } from './constants.js'

export const githubRawUrl = (url) => {
  if (!url) return false

  const urlToParse = new URL(url)
  const rawUrlToParse = `${urlToParse.origin}/raw${urlToParse.pathname}`

  return `${corsProxyUrl}${rawUrlToParse}`
}

export const corsifyUrl = (url) => {
  if (!url) return false

  return `${corsProxyUrl}${url}`
}

export const getIssueReportURL = (buildUrl, error = null) => {
  let buildUrlFailing = null
  let issueBody = null

  if (buildUrl) {
    buildUrlFailing = buildUrl.replace(corsProxyUrl, '').replace('raw/', '')
    issueBody += `Build Url: [${buildUrlFailing}](${buildUrlFailing})`
  }

  if (error) {
    issueBody += error
  }

  const newIssueURL = 'https://github.com/max-arias/pathofgems/issues/new'
  const issueTitle = 'There was an issue processing the build URL'

  var enc = encodeURIComponent
  var queryString = `title=${enc(issueTitle)}&body=${enc(issueBody)}`
  return `${newIssueURL}?${queryString}`
}
