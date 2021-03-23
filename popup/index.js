import ojsama from 'ojsama'
import manifest from '../static/manifest.json'
import { setLanguage, createTextSetter } from './translations'
import { BEATMAP_URL_REGEX } from '../common/constants'
import * as taiko from './calculators/taiko'
import * as std from './calculators/standard'

require('./analytics')
require('./settings')
require('./notifications')

const FETCH_ATTEMPTS = 3
const UNSUPPORTED_GAMEMODE = 'Unsupported gamemode!' // TODO: Add to translations

const containerElement = document.getElementById('container')
const headerElement = document.getElementById('header')
const versionElement = document.querySelector('.version')
const titleElement = document.querySelector('.song-title')
const artistElement = document.querySelector('.artist')
const fcResetButton = document.querySelector('.fc-reset')
const difficultyNameElement = document.getElementById('difficulty-name')
const difficultyStarsElement = document.getElementById('difficulty-stars')
const modifierElements = [...document.querySelectorAll('.mod>input')]
const accuracyElement = document.getElementById('accuracy')
const comboElement = document.getElementById('combo')
const missesElement = document.getElementById('misses')
const resultElement = document.getElementById('result')
const errorElement = document.getElementById('error')
const bpmElement = document.getElementById('bpm')
const arElement = document.getElementById('ar')

const metadataInOriginalLanguageToggle = document.getElementById(
  'metadata-in-original-language-toggle'
)

// user may have been changed "show beatmap metadata in original language"
document.getElementById('close-settings').addEventListener('click', () => {
  refreshTitleArtist()
})

const setResultText = createTextSetter(resultElement, 'result')

versionElement.innerText = `ezpp! v${manifest.version}`

// Set after the extension initializes, used for additional error information.
let currentUrl = null
let cleanBeatmap = null
let pageInfo = {
  isOldSite: null,
  beatmapSetId: null,
  beatmapId: null,
  beatmap: {
    accuracy: 0,
    ar: 0,
    beatmapset_id: 0,
    bpm: 0,
    convert: false,
    count_circles: 0,
    count_sliders: 0,
    count_spinners: 0,
    cs: 0,
    deleted_at: null,
    difficulty_rating: 0,
    drain: 0,
    failtimes: { fail: [], exit: [] },
    hit_length: 0,
    id: 0,
    is_scoreable: true,
    last_updated: '',
    max_combo: 0,
    mode: 'osu',
    mode_int: 0,
    passcount: 0,
    playcount: 0,
    ranked: 0,
    status: '',
    total_length: 0,
    url: '',
    version: '',
  },
  mode: null,
}

const keyModMap = {
  Q: 'mod-ez',
  W: 'mod-nf',
  E: 'mod-ht',
  A: 'mod-hr',
  D: 'mod-dt',
  F: 'mod-hd',
  G: 'mod-fl',
  C: 'mod-so',
}

const MODE_STANDARD = 0
const MODE_TAIKO = 1

const clamp = (x, min, max) => Math.min(Math.max(x, min), max)

const refreshTitleArtist = () => {
  const unicode = metadataInOriginalLanguageToggle.checked ? '_unicode' : ''
  titleElement.innerText = cleanBeatmap['title' + unicode]
  artistElement.innerText = cleanBeatmap['artist' + unicode]
}

const getMaxCombo = () => {
  if (!cleanBeatmap) return -1
  if (cleanBeatmap.mode === MODE_STANDARD) {
    return cleanBeatmap.max_combo()
  }
  if (cleanBeatmap.mode === MODE_TAIKO) {
    return pageInfo.beatmap.max_combo
  }

  return -1
}

const getCalculationSettings = () => {
  // Bitwise OR the mods together
  const modifiers = modifierElements.reduce(
    (num, element) => num | (element.checked ? parseInt(element.value) : 0),
    0
  )

  // An error might be reported before the beatmap is loaded.
  const maxCombo = getMaxCombo()

  const accuracy = clamp(
    parseFloat(accuracyElement.value.replace(',', '.')),
    0,
    100
  )
  const combo = clamp(parseInt(comboElement.value) || maxCombo, 0, maxCombo)
  const misses = clamp(parseInt(missesElement.value) || 0, 0, maxCombo)

  return {
    modifiers,
    accuracy,
    combo,
    misses,
  }
}

