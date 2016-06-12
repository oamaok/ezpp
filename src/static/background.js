chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url.toLowerCase().match(/^https?:\/\/(osu|new).ppy.sh\/([bs])\/(\d+)/))
    chrome.pageAction.show(tabId);
});