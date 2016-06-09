// Include styles
require('../sass/main.sass');

// Other imports
import osuParser from 'osu-parser-web';
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

// Init the extension.
chrome.tabs.query({
    active: true, // Select active tabs
    lastFocusedWindow: true // In the current window
}, tabs => {
  const url = tabs[0].url;
  const match = url.toLowerCase().match(/^https?:\/\/(osu|new).ppy.sh\/([bs])\/(\d+)/);
  pageInfo.isOldSite = match[1] == 'osu';
  pageInfo.isBeatmap = match[2] == 'b';
  const id = match[3];

  // Fetch the current page for data not found in the url.
  fetch(url)
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
    console.log(pageInfo.isUnranked);

    return fetch(`https://osu.ppy.sh/osu/${pageInfo.beatmapId}`);
  })
  .then(res => res.text())
  .then(osuParser.parseContent)
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
      cover.onerror = () => resolve(cover);
      cover.onabort = () => resolve(cover);
    });
  })
  .then(onReady);
});

const onReady = (cover) => {
  // Display content since we're done loading all the stuff.
  containerElement.classList.toggle('preloading', false);

  // Set header background
  headerElement.style.backgroundImage = `url('${cover.src}')`;

  // Set header text
  titleElement.innerText = `${cleanBeatmap.Artist} - ${cleanBeatmap.Title} [${cleanBeatmap.Version}]`;

  document.addEventListener('keydown', evt => {
    // Check for enter
    if (evt.keyCode == 13)
      calculate();
  });
  calculateElement.addEventListener('click', calculate);

  // Hide the result div if the form is fiddled with
  const hide = () => resultElement.classList.toggle('hidden', true);
  Array.from(modifierElements).forEach(modElement => modElement.addEventListener('click', hide));
  accuracyElement.addEventListener('keydown', hide);
  comboElement.addEventListener('keydown', hide);
  missesElement.addEventListener('keydown', hide);

};

const calculate = () => {
  resultElement.classList.toggle('hidden', true);
  // Bitwise OR the mods together
  const modifiers = Array.from(modifierElements).reduce((num, element) => (
    num | (element.checked ? parseInt(element.value) : 0)
  ), 0);

  const accuracy = parseFloat(accuracyElement.value) || 100;
  const combo = parseInt(comboElement.value) || 0;
  const misses = parseInt(missesElement.value) || 0;

  const beatmap = Beatmap.fromOsuParserObject(cleanBeatmap);
  const pp = PPCalculator.calculate(beatmap, accuracy, modifiers, combo, misses);
  resultElement.innerText = `That's about ${Math.round(pp)}pp.`;
  resultElement.classList.toggle('hidden', false);
};