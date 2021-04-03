import ojsama from 'ojsama'

import manifest from '../static/manifest.json'
import { setLanguage, createTextSetter } from './translations'
import { loadSettings, onSettingsChange } from './settings'
import { BEATMAP_URL_REGEX } from '../common/constants'
import { loadAnalytics } from './analytics'
import * as std from './calculators/standard'
import * as taiko from './calculators/taiko'
import * as taikoReader from './objects/taiko/taikoReader'
import * as timingsReader from './util/timingsReader'
import { ParsedTaikoResult } from './objects/taiko/parsedTaikoResult'
import { PageInfo } from './util/pageInfo'
import Mth from './util/mth'
import { TimingPoint } from './util/timingPoint'
import Console from './util/console'

require('./notifications')

const FETCH_ATTEMPTS = 3
const UNSUPPORTED_GAMEMODE = 'Unsupported gamemode!' // TODO: Add to translations

const containerElement = document.getElementById('container')!
const headerElement = document.getElementById('header')!
const versionElement = document.querySelector('.version') as HTMLElement
const titleElement = document.querySelector('.song-title') as HTMLElement
const artistElement = document.querySelector('.artist') as HTMLElement
const fcResetButton = document.querySelector('.fc-reset') as HTMLElement
const difficultyNameElement = document.getElementById(
  'difficulty-name'
) as HTMLElement
const difficultyStarsElement = document.getElementById(
  'difficulty-stars'
) as HTMLElement
// @ts-ignore
const modifierElements = [...document.querySelectorAll('.mod>input')]
const accuracyElement = document.getElementById('accuracy') as HTMLFormElement
const comboElement = document.getElementById('combo') as HTMLFormElement
const missesElement = document.getElementById('misses') as HTMLFormElement
const resultElement = document.getElementById('result') as HTMLElement
const errorElement = document.getElementById('error') as HTMLElement
const bpmElement = document.getElementById('bpm') as HTMLElement
const arElement = document.getElementById('ar') as HTMLElement

const setResultText = createTextSetter(resultElement, 'result')

versionElement.innerText = `ezpp! v${manifest.version}`

// Set after the extension initializes, used for additional error information.
let currentUrl: string
let cleanBeatmap: ojsama.beatmap
let parsedTaikoResult: ParsedTaikoResult
let timingPoints: Array<TimingPoint>
let pageInfo: PageInfo

