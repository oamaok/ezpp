import { BEATMAP_URL_REGEX } from '../common/constants'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url!.match(BEATMAP_URL_REGEX)) {
    chrome.action.enable(tabId)
  } else if (!tab.url!.match(BEATMAP_URL_REGEX)) {
    chrome.action.disable(tabId)
  }
})
