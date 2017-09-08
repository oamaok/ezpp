const manifest = require('../static/manifest.json');

const notificationElement = document.getElementById('notification');
const notificationClearElement = document.getElementById('notification-clear');
const versionElement = document.getElementById('version');

versionElement.innerText = `v${manifest.version}`;

// Version change detection
chrome.storage.local.get(['version', 'displayNotification'], ({ version, displayNotification }) => {
  // First time using the extension, set the version
  // but don't display notifications
  if (!version) {
    chrome.storage.local.set({
      version: manifest.version,
      displayNotification: false,
    });
    return;
  }

  // Update detected, show notification and set the version
  if (version !== manifest.version) {
    chrome.storage.local.set({
      version: manifest.version,
      displayNotification: true,
    });
    notificationElement.classList.toggle('hidden', false);
  }

  if (displayNotification) {
    notificationElement.classList.toggle('hidden', false);
  }
});

// Clear the notification
notificationClearElement.addEventListener('click', () => {
  chrome.storage.local.set({
    displayNotification: false,
  });

  notificationElement.classList.toggle('hidden', true);
});
