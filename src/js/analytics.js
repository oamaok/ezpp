/* eslint-disable */

window._gaq = [];

const analyticsToggle = document.getElementById('analytics-toggle');

chrome.storage.local.get(['analytics'], ({ analytics }) => {
  const unitialized = typeof analytics === 'undefined'

  if (unitialized) {
    // Turn analytics off by default on firefox
    chrome.storage.local.set({
      analytics: !__FIREFOX__,
    })
  }

  const shouldInjectAnalytics = unitialized ? !__FIREFOX__ : analytics;

  analyticsToggle.checked = shouldInjectAnalytics;

  if (shouldInjectAnalytics) {
    _gaq.push(['_setAccount', 'UA-77789641-4']);
    _gaq.push(['_trackPageview']);

    const ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  }
})