import { onSettingsChange } from './settings'

window._gaq = []

if (__DEV__) {
  window._gaq.push = (data) => {
    console.log('Analytics event:', JSON.stringify(data, null, 2))
  }
}

if (!__FIREFOX__ && !__DEV__) {
  let analyticsLoaded = false

  onSettingsChange(({ analytics }) => {
    if (analytics || !analyticsLoaded) {
      _gaq.push(['_setAccount', 'UA-77789641-4'])
      _gaq.push(['_trackPageview'])

      const ga = document.createElement('script')
      ga.type = 'text/javascript'
      ga.async = true
      ga.src = 'https://ssl.google-analytics.com/ga.js'
      const s = document.getElementsByTagName('script')[0]
      s.parentNode.insertBefore(ga, s)

      analyticsLoaded = true
    }
  })
}
