import en from '../translations/en.json';
import fi from '../translations/fi.json';

const languageSelector = document.getElementById('language-selector');

const languageMap = {
  fi,
  en,
};

export const languages = {
  'en': 'English',
  'fi': 'Suomi (Finnish)',
};

let currentLanguage = 'en';

export function setLanguage(language) {
  currentLanguage = language;
  languageSelector.value = language;
  chrome.storage.local.set({ language });

  [...document.querySelectorAll('[data-t]')].forEach((element) => {
    const translationKey = element.getAttribute('data-t');
    element.innerText = languageMap[language][translationKey];
  });
}

export function getTranslation(translationKey, ...args) {
  const template = languageMap[currentLanguage][translationKey];

  if (!args.length) return template;

  return args.reduce(
    (str, arg, index) => str.replace(new RegExp(`\\{${index}\\}`, 'g'), arg),
    template
  );
}
