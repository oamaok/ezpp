import ojsama from 'ojsama';
import manifest from '../static/manifest.json';
import { setLanguage, createTextSetter } from './translations';
import { BEATMAP_URL_REGEX } from '../common/constants';

require('./analytics');
require('./settings');
require('./notifications');

const FETCH_ATTEMPTS = 3;
const UNSUPPORTED_GAMEMODE = 'Unsupported gamemode!'; // TODO: Add to translations

const containerElement = document.getElementById('container');
const headerElement = document.getElementById('header');
const versionElement = document.querySelector('.version');
const titleElement = document.querySelector('.song-title');
const artistElement = document.querySelector('.artist');
const fcResetButton = document.querySelector('.fc-reset');
const difficultyNameElement = document.getElementById('difficulty-name');
const difficultyStarsElement = document.getElementById('difficulty-stars');
const modifierElements = [...document.querySelectorAll('.mod>input')];
const accuracyElement = document.getElementById('accuracy');
const comboElement = document.getElementById('combo');
const missesElement = document.getElementById('misses');
const resultElement = document.getElementById('result');
const errorElement = document.getElementById('error');

const setResultText = createTextSetter(resultElement, 'result');

versionElement.innerText = `ezpp! v${manifest.version}`;

// Set after the extension initializes, used for additional error information.
let currentUrl = null;
let cleanBeatmap = null;
let pageInfo = {
  isOldSite: null,
  beatmapSetId: null,
  beatmapId: null,
};

const keyModMap = {
  'Q': 'mod-ez',
  'W': 'mod-nf',
  'E': 'mod-ht',
  'A': 'mod-hr',
  'D': 'mod-dt',
  'F': 'mod-hd',
  'G': 'mod-fl',
  'C': 'mod-so',
};

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

function getCalculationSettings() {
  // Bitwise OR the mods together
  const modifiers = modifierElements.reduce((num, element) => (
    num | (element.checked ? parseInt(element.value) : 0)
  ), 0);

  // An error might be reported before the beatmap is loaded.
  const maxCombo = cleanBeatmap ? cleanBeatmap.max_combo() : -1;

  const accuracy = clamp(parseFloat(accuracyElement.value.replace(',', '.')), 0, 100);
  const combo = clamp(parseInt(comboElement.value) || maxCombo, 0, maxCombo);
  const misses = clamp(parseInt(missesElement.value) || 0, 0, maxCombo);

  return {
    modifiers, accuracy, combo, misses,
  };
}

function trackError(error) {
  // Don't report unsupported gamemode errors.
  if (error.message === UNSUPPORTED_GAMEMODE) {
    return;
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
  };

  _gaq.push([
    '_trackEvent',
    'error',
    JSON.stringify(report),
  ]);
}

function displayError(error) {
  trackError(error);
  errorElement.innerText = error.message;
  containerElement.classList.toggle('error', true);
  containerElement.classList.toggle('preloading', false);
}

function debounce(fn, timeout) {
  let debounceTimeout = null;

  return (...args) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => fn(...args), timeout);
  };
}

const trackCalculate = (() => {
  let lastData = {};

  return (analyticsData) => {
    // Don't repeat calculation analytics
    const isClean = Object.keys(analyticsData).every(key => lastData[key] === analyticsData[key]);
    if (isClean) return;

    lastData = Object.assign({}, analyticsData);

    _gaq.push(['_trackEvent', 'calculate', JSON.stringify(analyticsData)]);
  };
})();

const trackCalculateDebounced = debounce(trackCalculate, 750);

function calculate() {
  try {
    const {
      modifiers, accuracy, combo, misses,
    } = getCalculationSettings();

    const stars = new ojsama.diff().calc({ map: cleanBeatmap, mods: modifiers });

    const pp = ojsama.ppv2({
      stars,
      combo,
      nmiss: misses,
      acc_percent: accuracy,
    });

    const { beatmapId } = pageInfo;

    const analyticsData = {
      beatmapId: parseInt(beatmapId),
      modifiers: parseInt(modifiers),
      accuracy: parseFloat(accuracy),
      combo: parseInt(combo),
      misses: parseInt(misses),
      stars: parseFloat(stars.total.toFixed(2)),
      pp: parseFloat(pp.total.toFixed(2)),
    };

    // Track results
    trackCalculateDebounced(analyticsData);

    difficultyStarsElement.innerText = stars.total.toFixed(2);

    setResultText(Math.round(pp.total));
  } catch (error) {
    displayError(error);
  }
}

const opposingModifiers = [
  ['mod-hr', 'mod-ez'],
  ['mod-ht', 'mod-dt'],
];

