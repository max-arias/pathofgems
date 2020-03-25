import { corsProxyUrl } from "./constants.js";
export const githubRawUrl = url => {
  if (!url) return false;
  const urlToParse = new URL(url);
  const rawUrlToParse = `${urlToParse.origin}/raw${urlToParse.pathname}`;
  return `${corsProxyUrl}${rawUrlToParse}`;
};
export const corsifyUrl = url => {
  if (!url) return false;
  return `${corsProxyUrl}${url}`;
};