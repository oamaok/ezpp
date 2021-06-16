import { BEATMAP_URL_REGEX } from '../common/constants'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url!.match(BEATMAP_URL_REGEX)) {
    chrome.pageAction.show(tabId)
  } else if (!tab.url!.match(BEATMAP_URL_REGEX)) {
    chrome.pageAction.hide(tabId)
  }
})
