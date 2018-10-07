/* eslint-disable */

window._gaq = [];

if (__DEV__) {
  window._gaq.push = (data) => {
    console.log('Analytics event:', JSON.stringify(data, null, 2));
  }
}

const analyticsToggle = document.getElementById('analytics-toggle');

chrome.storage.local.get(['analytics'], ({ analytics }) => {
  const uninitialized = typeof analytics === 'undefined'

  if (uninitialized) {
    // Turn analytics off by default on firefox
    chrome.storage.local.set({
      analytics: !__FIREFOX__,
    })
  }

  const shouldInjectAnalytics = (uninitialized ? !__FIREFOX__ : analytics) && !__DEV__;

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