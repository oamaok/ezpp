import { setLanguage, languages } from './translations';

const settingsOpenButton = document.getElementById('open-settings');
const settingsCloseButton = document.getElementById('close-settings');
const settingsContainer = document.getElementById('settings');
const languageSelector = document.getElementById('language-selector');
const analyticsToggle = document.getElementById('analytics-toggle');

settingsOpenButton.addEventListener('click', () => {
  _gaq.push(['_trackEvent', 'settings', 'open']);
  settingsContainer.classList.toggle('open', true);
});

settingsCloseButton.addEventListener('click', () => {
  _gaq.push(['_trackEvent', 'settings', 'close']);
  settingsContainer.classList.toggle('open', false);
});


// Initial state of the toggle is set in analytics.js
analyticsToggle.addEventListener('change', (evt) => {
  chrome.storage.local.set({
    analytics: evt.target.checked,
  });
});

Object.keys(languages).forEach((language) => {
  const option = document.createElement('option');
  option.setAttribute('value', language);
  option.innerText = languages[language];
  languageSelector.appendChild(option);
});

languageSelector.addEventListener('change', (evt) => {
  _gaq.push(['_trackEvent', 'language', evt.target.value]);
  setLanguage(evt.target.value);
});
