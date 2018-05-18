import en from '../translations/en.json';

[...document.querySelectorAll('[data-t]')].forEach((element) => {
  const translationKey = element.getAttribute('data-t');
  element.innerText = en[translationKey];
});
