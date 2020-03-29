import React from "/web_modules/react.js";
import { useAsync } from "/web_modules/react-async.js";
import { questRewardsUrl, vendorRewardsUrl, gemDataUrl } from "../../utils/constants.js";
import { corsifyUrl } from "../../utils/url.js";
import { decode, hydrateBuildData, store } from "../../utils/data.js";
import TimelineList from "./list.js";

const loadData = async ({
  url
}) => await fetch(url).then(res => res.ok ? res : Promise.reject(res)).then(res => res.json());

const corsQuestRewards = corsifyUrl(questRewardsUrl);
const corsVendorRewardsUrl = corsifyUrl(vendorRewardsUrl);
const corsGemDataUrl = corsifyUrl(gemDataUrl);
export default (({
  buildUrl
}) => {
  const {
    data,
    error,
    isLoading
  } = useAsync({
    promiseFn: loadData,
    url: buildUrl
  });
  const {
    data: questData,
    error: questError,
    isLoading: questLoading
  } = useAsync({
    promiseFn: loadData,
    url: corsQuestRewards
  });
  const {
    data: vendorData,
    error: vendorError,
    isLoading: vendorLoading
  } = useAsync({
    promiseFn: loadData,
    url: corsVendorRewardsUrl
  });
  const {
    data: gemData,
    error: gemError,
    isLoading: gemLoading
  } = useAsync({
    promiseFn: loadData,
    url: corsGemDataUrl
  });

  const getIssueReportURL = () => {
    const newIssueURL = "https://github.com/max-arias/pathofgems/issues/new";
    const issueTitle = "There was an issue processing the build URL";
    const issueBody = `Build Url: ${buildUrl}`;
    var enc = encodeURIComponent;
    var queryString = `title=${enc(issueTitle)}&body=${enc(issueBody)}`;
    return `${newIssueURL}?${queryString}`;
  };

  if (isLoading || questLoading || vendorLoading || gemLoading) {
    return React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '5rem',
        flexFlow: 'column',
        alignItems: 'center'
      }
    }, React.createElement("h1", null, "Loading"), React.createElement("i", {
      className: "gg-spinner"
    }));
  }

  if (error || questError || vendorError || gemError) {
    return React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '5rem',
        flexFlow: 'column',
        alignItems: 'center'
      }
    }, React.createElement("h1", null, "There was an error processing the build, please contact leave a bug report here: ", React.createElement("a", {
      target: "_blank",
      rel: "noopener",
      href: getIssueReportURL()
    }, "Report")), React.createElement("i", {
      className: "gg-spinner"
    }));
  }

  if (data && questData && vendorData && gemData) {
    const decodedBuildData = decode(data.contents);

    if (!decodedBuildData.skills || !decodedBuildData.skills.length) {
      throw new Error('No skill data in this build');
    }

    try {
      const parsedGemData = JSON.parse(gemData.contents);
      const parsedVendorData = JSON.parse(vendorData.contents);
      const parsedQuestData = JSON.parse(questData.contents);
      const parsedData = hydrateBuildData(decodedBuildData, parsedGemData, parsedVendorData, parsedQuestData); // Store data in localstorage

      store(buildUrl, parsedData);
      return React.createElement(TimelineList, {
        data: parsedData
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  return 'dragons be here';
});