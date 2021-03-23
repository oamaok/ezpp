const SETTINGS = [
  {
    key: 'language',
    element: document.getElementById('language-selector'),
    type: 'string',
    default: 'en',
  },
  {
    key: 'metadataInOriginalLanguage',
    element: document.getElementById('metadata-in-original-language-toggle'),
    type: 'boolean',
    default: false,
  },
  {
    key: 'darkmode',
    element: document.getElementById('darkmode-toggle'),
    type: 'boolean',
    default: false,
  },
  {
    key: 'analytics',
    element: document.getElementById('analytics-toggle'),
    type: 'boolean',
    default: !__FIREFOX__,
  },
]

let currentSettings = {}
const settingsChangeListeners = []

SETTINGS.forEach((setting) => {
  // Initialize currentSettings to default values
  currentSettings[setting.key] = setting.default

  // Add event listeneres for all the setting elements
  setting.element.addEventListener('change', (evt) => {
    let value
    if (setting.type === 'boolean') value = evt.target.checked
    if (setting.type === 'string') value = evt.target.value

    chrome.storage.local.set({ [setting.key]: value })
    currentSettings[setting.key] = value

    settingsChangeListeners.forEach((fn) => fn(currentSettings))
  })
})

export const loadSettings = async () => {
  const keys = SETTINGS.map((setting) => setting.key)
  currentSettings = await new Promise((resolve) =>
    chrome.storage.local.get(keys, (storedSettings) => {
      const settings = {}
      SETTINGS.forEach((setting) => {
        const value = storedSettings[setting.key] ?? settings.default
        if (setting.type === 'string') setting.element.value = value
        if (setting.type === 'boolean') setting.element.checked = value
        settings[setting.key] = value
      })
      resolve(settings)
    })
  )

  return currentSettings
}

export const onSettingsChange = (fn) => {
  settingsChangeListeners.push(fn)
}

const settingsOpenButton = document.getElementById('open-settings')
const settingsCloseButton = document.getElementById('close-settings')
const settingsContainer = document.getElementById('settings')

settingsOpenButton.addEventListener('click', () => {
  _gaq.push(['_trackEvent', 'settings', 'open'])
  settingsContainer.classList.toggle('open', true)
})

settingsCloseButton.addEventListener('click', () => {
  _gaq.push(['_trackEvent', 'settings', 'close'])
  settingsContainer.classList.toggle('open', false)
})
