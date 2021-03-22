import ojsama from 'ojsama';
import manifest from '../static/manifest.json';
import { setLanguage, createTextSetter } from './translations';
import { BEATMAP_URL_REGEX } from '../common/constants';
import { calculateTaikoPerformance } from './calculators/taiko'

require('./analytics');
require('./settings');
require('./notifications');

const FETCH_ATTEMPTS = 3;
const UNSUPPORTED_GAMEMODE = 'Unsupported gamemode!'; // TODO: Add to translations
const MOD_EZ = 2;
const MOD_HR = 16;
const MOD_DT = 64;
const MOD_HT = 256;

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
const bpmElement = document.getElementById('bpm');
const arElement = document.getElementById('ar');
const resultDetailsElement = document.getElementById('result-details');

const setResultText = createTextSetter(resultElement, 'result');

versionElement.innerText = `ezpp! v${manifest.version}`;

// Set after the extension initializes, used for additional error information.
let currentUrl = null;
let cleanBeatmap = null;
let pageInfo = {
  isOldSite: null,
  beatmapSetId: null,
  beatmapId: null,
  stars: 0,
  ncircles: 0,
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

function getMaxCombo() {
  if (!cleanBeatmap) return -1;
  if (cleanBeatmap.mode === 0) {
    return cleanBeatmap.max_combo();
  }
  if (cleanBeatmap.mode === 1) {
    return pageInfo.ncircles;
  }
}

function getCalculationSettings() {
  // Bitwise OR the mods together
  const modifiers = modifierElements.reduce((num, element) => (
    num | (element.checked ? parseInt(element.value) : 0)
  ), 0);

  // An error might be reported before the beatmap is loaded.
  const maxCombo = getMaxCombo();

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
    const isClean = Object.keys(analyticsData).every((key) => lastData[key] === analyticsData[key]);
    if (isClean) return;

    lastData = { ...analyticsData };

    _gaq.push(['_trackEvent', 'calculate', JSON.stringify(analyticsData)]);
  };
})();

const trackCalculateDebounced = debounce(trackCalculate, 500);

function calculateDTAR(ms) {
  if (ms < 300) {
    return 11; // with DT, the AR is capped at 11
  } if (ms < 1200) {
    return 11 - (ms - 300) / 150;
  }
  return 5 - (ms - 1200) / 120;
}

function calculateAR(modifiers, ar) {
  let ms;
  switch (modifiers & (MOD_HT | MOD_DT | MOD_EZ | MOD_HR)) {
    case MOD_HR: return Math.min(10, ar * 1.4);
    case MOD_EZ: return ar / 2;

    case (MOD_DT + MOD_HR): {
      if (ar < 4) {
        ms = 1200 - 112 * ar;
      } else if (ar > 4) {
        ms = 740 - 140 * (ar - 4);
      } else {
        ms = 864 - 124 * (ar - 3);
      }
      return calculateDTAR(ms);
    }
    case (MOD_DT + MOD_EZ): return calculateDTAR(1200 - 40 * ar);

    case MOD_DT: return calculateDTAR(ar > 5 ? 200 + (11 - ar) * 100 : 800 + (5 - ar) * 80);
    case MOD_HT: {
      if (ar === 5) return 0;
      if (ar < 5) return -1.5 * (5 - ar);
      if (ar < 8) return 1.875 * ar;
      return 4 + 1.5 * (ar - 7);
    }

    case (MOD_HT + MOD_HR): {
      if (ar > 7) return 8.5;
      if (ar < 4) {
        ms = 2700 - 252 * ar;
      } else if (ar < 5) {
        ms = 1944 - 279 * (ar - 3);
      } else {
        ms = 1665 - 315 * (ar - 4);
      }
      if (ar < 6) {
        return 15 - ms / 120;
      } if (ar > 7) {
        return 13 - ms / 150;
      }
      return 15 - ms / 120;
    }
    case (MOD_HT + MOD_EZ): return -0.75 * (10 - ar);

    default: return ar;
  }
}

