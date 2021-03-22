chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_BEATMAP_INFO') {
    try {
      const activeTabHref = document.querySelector('.beatmapTab.active').getAttribute('href');
      const graphImageSrc = document.querySelector('img[src^="/pages/include/beatmap-rating-graph.php"]').getAttribute('src');
      const [, beatmapId] = activeTabHref.match(/\/b\/(\d+)/i) || [];
      const [, beatmapSetId] = graphImageSrc.match(/=(\d+)$/i) || [];
      const stars = parseFloat(document.querySelectorAll("th[class~=beatmap-stats-table__label]")[2].parentElement.children.item(2).textContent, 10); // TODO: replace hacky way with accurate star rating calculator
      // cleanBeatmap.ncircles seemed wrong, so we get circle count from here. again, this is hacky way so it needs to be replaced in the future
      const ncircles = parseInt((document.querySelector("div[data-orig-title='Circle Count']") || document.querySelector("div[title='Circle Count']")).children.item(1).textContent.replace(',', ''), 10);
      sendResponse({
        status: 'SUCCESS',
        beatmapId,
        beatmapSetId,
        stars,
        ncircles,
      });
    } catch (error) {
      sendResponse({
        status: 'ERROR',
        error: {
          message: error.message,
          arguments: error.arguments,
          type: error.type,
          name: error.name,
          stack: error.stack,
        },
      });
    }
  }
});
