// Include styles
require('../sass/main.sass');

// Other imports
import OsuParser from 'osu-parser-web';
import {PPCalculator, Beatmap} from 'osu-pp-calculator';

const containerElement = document.getElementById('container');
const headerElement = document.getElementById('header');
const titleElement = document.getElementById('title');
const modifierElements = document.querySelectorAll('.mod>input');
const calculateElement = document.getElementById('calc-btn');
const accuracyElement = document.getElementById('accuracy');
const comboElement = document.getElementById('combo');
const missesElement = document.getElementById('misses');
const resultElement = document.getElementById('result');

let pageInfo = {
  isOldSite: null,
  isBeatmap: null,
  beatmapSetId: null,
  beatmapId: null,
  isUnranked: null,
};

let cleanBeatmap = null;
let debounceTimeout = null;

// Init the extension.
chrome.tabs.query({
    active: true, // Select active tabs
    lastFocusedWindow: true // In the current window
}, tabs => {
  const url = tabs[0].url;
  const match = url.toLowerCase().match(/^https?:\/\/(osu|new).ppy.sh\/([bs])\/(\d+)#?(\d+)?/);
  pageInfo.isOldSite = match[1] == 'osu';
  pageInfo.isBeatmap = match[2] == 'b';
  const id = match[3];

  let promise = null;

  if (pageInfo.isOldSite) {
    // For the old (current) version of the site ID values must be found from the page source.
    promise = fetch(url)
    .then(res => res.text())
    .then(html => {
      pageInfo.beatmapSetId = pageInfo.isBeatmap
        ? html.match(/beatmap-rating-graph\.php\?s=(\d+)/)[1]
        : id;

      pageInfo.beatmapId = pageInfo.isBeatmap
        ? id
        : html.match(/class='beatmapTab active' href='\/b\/(\d+)/)[1];

      // Check for 'Updated' text instead of 'Qualified' or 'Ranked'
      pageInfo.isUnranked = !!html.match('<td width=0%>\nSubmitted:<br/>\nUpdated:\n</td>');

      return fetch(`https://osu.ppy.sh/osu/${pageInfo.beatmapId}`);
    });
  } else {
    pageInfo.beatmapSetId = match[3];
    pageInfo.beatmapId = match[4];
    promise = fetch(`https://osu.ppy.sh/osu/${pageInfo.beatmapId}`);
  }

  promise.then(res => res.text())
  .then(OsuParser.parseContent)
  .then(beatmap => {
    cleanBeatmap = beatmap;
    
    // Preload beatmap cover
    const coverUrl = pageInfo.isUnranked
      ? `https://b.ppy.sh/thumb/${pageInfo.beatmapSetId}l.jpg`
      : `https://assets.ppy.sh//beatmaps/${pageInfo.beatmapSetId}/covers/cover.jpg`;
    let cover = new Image();
    cover.src = coverUrl;

    return new Promise(resolve => {
      cover.onload = () => resolve(cover);
      cover.onerror = () => resolve();
      cover.onabort = () => resolve();
    });
  })
  .then(onReady);
});

const onReady = (cover) => {
  // Display content since we're done loading all the stuff.
  containerElement.classList.toggle('preloading', false);

  // Set header background
  if (cover)
    headerElement.style.backgroundImage = `url('${cover.src}')`;

  // Set header text
  titleElement.innerText = `${cleanBeatmap.Artist} - ${cleanBeatmap.Title} [${cleanBeatmap.Version}]`;

  // Recalculate the result div if the form is fiddled with
  Array.from(modifierElements).forEach(
    modElement => modElement.addEventListener('click', debounce)
  );
  accuracyElement.addEventListener('keydown', debounce);
  comboElement.addEventListener('keydown', debounce);
  missesElement.addEventListener('keydown', debounce);

  calculate();
};

const debounce = () => {
  resultElement.classList.toggle('hidden', true);

  if (debounceTimeout)
    clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(calculate, 500);
};

const calculate = () => {
  // Bitwise OR the mods together
  const modifiers = Array.from(modifierElements).reduce((num, element) => (
    num | (element.checked ? parseInt(element.value) : 0)
  ), 0);

  const accuracy = parseFloat(accuracyElement.value) || 100;
  const combo = parseInt(comboElement.value) || undefined;
  const misses = parseInt(missesElement.value) || undefined;

  const beatmap = Beatmap.fromOsuParserObject(cleanBeatmap);
  const pp = PPCalculator.calculate(beatmap, accuracy, modifiers, combo, misses);
  resultElement.innerText = `That's about ${Math.round(pp)}pp.`;
  resultElement.classList.toggle('hidden', false);
};