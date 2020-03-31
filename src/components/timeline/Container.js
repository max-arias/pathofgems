import React from 'react'
import { useAsync } from 'react-async'

import {
  questRewardsUrl,
  vendorRewardsUrl,
  gemDataUrl,
} from '../../utils/constants.js'
import { corsifyUrl, getIssueReportURL } from '../../utils/url.js'
import { decode, hydrateBuildData, store } from '../../utils/data.js'

import TimelineList from './List.js'

const loadData = async ({ url }) =>
  await fetch(url)
    .then((res) => (res.ok ? res : Promise.reject(res)))
    .then((res) => res.json())

const corsQuestRewards = corsifyUrl(questRewardsUrl)
const corsVendorRewardsUrl = corsifyUrl(vendorRewardsUrl)
const corsGemDataUrl = corsifyUrl(gemDataUrl)

export default ({ buildUrl, buildData }) => {
  if (buildData) {
    return <TimelineList data={buildData} url={buildUrl} />
  }

  const { data, error, isLoading } = useAsync({
    promiseFn: loadData,
    url: buildUrl,
  })
  const {
    data: questData,
    error: questError,
    isLoading: questLoading,
  } = useAsync({ promiseFn: loadData, url: corsQuestRewards })
  const {
    data: vendorData,
    error: vendorError,
    isLoading: vendorLoading,
  } = useAsync({ promiseFn: loadData, url: corsVendorRewardsUrl })
  const { data: gemData, error: gemError, isLoading: gemLoading } = useAsync({
    promiseFn: loadData,
    url: corsGemDataUrl,
  })

  if (isLoading || questLoading || vendorLoading || gemLoading) {
    return (
      <div className="flex justify-center mt-20 flex-col items-center">
        <h1>Loading</h1>
        <i className="gg-spinner" />
      </div>
    )
  }

  if (error || questError || vendorError || gemError) {
    const errorStr = `${error.toString()} - ${questError.toString()} - ${vendorError.toString()} - ${gemError.toString()}`
    return (
      <div className="flex justify-center mt-20 flex-col items-center">
        <h1>
          There was an error processing the build, please leave a bug report by
          clicking:{' '}
          <a
            clasName="underline"
            target="_blank"
            rel="noopener"
            href={getIssueReportURL(buildUrl, errorStr)}
          >
            Here
          </a>
        </h1>
      </div>
    )
  }

  if (data && questData && vendorData && gemData) {
    const decodedBuildData = decode(data.contents)

    if (!decodedBuildData.skills || !decodedBuildData.skills.length) {
      throw new Error('No skill data in this build')
    }

    try {
      const parsedGemData = JSON.parse(gemData.contents)
      const parsedVendorData = JSON.parse(vendorData.contents)
      const parsedQuestData = JSON.parse(questData.contents)

      const parsedData = hydrateBuildData(
        decodedBuildData,
        parsedGemData,
        parsedVendorData,
        parsedQuestData
      )

      // Store data in localstorage
      if (parsedData && buildUrl) {
        store(buildUrl, decodedBuildData, parsedData)
      }

      return <TimelineList data={parsedData} url={buildUrl} />
    } catch (err) {
      throw new Error(err)
    }
  }

  return 'dragons be here'
}