function toggleOpposingModifiers(mod) {
  opposingModifiers.forEach((mods) => {
    const index = mods.indexOf(mod);
    if (index !== -1) {
      const name = mods[1 - index];
      modifierElements.find(({ id }) => id === name).checked = false;
    }
  });
}

function resetCombo() {
  comboElement.value = cleanBeatmap.max_combo();
}

function onReady([, cover]) {
  // Display content since we're done loading all the stuff.
  containerElement.classList.toggle('preloading', false);

  // Set header background
  if (cover) {
    headerElement.style.backgroundImage = `url('${cover.src}')`;
  }

  // Set header text
  titleElement.innerText = cleanBeatmap.title;
  artistElement.innerText = cleanBeatmap.artist;
  difficultyNameElement.innerText = cleanBeatmap.version;

  modifierElements.forEach((modElement) => {
    modElement.addEventListener('click', ({ target }) => {
      toggleOpposingModifiers(target.id);
      calculate();
    });
  });

  window.addEventListener('keydown', ({ key = '' }) => {
    const mod = keyModMap[key.toUpperCase()];

    if (mod) {
      const element = modifierElements.find(({ id }) => id === mod);
      element.checked = !element.checked;

      toggleOpposingModifiers(mod);
      calculate();
    }
  });

  accuracyElement.addEventListener('input', calculate);
  comboElement.addEventListener('input', calculate);
  missesElement.addEventListener('input', calculate);

  fcResetButton.addEventListener('click', () => {
    resetCombo();
    calculate();
  });

  // Set the combo to the max combo by default
  resetCombo();

  calculate();
}

const fetchBeatmapById = id =>
  fetch(`https://osu.ppy.sh/osu/${id}`, { credentials: 'include' })
    .then(res => res.text());

const getPageInfo = (url, tabId) => new Promise((resolve) => {
  const info = {
    isOldSite: null,
    beatmapSetId: null,
    beatmapId: null,
  };

  const match = url.match(BEATMAP_URL_REGEX);
  info.isOldSite = match[2] !== 'beatmapsets';

  if (!info.isOldSite) {
    const beatmapId = match[4];

    if (!beatmapId) {
      throw new Error(UNSUPPORTED_GAMEMODE);
    }

    info.beatmapSetId = match[3];
    info.beatmapId = beatmapId.substr(5);

    resolve(info);
  } else {
    // Fetch data from the content script so we don't need to fetch the page
    // second time.
    chrome.tabs.sendMessage(tabId, { action: 'GET_BEATMAP_INFO' }, (response) => {
      const { beatmapId, beatmapSetId } = response;
      info.beatmapSetId = beatmapSetId;
      info.beatmapId = beatmapId;

      resolve(info);
    });
  }
});

const attemptToFetchBeatmap = (id, attempts) => fetchBeatmapById(id)
  .catch((error) => {
    // Retry fetching until no attempts are left.
    if (attempts) return attemptToFetchBeatmap(id, attempts - 1);

    throw error;
  });

const processBeatmap = (rawBeatmap) => {
  const { map } = new ojsama.parser().feed(rawBeatmap);

  cleanBeatmap = map;

  // Support old beatmaps
  cleanBeatmap.mode = Number(cleanBeatmap.mode || 0);

  if (cleanBeatmap.mode !== 0) {
    throw Error(UNSUPPORTED_GAMEMODE);
  }
};

const fetchBeatmapBackground = beatmapSetId =>
  new Promise((resolve) => {
    // Preload beatmap cover
    const cover = new Image();
    cover.src = `https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/cover@2x.jpg`;
    cover.onload = () => resolve(cover);
    cover.onerror = () => resolve();
    cover.onabort = () => resolve();
  });

// Track errors with GA
window.addEventListener('error', trackError);

if (__FIREFOX__) {
  containerElement.classList.toggle('firefox', true);
  document.documentElement.classList.toggle('firefox', true);
}

chrome.storage.local.get(['language'], ({ language }) => {
  setLanguage(language || 'en');
});

// Init the extension.
chrome.tabs.query({
  active: true, // Select active tabs
  lastFocusedWindow: true, // In the current window
}, ([tab]) => {
  const { url, id } = tab;
  currentUrl = url;

  getPageInfo(url, id).then((info) => {
    pageInfo = info;

    return Promise.all([
      attemptToFetchBeatmap(pageInfo.beatmapId, FETCH_ATTEMPTS)
        .then(processBeatmap),
      fetchBeatmapBackground(pageInfo.beatmapSetId),
    ]);
  })
    .then(onReady)
    .catch(displayError);
});
