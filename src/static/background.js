chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.toLowerCase().match(/^https?:\/\/(osu|new).ppy.sh\/([bs]|beatmapsets)\/(\d+)/)) {
    chrome.pageAction.show(tabId);
  }
});
