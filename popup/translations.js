/* eslint-disable global-require */
export const languages = require('../translations/languages.json')

const FALLBACK_LANGUAGE = 'en'

export const translations = languages.reduce(
  (acc, lang) => ({
    ...acc,
    [lang.code]: require(`../translations/${lang.code}.json`),
  }),
  {}
)

const languageSelector = document.getElementById('language-selector')

let currentLanguage = 'en'
const setterHooks = []

export function getTranslation(translationKey, ...args) {
  const template =
    translations[currentLanguage][translationKey] ||
    translations[FALLBACK_LANGUAGE][translationKey]

  if (!args.length) return template

  return args.reduce(
    (str, arg, index) => str.replace(new RegExp(`\\{${index}\\}`, 'g'), arg),
    template
  )
}

/* eslint-disable no-param-reassign */
export function createTextSetter(
  element,
  translationKey,
  property = 'innerText'
) {
  if (setterHooks.some((hook) => hook.element === element)) {
    throw new Error('This element already has a text setter')
  }

  const hook = {
    element,
    translationKey,
    property,
    args: [],
  }

  setterHooks.push(hook)

  return function setText(...args) {
    hook.args = args
    element[property] = getTranslation(translationKey, ...args)
  }
}

export function setLanguage(language) {
  document.documentElement.classList.remove(`lang-${currentLanguage}`)
  document.documentElement.classList.add(`lang-${language}`)

  currentLanguage = language
  languageSelector.value = language
  chrome.storage.local.set({ language })

  setterHooks.forEach(({ element, translationKey, property, args }) => {
    element[property] = getTranslation(translationKey, ...args)
  })
  ;[...document.querySelectorAll('[data-t]')].forEach((element) => {
    const translationKey = element.getAttribute('data-t')
    element.innerText = getTranslation(translationKey)
  })
}