const trackError = (error) => {
  // Don't report unsupported gamemode errors.
  if (error.message === UNSUPPORTED_GAMEMODE) {
    return
  }

  const report = {
    version: manifest.version,
    url: currentUrl,
    calculationSettings: getCalculationSettings(),
    pageInfo,

    error: {
      message: error.message,
      arguments: error.arguments,
      type: error.type,
      name: error.name,
      stack: error.stack,
    },

    navigator: {
      userAgent: window.navigator.userAgent,
    },
  }

  _gaq.push(['_trackEvent', 'error', JSON.stringify(report)])
}

const displayError = (error) => {
  trackError(error)
  errorElement.innerText = error.message
  containerElement.classList.toggle('error', true)
  containerElement.classList.toggle('preloading', false)
}

const debounce = (fn, timeout) => {
  let debounceTimeout = null

  return (...args) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => fn(...args), timeout)
  }
}

const trackCalculate = (() => {
  let lastData = {}

  return (analyticsData) => {
    // Don't repeat calculation analytics
    const isClean = Object.keys(analyticsData).every(
      (key) => lastData[key] === analyticsData[key]
    )
    if (isClean) return

    lastData = { ...analyticsData }

    _gaq.push(['_trackEvent', 'calculate', JSON.stringify(analyticsData)])
  }
})()

const trackCalculateDebounced = debounce(trackCalculate, 500)

const calculate = () => {
  try {
    const { modifiers, accuracy, combo, misses } = getCalculationSettings()

    let bpmMultiplier = 1
    if (modifiers & ojsama.modbits.dt) bpmMultiplier = 1.5
    if (modifiers & ojsama.modbits.ht) bpmMultiplier = 0.75
    const msPerBeat = cleanBeatmap.timing_points[0].ms_per_beat
    const bpm = (1 / msPerBeat) * 1000 * 60 * bpmMultiplier

    let stars = { total: 0 }
    let pp

    switch (cleanBeatmap.mode) {
      case MODE_STANDARD:
        document.documentElement.classList.add('mode-standard')
        const stdResult = std.calculatePerformance(
          cleanBeatmap,
          modifiers,
          combo,
          misses,
          accuracy
        )
        pp = stdResult.pp
        stars = stdResult.stars
        arElement.innerText =
          cleanBeatmap.ar === null
            ? '?'
            : Math.round(
                std.calculateApproachRate(modifiers, cleanBeatmap.ar) * 10
              ) / 10
        break

      case MODE_TAIKO:
        document.documentElement.classList.add('mode-taiko')
        // TOOD: implement star rating calculator
        stars = { total: pageInfo.beatmap.difficulty_rating }
        pp = taiko.calculatePerformance(
          cleanBeatmap,
          stars.total,
          modifiers,
          combo,
          misses,
          accuracy
        )
        break

      default:
    }

    const { beatmapId } = pageInfo

    const analyticsData = {
      beatmapId: parseInt(beatmapId),
      modifiers: parseInt(modifiers),
      accuracy: parseFloat(accuracy),
      combo: parseInt(combo),
      misses: parseInt(misses),
      stars: parseFloat(stars.total.toFixed(1)),
      pp: parseFloat(pp.total.toFixed(2)),
    }

    // Track results
    trackCalculateDebounced(analyticsData)

    difficultyStarsElement.innerText = stars.total.toFixed(2)
    bpmElement.innerText = Math.round(bpm * 10) / 10

    setResultText(Math.round(pp.total))
  } catch (error) {
    displayError(error)
  }
}

const opposingModifiers = [
  ['mod-hr', 'mod-ez'],
  ['mod-ht', 'mod-dt'],
]

const toggleOpposingModifiers = (mod) => {
  opposingModifiers.forEach((mods) => {
    const index = mods.indexOf(mod)
    if (index !== -1) {
      const name = mods[1 - index]
      modifierElements.find(({ id }) => id === name).checked = false
    }
  })
}

const resetCombo = () => {
  comboElement.value = getMaxCombo()
}

