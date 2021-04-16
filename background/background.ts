import { testRegex } from '../common/constants'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && testRegex(tab.url!)) {
    chrome.action.enable(tabId)
  } else if (!testRegex(tab.url!)) {
    chrome.action.disable(tabId)
  }
})