function calculate() {
  try {
    const {
      modifiers, accuracy, combo, misses,
    } = getCalculationSettings();

    let bpmMultiplier = 1;
    if (modifiers & MOD_DT) bpmMultiplier = 1.5;
    if (modifiers & MOD_HT) bpmMultiplier = 0.75;
    const msPerBeat = cleanBeatmap.timing_points[0].ms_per_beat;
    const bpm = 1 / msPerBeat * 1000 * 60 * bpmMultiplier;

    let stars = { total: 0 };
    let pp;
    if (cleanBeatmap.mode === 0) {
      stars = new ojsama.diff().calc({ map: cleanBeatmap, mods: modifiers });

      pp = ojsama.ppv2({
        stars,
        combo,
        nmiss: misses,
        acc_percent: accuracy,
      });
      resultDetailsElement.textContent = `Acc: ${Math.round(pp.acc * 10) / 10}, Aim: ${Math.round(pp.aim * 10) / 10}, Speed: ${Math.round(pp.speed * 10) / 10}`;
    }
    if (cleanBeatmap.mode === 1) {
      // todo: implement star rating calculator
      stars = { total: pageInfo.stars };
      pp = calculateTaikoPerformance(cleanBeatmap, stars.total, modifiers, combo, misses, accuracy);
      arElement.parentElement.style.display = 'none';
      resultDetailsElement.textContent = `Strain: ${Math.round(pp.strain * 10) / 10}, Accuracy: ${Math.round(pp.accuracy * 10) / 10}`;
      // disable spin out mod as taiko does not have this
      document.getElementById('mod-so').disabled = true;
      document.getElementById('mod-so').value = false;
      document.querySelector("label[for=mod-so]").style.display = 'none';
      // disable these mods as they are not supported yet (missing star rating calculator)
      document.getElementById('mod-hr').disabled = true;
      document.getElementById('mod-dt').disabled = true;
      document.getElementById('mod-ez').disabled = true;
      document.getElementById('mod-ht').disabled = true;
      document.getElementById('mod-hr').value = false;
      document.getElementById('mod-dt').value = false;
      document.getElementById('mod-ez').value = false;
      document.getElementById('mod-ht').value = false;
      document.querySelector("label[for=mod-hr]").style.display = 'none';
      document.querySelector("label[for=mod-dt]").style.display = 'none';
      document.querySelector("label[for=mod-ez]").style.display = 'none';
      document.querySelector("label[for=mod-ht]").style.display = 'none';
    }

    const { beatmapId } = pageInfo;

    const analyticsData = {
      beatmapId: parseInt(beatmapId),
      modifiers: parseInt(modifiers),
      accuracy: parseFloat(accuracy),
      combo: parseInt(combo),
      misses: parseInt(misses),
      stars: parseFloat(stars.total.toFixed(1)),
      pp: parseFloat(pp.total.toFixed(2)),
    };

    // Track results
    trackCalculateDebounced(analyticsData);

    difficultyStarsElement.innerText = stars.total.toFixed(2);
    bpmElement.innerText = Math.round(bpm * 10) / 10;
    if (cleanBeatmap.ar === null) {
      arElement.innerText = '?';
    } else {
      arElement.innerText = Math.round(calculateAR(modifiers, cleanBeatmap.ar) * 10) / 10;
    }

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
  comboElement.value = getMaxCombo();
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

const fetchBeatmapById = (id) => fetch(`https://osu.ppy.sh/osu/${id}`, { credentials: 'include' })
  .then((res) => res.text());

const getPageInfo = (url, tabId) => new Promise((resolve, reject) => {
  const info = {
    isOldSite: null,
    beatmapSetId: null,
    beatmapId: null,
    stars: 0,
    ncircles: 0,
  };

  const match = url.match(BEATMAP_URL_REGEX);
  info.isOldSite = match[2] !== 'beatmapsets';

  if (!info.isOldSite) {
    // match[5] contains gamemode: osu, taiko, fruits, mania
    const beatmapId = match[6];

    info.beatmapSetId = match[3];
    info.beatmapId = beatmapId;

    chrome.tabs.sendMessage(tabId, { action: 'GET_BEATMAP_INFO' }, (response) => {
      if (!response) return reject(new Error('Empty response from content script')); // I don't know why but it happened to me (acrylic-style) multiple times
      if (response.status === 'ERROR') {
        reject(response.error);
      } else {
        const { stars, ncircles } = response;
        info.stars = stars;
        info.ncircles = ncircles;
        resolve(info);
      }
    });
  } else {
    // Fetch data from the content script so we don't need to fetch the page
    // second time.
    chrome.tabs.sendMessage(tabId, { action: 'GET_BEATMAP_INFO' }, (response) => {
      if (response.status === 'ERROR') {
        reject(response.error);
      } else {
        const { beatmapId, beatmapSetId, stars, ncircles } = response;
        info.beatmapSetId = beatmapSetId;
        info.beatmapId = beatmapId;
        info.stars = stars;
        info.ncircles = ncircles;

        resolve(info);
      }
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

  if (cleanBeatmap.mode !== 0 && cleanBeatmap.mode !== 1) {
    throw Error(UNSUPPORTED_GAMEMODE);
  }
};

const fetchBeatmapBackground = (beatmapSetId) => new Promise((resolve) => {
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