const onReady = ([, cover]) => {
  // Display content since we're done loading all the stuff.
  containerElement.classList.toggle('preloading', false)

  // Set header background
  if (cover) {
    headerElement.style.backgroundImage = `url('${cover.src}')`
  }

  // Set header text
  refreshTitleArtist()
  difficultyNameElement.innerText = cleanBeatmap.version

  modifierElements.forEach((modElement) => {
    modElement.addEventListener('click', ({ target }) => {
      toggleOpposingModifiers(target.id)
      calculate()
    })
  })

  window.addEventListener('keydown', ({ key = '' }) => {
    const mod = keyModMap[key.toUpperCase()]

    if (mod) {
      const element = modifierElements.find(({ id }) => id === mod)
      element.checked = !element.checked

      toggleOpposingModifiers(mod)
      calculate()
    }
  })

  accuracyElement.addEventListener('input', calculate)
  comboElement.addEventListener('input', calculate)
  missesElement.addEventListener('input', calculate)

  fcResetButton.addEventListener('click', () => {
    resetCombo()
    calculate()
  })

  // Set the combo to the max combo by default
  resetCombo()

  calculate()
}

const fetchBeatmapById = (id) =>
  fetch(`https://osu.ppy.sh/osu/${id}`, {
    credentials: 'include',
  }).then((res) => res.text())

const getPageInfo = (url, tabId) =>
  new Promise((resolve, reject) => {
    const info = {
      isOldSite: null,
      beatmapSetId: null,
      beatmapId: null,
      stars: 0,
      beatmap: {},
    }

    const match = url.match(BEATMAP_URL_REGEX)
    info.isOldSite = match[2] !== 'beatmapsets'

    if (!info.isOldSite) {
      const mode = match[5]
      const beatmapId = match[6]

      info.mode = mode
      info.beatmapSetId = match[3]
      info.beatmapId = beatmapId

      chrome.tabs.sendMessage(
        tabId,
        { action: 'GET_BEATMAP_STATS', beatmapId },
        (response) => {
          if (!response) {
            // FIXME(acrylic-style): I don't know why but it happened to me multiple times
            reject(new Error('Empty response from content script'))
            return
          }

          if (response.status === 'ERROR') {
            reject(response.error)
            return
          }

          info.beatmap = response.beatmap
          resolve(info)
        }
      )
    } else {
      // Fetch data from the content script so we don't need to fetch the page
      // second time.
      chrome.tabs.sendMessage(
        tabId,
        { action: 'GET_BEATMAP_INFO' },
        (response) => {
          if (response.status === 'ERROR') {
            reject(response.error)
            return
          }

          const { beatmapId, beatmapSetId } = response
          info.beatmapSetId = beatmapSetId
          info.beatmapId = beatmapId

          resolve(info)
        }
      )
    }
  })

const attemptToFetchBeatmap = (id, attempts) =>
  fetchBeatmapById(id).catch((error) => {
    // Retry fetching until no attempts are left.
    if (attempts) return attemptToFetchBeatmap(id, attempts - 1)

    throw error
  })

const processBeatmap = (rawBeatmap) => {
  const { map } = new ojsama.parser().feed(rawBeatmap)

  cleanBeatmap = map

  // Support old beatmaps
  cleanBeatmap.mode = Number(cleanBeatmap.mode || MODE_STANDARD)
  if (pageInfo.mode === 'taiko') cleanBeatmap.mode = MODE_TAIKO
  if (pageInfo.mode === 'fruits') cleanBeatmap.mode = 2
  if (pageInfo.mode === 'mania') cleanBeatmap.mode = 3

  if (cleanBeatmap.mode !== 0 && cleanBeatmap.mode !== 1) {
    throw Error(UNSUPPORTED_GAMEMODE)
  }
}

const fetchBeatmapBackground = (beatmapSetId) =>
  new Promise((resolve) => {
    // Preload beatmap cover
    const cover = new Image()
    cover.src = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/cover@2x.jpg`
    cover.onload = () => resolve(cover)
    cover.onerror = () => resolve()
    cover.onabort = () => resolve()
  })

// Track errors with GA
window.addEventListener('error', trackError)

if (__FIREFOX__) {
  containerElement.classList.toggle('firefox', true)
  document.documentElement.classList.toggle('firefox', true)
}

chrome.storage.local.get(['language'], ({ language }) => {
  setLanguage(language || 'en')
})

// Init the extension.
chrome.tabs.query(
  {
    active: true, // Select active tabs
    lastFocusedWindow: true, // In the current window
  },
  ([tab]) => {
    const { url, id } = tab
    currentUrl = url

    getPageInfo(url, id)
      .then((info) => {
        pageInfo = info

        return Promise.all([
          attemptToFetchBeatmap(pageInfo.beatmapId, FETCH_ATTEMPTS).then(
            processBeatmap
          ),
          fetchBeatmapBackground(pageInfo.beatmapSetId),
        ])
      })
      .then(onReady)
      .catch(displayError)
  }
)
