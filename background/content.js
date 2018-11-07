chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_BEATMAP_INFO') {
    const activeTabHref = document.querySelector('.beatmapTab.active').getAttribute('href');
    const moddingLinkHref = document.querySelector('a[href^="/beatmapsets/"]').getAttribute('href');
    const [, beatmapId] = activeTabHref.match(/\/b\/(\d+)/i);
    const [, beatmapSetId] = moddingLinkHref.match(/\/beatmapsets\/(\d+)/i);
    sendResponse({
      beatmapId,
      beatmapSetId,
    });
  }
});
