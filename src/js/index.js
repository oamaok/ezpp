import ojsama from 'ojsama';
import manifest from '../static/manifest.json';
import { setLanguage, createTextSetter } from './translations';

require('./analytics');
require('./settings');
require('./notifications');

const FETCH_ATTEMPTS = 3;
const UNSUPPORTED_GAMEMODE = 'Unsupported gamemode!'; // TODO: Add to translations
const BEATMAP_URL_REGEX = /^https?:\/\/(osu|new).ppy.sh\/([bs]|beatmapsets)\/(\d+)\/?(#osu\/\d+)?/i;

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

const pageInfo = {
  isOldSite: null,
  isBeatmap: null,
  beatmapSetId: null,
  beatmapId: null,
  isUnranked: null,
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

const fetchBeatmapById = id => fetch(`https://osu.ppy.sh/osu/${id}`, { credentials: 'include' }).then(res => res.text());

function fetchBeatmapByUrl(url) {
  const match = url.match(BEATMAP_URL_REGEX);
  pageInfo.isOldSite = match[2] !== 'beatmapsets';

  // This value is only used for the old site.
  pageInfo.isBeatmap = match[2] === 'b';

  const id = match[3];

  if (!pageInfo.isOldSite) {
    const beatmapId = match[4];

    if (!beatmapId) {
      return Promise.reject(new Error(UNSUPPORTED_GAMEMODE));
    }

    pageInfo.beatmapSetId = match[3];
    pageInfo.beatmapId = beatmapId.substr(5);
    return fetchBeatmapById(pageInfo.beatmapId);
  }

  // For the old version of the site ID values must be found from the page source.
  return fetch(url, { credentials: 'include' })
    .then(res => res.text())
    .then((html) => {
      const setIdMatch = html
        .match(/beatmap-rating-graph\.php\?s=(\d+)/);
      const beatmapIdMatch = html
        .match(/class=["']beatmapTab active["'] href=["']\/b\/(\d+)/);

      if (!setIdMatch || !beatmapIdMatch) {
        return Promise.reject(new Error(`
          ezpp! is experiencing some issues related to the new osu! website rollout.
          Please use the new look for the extenstion to work. Sorry for the inconvenience.
        `));
      }

      pageInfo.beatmapSetId = pageInfo.isBeatmap ? setIdMatch[1] : id;
      pageInfo.beatmapId = pageInfo.isBeatmap ? id : beatmapIdMatch[1];

      // Check for 'Updated' text instead of 'Qualified' or 'Ranked'
      pageInfo.isUnranked = !!html
        .match('<td width=0%>\nSubmitted:<br/>\nUpdated:\n</td>');

      return fetchBeatmapById(pageInfo.beatmapId);
    });
}

const attemptToFetchBeatmap = (url, attempts) => fetchBeatmapByUrl(url)
  .catch((error) => {
    // Retry fetching until no attempts are left.
    if (attempts) return attemptToFetchBeatmap(url, attempts - 1);

    throw error;
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
  const { url } = tab;
  currentUrl = url;

  Promise.all([
    attemptToFetchBeatmap(url, FETCH_ATTEMPTS)
      .then(raw => new ojsama.parser().feed(raw))
      .then(({ map }) => {
        cleanBeatmap = map;

        // Support old beatmaps
        cleanBeatmap.mode = Number(cleanBeatmap.mode || 0);

        if (cleanBeatmap.mode !== 0) {
          throw Error(UNSUPPORTED_GAMEMODE);
        }
      }),
    new Promise((resolve) => {
      // Preload beatmap cover
      const cover = new Image();
      cover.src = pageInfo.isUnranked
        ? `https://b.ppy.sh/thumb/${pageInfo.beatmapSetId}l.jpg`
        : `https://assets.ppy.sh//beatmaps/${pageInfo.beatmapSetId}/covers/cover.jpg`;
      cover.onload = () => resolve(cover);
      cover.onerror = () => resolve();
      cover.onabort = () => resolve();
    }),
  ])
    .then(onReady)
    .catch(displayError);
});
