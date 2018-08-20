import en from '../translations/en.json';
import fi from '../translations/fi.json';
import de from '../translations/de.json';
import es from '../translations/es.json';
import sk from '../translations/sk.json';
import ru from '../translations/ru.json';
import ro from '../translations/ro.json';

const languageSelector = document.getElementById('language-selector');

const languageMap = {
  fi,
  en,
  de,
  es,
  sk,
  ru,
  ro,
};

export const languages = {
  'en': 'English',
  'fi': 'Suomi (Finnish)',
  'de': 'Deutsch (German)',
  'es': 'Español (Spanish)',
  'sk': 'Slovenčina (Slovakian)',
  'ru': 'Русский (Russian)',
  'ro': 'Română (Romanian)',
};

let currentLanguage = 'en';
const setterHooks = [];

export function getTranslation(translationKey, ...args) {
  const template = languageMap[currentLanguage][translationKey];

  if (!args.length) return template;

  return args.reduce(
    (str, arg, index) => str.replace(new RegExp(`\\{${index}\\}`, 'g'), arg),
    template,
  );
}

export function createTextSetter(element, translationKey, property = 'innerText') {
  if (setterHooks.some(hook => hook.element === element)) {
    throw new Error('This element already has a text setter');
  }

  const hook = {
    element, translationKey, property, args: [],
  };

  setterHooks.push(hook);

  return function setText(...args) {
    hook.args = args;
    element[property] = getTranslation(translationKey, ...args);
  };
}

export function setLanguage(language) {
  currentLanguage = language;
  languageSelector.value = language;
  chrome.storage.local.set({ language });

  setterHooks.forEach(({
    element, translationKey, property, args,
  }) => {
    element[property] = getTranslation(translationKey, ...args);
  });

  [...document.querySelectorAll('[data-t]')].forEach((element) => {
    const translationKey = element.getAttribute('data-t');
    element.innerText = languageMap[language][translationKey];
  });
}
