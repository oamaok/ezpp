const manifest = require('json!../static/manifest.json');

const notificationElement = document.getElementById('notification');
const notificationClearElement = document.getElementById('notification-clear');

// Version change detection
chrome.storage.local.get(['version', 'displayNotification'], items => {
  if (items.version != manifest.version) {
    chrome.storage.local.set({
      version: manifest.version,
      displayNotification: true
    });

    notificationElement.classList.toggle('hidden', false);
  }

  if (items.displayNotification) {
    notificationElement.classList.toggle('hidden', false);
  }
});

notificationClearElement.addEventListener('click', evt => {
  chrome.storage.local.set({
    displayNotification: false
  });
  
  notificationElement.classList.toggle('hidden', true);
});