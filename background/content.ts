chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_BEATMAP_INFO') {
    try {
      const activeTabHref = document
        .querySelector('.beatmapTab.active')!
        .getAttribute('href')!
      const graphImageSrc = document
        .querySelector('img[src^="/pages/include/beatmap-rating-graph.php"]')!
        .getAttribute('src')!
      const [, beatmapId] = activeTabHref.match(/\/b\/(\d+)/i)! || []
      const [, beatmapSetId] = graphImageSrc.match(/=(\d+)$/i)! || []
      sendResponse({
        status: 'SUCCESS',
        beatmapId,
        beatmapSetId,
      })
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
      })
    }
  }
  if (request.action === 'GET_SCORE_DATA') {
    try {
      sendResponse({
        status: 'SUCCESS',
        score: JSON.parse(document.getElementById('json-show')!.textContent!),
      })
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
      })
    }
  }
  if (request.action === 'GET_BEATMAP_STATS') {
    try {
      const beatmapSet = JSON.parse(
        document.getElementById('json-beatmapset')!.textContent!
      )
      const beatmap = beatmapSet.beatmaps.find(
        (map: { id: number }) =>
          map.id.toString() === request.beatmapId.toString()
      )
      const convert = beatmapSet.converts.find(
        (map: { id: number; mode: string }) =>
          map.id.toString() === request.beatmapId.toString() &&
          map.mode === request.mode
      )

      sendResponse({
        status: 'SUCCESS',
        beatmap,
        convert,
      })
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
      })
    }
  }
})
