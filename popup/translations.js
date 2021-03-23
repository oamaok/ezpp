/* eslint-disable global-require */
import languages from '../translations/languages.json'
export { languages }

const FALLBACK_LANGUAGE = 'en'

const languageSelector = document.getElementById('language-selector')
languages
  .sort((a, b) => a.name.localeCompare(b.name))
  .forEach((language) => {
    const option = document.createElement('option')
    option.setAttribute('value', language.code)
    option.innerText = language.name
    languageSelector.appendChild(option)
  })

export const translations = languages.reduce(
  (acc, lang) => ({
    ...acc,
    [lang.code]: require(`../translations/${lang.code}.json`),
  }),
  {}
)

let currentLanguage
const setterHooks = []

export const getTranslation = (translationKey, ...args) => {
  if (!currentLanguage) return ''

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
export const createTextSetter = (
  element,
  translationKey,
  property = 'innerText'
) => {
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

  return (...args) => {
    hook.args = args
    element[property] = getTranslation(translationKey, ...args)
  }
}

export const setLanguage = (language) => {
  if (language === currentLanguage) return

  if (currentLanguage) _gaq.push(['_trackEvent', 'language', language])

  document.documentElement.classList.remove(`lang-${currentLanguage}`)
  document.documentElement.classList.add(`lang-${language}`)

  currentLanguage = language

  setterHooks.forEach(({ element, translationKey, property, args }) => {
    element[property] = getTranslation(translationKey, ...args)
  })
  ;[...document.querySelectorAll('[data-t]')].forEach((element) => {
    const translationKey = element.getAttribute('data-t')
    element.innerText = getTranslation(translationKey)
  })
}
