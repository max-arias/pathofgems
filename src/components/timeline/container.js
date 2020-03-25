import React from 'react'
import { useAsync } from "react-async"

import { questRewardsUrl, vendorRewardsUrl, gemDataUrl } from '../../utils/constants.js'
import { corsifyUrl } from '../../utils/url.js'
import { decode, hydrateBuildData } from '../../utils/data.js'

const loadData = async ({ url }) =>
  await fetch(url)
    .then(res => (res.ok ? res : Promise.reject(res)))
    .then(res => res.json())

const corsQuestRewards = corsifyUrl(questRewardsUrl);
const corsVendorRewardsUrl = corsifyUrl(vendorRewardsUrl);
const corsGemDataUrl = corsifyUrl(gemDataUrl);

export default ({ buildUrl }) => {
  const { data, error, isLoading } = useAsync({ promiseFn: loadData, url: buildUrl })
  const { data: questData, error: questError, isLoading: questLoading } = useAsync({ promiseFn: loadData, url: corsQuestRewards })
  const { data: vendorData, error: vendorError, isLoading: vendorLoading } = useAsync({ promiseFn: loadData, url: corsVendorRewardsUrl })
  const { data: gemData, error: gemError, isLoading: gemLoading } = useAsync({ promiseFn: loadData, url: corsGemDataUrl })

  if (isLoading || questLoading || vendorLoading || gemLoading) {
    return <i className="gg-loading" />
  }

  if (error || questError || vendorError || gemError) {
    return error || questError || questVendor
  }

  if (data && questData && vendorData && gemData) {
    const decodedBuildData = decode(data.contents)

    if(!decodedBuildData.skills || !decodedBuildData.skills.length) {
      throw new Error('No skill data in this build')
    }

    try {
      const parsedGemData = JSON.parse(gemData.contents)
      const parsedVendorData = JSON.parse(vendorData.contents)
      const parsedQuestData = JSON.parse(questData.contents)

      const parsedData = hydrateBuildData(decodedBuildData, parsedGemData, parsedVendorData, parsedQuestData)

      return <em>{JSON.stringify(parsedData)}</em>
    } catch (err) {
      throw new Error(err)
    }
  }

  return "dragons be here"
}