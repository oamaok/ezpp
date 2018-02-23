/* eslint-disable */

window._gaq = [];

if (!__FIREFOX__) {
  _gaq.push(['_setAccount', 'UA-77789641-4']);
  _gaq.push(['_trackPageview']);

  const ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
}