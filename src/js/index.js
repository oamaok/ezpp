import ojsama from 'ojsama';

require('./notifications');
require('./analytics');

const containerElement = document.getElementById('container');
const headerElement = document.getElementById('header');
const titleElement = document.getElementById('title');
const modifierElements = [...document.querySelectorAll('.mod>input')];
const accuracyElement = document.getElementById('accuracy');
const comboElement = document.getElementById('combo');
const missesElement = document.getElementById('misses');
const resultElement = document.getElementById('result');
const errorElement = document.getElementById('error');

if (__FIREFOX__) {
  containerElement.classList.toggle('firefox', true);
  document.documentElement.classList.toggle('firefox', true);
}

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

let cleanBeatmap = null;
let debounceTimeout = null;

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

// TODO: Add error logging to remote server?
const displayError = (error) => {
  errorElement.innerText = error.message;
  containerElement.classList.toggle('error', true);
  containerElement.classList.toggle('preloading', false);
};

const calculate = () => {
  // Wait until the user writes proper value
  if (!accuracyElement.value.length) {
    return;
  }

  // Bitwise OR the mods together
  const modifiers = modifierElements.reduce((num, element) => (
    num | (element.checked ? parseInt(element.value) : 0)
  ), 0);

  const maxCombo = cleanBeatmap.max_combo();

  const accuracy = clamp(parseFloat(accuracyElement.value), 0, 100);
  const combo = clamp(parseInt(comboElement.value) || maxCombo, 0, maxCombo);
  const misses = clamp(parseInt(missesElement.value) || 0, 0, maxCombo);

  accuracyElement.value = accuracy;
  comboElement.value = combo;
  missesElement.value = misses;

  const stars = new ojsama.diff().calc({ map: cleanBeatmap, mods: modifiers });

  const pp = ojsama.ppv2({
    stars,
    combo,
    nmiss: misses,
    acc_percent: accuracy,
  });

  const analyticsString = `${pageInfo.beatmapId}__${modifiers}__${accuracy}__${combo}__${misses}`;

  // Track results
  _gaq.push(['_trackEvent', 'calculate', analyticsString]);

  resultElement.innerText = `That's about ${Math.round(pp.total)}pp.`;
  resultElement.classList.toggle('hidden', false);
};

const debounce = () => {
  resultElement.classList.toggle('hidden', true);
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(calculate, 500);
};

const opposingModifiers = [
  ['mod-hr', 'mod-ez'],
  ['mod-ht', 'mod-dt'],
];

const toggleOpposingModifiers = (mod) => {
  opposingModifiers.forEach((mods) => {
    const index = mods.indexOf(mod);
    if (index !== -1) {
      const name = mods[1 - index];
      modifierElements.find(({ id }) => id === name).checked = false;
    }
  });
};

const onReady = (cover) => {
  // Display content since we're done loading all the stuff.
  containerElement.classList.toggle('preloading', false);

  // Set header background
  if (cover) {
    headerElement.style.backgroundImage = `url('${cover.src}')`;
  }

  // Set header text
  const title = `${cleanBeatmap.artist} - ${cleanBeatmap.title} [${cleanBeatmap.version}]`;
  titleElement.innerText = title;

  modifierElements.forEach((modElement) => {
    modElement.addEventListener('click', ({ target }) => {
      toggleOpposingModifiers(target.id);
      debounce();
    });
  });

  window.addEventListener('keydown', ({ key }) => {
    const mod = keyModMap[key.toUpperCase()];

    if (mod) {
      const element = modifierElements.find(({ id }) => id === mod);
      element.checked = !element.checked;

      toggleOpposingModifiers(mod);
      debounce();
    }
  });

  const debounceWithFilter = (evt) => {
    // Only allow number, decimal marker and backspace
    const allowedKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'Backspace', 'ArrowLeft', 'ArrowRight'];
    if (evt.key && !allowedKeys.includes(evt.key)) {
      evt.preventDefault();
      return;
    }

    const navKeys = ['ArrowLeft', 'ArrowRight'];
    if (!navKeys.includes(evt.key)) {
      debounce();
    }
  };

  accuracyElement.addEventListener('keydown', debounceWithFilter);
  comboElement.addEventListener('keydown', debounceWithFilter);
  missesElement.addEventListener('keydown', debounceWithFilter);

  // Set the combo to the max combo by default
  comboElement.value = cleanBeatmap.maxCombo;

  calculate();
};

const fetchBeatmap = id => fetch(`https://osu.ppy.sh/osu/${id}`);

// Init the extension.
chrome.tabs.query({
  active: true, // Select active tabs
  lastFocusedWindow: true, // In the current window
}, (tabs) => {
  const { url } = tabs[0];
  const match = url
    .toLowerCase()
    .match(/^https?:\/\/(osu|new).ppy.sh\/([bs]|beatmapsets)\/(\d+)#?(osu\/\d+)?/);
  pageInfo.isOldSite = match[2] !== 'beatmapsets';

  // This value is only used for the old site.
  pageInfo.isBeatmap = match[2] === 'b';

  const id = match[3];


  let promise = null;

  if (pageInfo.isOldSite) {
    // For the old (current) version of the site ID values must be found from the page source.
    promise = fetch(url, { credentials: 'include' })
      .then(res => res.text())
      .then((html) => {

        const setIdMatch = html.match(/beatmap-rating-graph\.php\?s=(\d+)/);
        const beatmapIdMatch = html.match(/class=["']beatmapTab active["'] href=["']\/b\/(\d+)/);

        if (!setIdMatch || !beatmapIdMatch) {
          return Promise.reject(new Error(`
            ezpp! is experiencing some issues related to the new osu! website rollout.
            Please use the new look for the extenstion to work. Sorry for the inconvenience.
          `));
        }

        pageInfo.beatmapSetId = pageInfo.isBeatmap ? setIdMatch[1] : id;
        pageInfo.beatmapId = pageInfo.isBeatmap ? id : beatmapIdMatch[1];

        // Check for 'Updated' text instead of 'Qualified' or 'Ranked'
        pageInfo.isUnranked = !!html.match('<td width=0%>\nSubmitted:<br/>\nUpdated:\n</td>');

        return fetchBeatmap(pageInfo.beatmapId);
      });
  } else {
    pageInfo.beatmapSetId = match[3];
    pageInfo.beatmapId = match[4].substr(4);
    promise = fetchBeatmap(pageInfo.beatmapId);
  }

  promise.then(res => res.text())
    .then(raw => new ojsama.parser().feed(raw))
    .then(({ map }) => {
      cleanBeatmap = map;

      // Support old beatmaps
      cleanBeatmap.mode = Number(cleanBeatmap.mode || 0);

      if (cleanBeatmap.mode !== 0) {
        throw Error('Unsupported gamemode!');
      }

      // Preload beatmap cover
      const coverUrl = pageInfo.isUnranked
        ? `https://b.ppy.sh/thumb/${pageInfo.beatmapSetId}l.jpg`
        : `https://assets.ppy.sh//beatmaps/${pageInfo.beatmapSetId}/covers/cover.jpg`;
      const cover = new Image();
      cover.src = coverUrl;

      return new Promise((resolve) => {
        cover.onload = () => resolve(cover);
        cover.onerror = () => resolve();
        cover.onabort = () => resolve();
      });
    })
    .then(onReady)
    .catch(displayError);
});