const keyModMap: { [key: string]: string } = {
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
const MODE_CATCH = 2
const MODE_MANIA = 3

const setSongDetails = (metadataInOriginalLanguage: boolean) => {
  if (!cleanBeatmap) return

  const { artist, artist_unicode, title, title_unicode } = cleanBeatmap
  titleElement.innerText = metadataInOriginalLanguage
    ? title_unicode || title
    : title
  artistElement.innerText = metadataInOriginalLanguage
    ? artist_unicode || artist
    : artist
}

const getMaxCombo = () => {
  if (!cleanBeatmap) return -1
  if (cleanBeatmap.mode === MODE_STANDARD) {
    return cleanBeatmap.max_combo()
  }
  if (cleanBeatmap.mode === MODE_TAIKO) {
    return pageInfo.beatmap.max_combo || 0
  }

  return -1
}

const getCalculationSettings = () => {
  // Bitwise OR the mods together
  const modifiers: number = modifierElements.reduce(
    (num, element) => num | (element.checked ? parseInt(element.value) : 0),
    0
  )

  // An error might be reported before the beatmap is loaded.
  const maxCombo = getMaxCombo()

  const accuracy = Mth.clamp(
    parseFloat(accuracyElement.value.replace(',', '.')),
    0,
    100
  )
  const combo = Mth.clamp(
    parseInt(comboElement.value) || maxCombo,
    0,
    maxCombo || 0
  )
  const misses = Mth.clamp(parseInt(missesElement.value) || 0, 0, maxCombo)

  return {
    modifiers,
    accuracy,
    combo,
    misses,
  }
}

const trackError = (error: ErrorEvent | Error): any => {
  // Don't report unsupported gamemode errors.
  if (error.message === UNSUPPORTED_GAMEMODE) {
    return
  }
  const name = error instanceof ErrorEvent ? error.error.name : error.name
  const stack = error instanceof ErrorEvent ? error.error.stack : error.stack
  Console.error(stack)

  const report = {
    version: manifest.version,
    url: currentUrl,
    calculationSettings: getCalculationSettings(),
    pageInfo,

    error: {
      message: error.message,
      // @ts-ignore
      arguments: error.arguments,
      // @ts-ignore
      type: error.type,
      name,
      stack,
    },

    navigator: {
      userAgent: window.navigator.userAgent,
    },
  }

  _gaq.push(['_trackEvent', 'error', JSON.stringify(report)])
}

const displayError = (error: Error) => {
  trackError(error)
  errorElement.innerText = error.message
  containerElement.classList.toggle('error', true)
  containerElement.classList.toggle('preloading', false)
}

const debounce = (
  fn: (args: Array<any>) => void,
  timeout: number
): ((args: any) => void) => {
  let debounceTimeout: number

  return (...args) => {
    clearTimeout(debounceTimeout)
    // @ts-ignore it's actually number
    debounceTimeout = setTimeout(() => fn(...args), timeout)
  }
}

const trackCalculate = (() => {
  let lastData: { [key: string]: any } = {}

  return (analyticsData: { [key: string]: any }) => {
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
          cleanBeatmap.ar === undefined
            ? '?'
            : (
                Math.round(
                  std.calculateApproachRate(modifiers, cleanBeatmap.ar) * 10
                ) / 10
              ).toString()
        break

      case MODE_TAIKO:
        document.documentElement.classList.add('mode-taiko')
        const attr = taiko.calculate(
          cleanBeatmap,
          modifiers,
          parsedTaikoResult,
          !!pageInfo.convert
        )
        Console.log('osu!taiko star rating calculation result:', attr)
        pageInfo.beatmap.max_combo = attr.maxCombo
        resetCombo() // we changed max combo above, so we need to apply changes here.
        stars = { total: attr.starRating }
        pp = taiko.calculatePerformance(
          cleanBeatmap,
          attr,
          modifiers,
          combo,
          misses,
          accuracy
        )
        break

      default:
    }
    if (!pp) throw new Error('pp is null') // this shouldn't happen

    const { beatmapId } = pageInfo

    const analyticsData = {
      beatmapId: parseInt(beatmapId),
      modifiers,
      accuracy,
      combo,
      misses,
      stars: parseFloat(stars.total.toFixed(1)),
      pp: parseFloat(pp.total.toFixed(2)),
    }

    // Track results
    trackCalculateDebounced(analyticsData)

    difficultyStarsElement.innerText = stars.total.toFixed(2)
    bpmElement.innerText = (Math.round(bpm * 10) / 10).toString()

    setResultText(Math.round(pp.total))
  } catch (error) {
    displayError(error)
  }
}

const opposingModifiers = [
  ['mod-hr', 'mod-ez'],
  ['mod-ht', 'mod-dt'],
]

const toggleOpposingModifiers = (mod: string) => {
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

const fetchBeatmapById = (id: number) =>
  fetch(`https://osu.ppy.sh/osu/${id}`, {
    credentials: 'include',
  }).then((res) => res.text())

const getPageInfo = (url: string, tabId: number): Promise<PageInfo> =>
  new Promise((resolve, reject) => {
    const info = {
      isOldSite: false,
      beatmapSetId: '',
      beatmapId: '',
      stars: 0,
      beatmap: {},
      mode: '',
      convert: {},
    }

    const match = url.match(BEATMAP_URL_REGEX)!
    info.isOldSite = match[2] !== 'beatmapsets'

    if (!info.isOldSite) {
      const mode = match[5]
      const beatmapId = match[6]

      info.mode = mode
      info.beatmapSetId = match[3]
      info.beatmapId = beatmapId

      chrome.tabs.sendMessage(
        tabId,
        { action: 'GET_BEATMAP_STATS', beatmapId, mode },
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
          info.convert = response.convert
          // @ts-ignore
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
          // @ts-ignore
          resolve(info)
        }
      )
    }
  })

const attemptToFetchBeatmap = (id: number, attempts: number): Promise<string> =>
  fetchBeatmapById(id).catch((error) => {
    // Retry fetching until no attempts are left.
    if (attempts) return attemptToFetchBeatmap(id, attempts - 1)

    throw error
  })

const processBeatmap = (rawBeatmap: string) => {
  const { map } = new ojsama.parser().feed(rawBeatmap)
  parsedTaikoResult = taikoReader.feed(rawBeatmap, map.mode !== MODE_TAIKO)
  timingPoints = timingsReader.feed(rawBeatmap)

  cleanBeatmap = map

  // Support old beatmaps
  cleanBeatmap.mode = Number(cleanBeatmap.mode || MODE_STANDARD)
  if (pageInfo.mode === 'taiko') cleanBeatmap.mode = MODE_TAIKO
  if (pageInfo.mode === 'fruits') cleanBeatmap.mode = MODE_CATCH
  if (pageInfo.mode === 'mania') cleanBeatmap.mode = MODE_MANIA

  if (cleanBeatmap.mode !== MODE_STANDARD && cleanBeatmap.mode !== MODE_TAIKO) {
    throw Error(UNSUPPORTED_GAMEMODE)
  }
}

const fetchBeatmapBackground = (
  beatmapSetId: string
): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    // Preload beatmap cover
    const cover = new Image()
    cover.src = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/cover@2x.jpg`
    cover.onload = () => resolve(cover)
    cover.onerror = () => resolve(null)
    cover.onabort = () => resolve(null)
  })

const handleSettings = (settings: { [key: string]: any }) => {
  document.documentElement.classList.toggle('darkmode', settings.darkmode)

  setLanguage(settings.language)

  setSongDetails(settings.metadataInOriginalLanguage)

  if (settings.analytics) {
    loadAnalytics()
  }
}

const initializeExtension = async ({
  url: tabUrl,
  id: tabId,
}: {
  url?: string
  id?: number
}) => {
  try {
    const settings = await loadSettings()

    handleSettings(settings)
    onSettingsChange(handleSettings)

    currentUrl = tabUrl!
    pageInfo = await getPageInfo(tabUrl!, tabId!)

    const [, backgroundImage] = await Promise.all([
      attemptToFetchBeatmap(parseInt(pageInfo.beatmapId), FETCH_ATTEMPTS).then(
        processBeatmap
      ),
      fetchBeatmapBackground(pageInfo.beatmapSetId),
    ])

    // Set header background
    if (backgroundImage) {
      headerElement.style.backgroundImage = `url('${backgroundImage.src}')`
    }

    // Set header content
    setSongDetails(settings.metadataInOriginalLanguage)
    difficultyNameElement.innerText = cleanBeatmap.version

    // Display content since we're done loading all the stuff.
    containerElement.classList.toggle('preloading', false)

    modifierElements.forEach((modElement) => {
      modElement.addEventListener(
        'click',
        ({ target }: { target: Element }) => {
          toggleOpposingModifiers(target.id)
          calculate()
        }
      )
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
  } catch (err) {
    displayError(err)
  }
}

// Track errors with GA
window.addEventListener('error', trackError)

if (__FIREFOX__) {
  containerElement.classList.toggle('firefox', true)
  document.documentElement.classList.toggle('firefox', true)
}

chrome.tabs.query(
  {
    active: true, // Select active tabs
    lastFocusedWindow: true, // In the current window
  },
  ([tab]) => {
    initializeExtension(tab)
  }
)
