import React from "/web_modules/react.js";
import { useAsync } from "/web_modules/react-async.js";
import decode from "../../utils/decode.js";

const loadData = async ({
  buildUrl
}) => await fetch(buildUrl).then(res => res.ok ? res : Promise.reject(res)).then(res => res.json());

export default (({
  buildUrl,
  corsQuestRewards,
  corsVendorRewardsUrl
}) => {
  const {
    data,
    error,
    isLoading
  } = useAsync({
    promiseFn: loadData,
    buildUrl
  });
  const {
    data: questData,
    error: questError,
    isLoading: questLoading
  } = useAsync({
    promiseFn: loadData,
    buildUrl: corsQuestRewards
  });
  const {
    data: rewardData,
    error: questVendor,
    isLoading: vendorLoading
  } = useAsync({
    promiseFn: loadData,
    buildUrl: corsVendorRewardsUrl
  });

  if (isLoading || questLoading || vendorLoading) {
    return React.createElement("i", {
      className: "gg-loading"
    });
  }

  if (error) {
    return error;
  }

  if (data && questData && rewardData) {
    console.log(data.contents);
    console.log(JSON.parse(questData.contents));
    console.log(JSON.parse(rewardData.contents));
    const decodedData = decode(data.contents);
    return React.createElement("span", null, JSON.stringify(decodedData));
  }

  return "here?";
});