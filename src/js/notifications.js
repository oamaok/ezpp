const manifest = require('../static/manifest.json');

const notificationElement = document.getElementById('notification');
const notificationClearElement = document.getElementById('notification-clear');
const versionElement = document.getElementById('version');

versionElement.innerText = `v${manifest.version}`;

// Version change detection
chrome.storage.local.get(
  [
    'version',
    'displayNotification',
    'updatedAt',
  ],
  ({
    version,
    displayNotification,
    updatedAt = 0,
  }) => {
    const now = new Date().getTime();

    // First time using the extension, set the version
    // but don't display notifications
    if (!version) {
      chrome.storage.local.set({
        version: manifest.version,
        updatedAt: now,
        displayNotification: false,
      });
      return;
    }

    // Update detected, show notification and set the version
    if (version !== manifest.version) {
      chrome.storage.local.set({
        version: manifest.version,
        updatedAt: now,
        displayNotification: true,
      });
      notificationElement.classList.toggle('hidden', false);
    }

    const dayAfterUpdate = updatedAt + 24 * 60 * 60 * 1000;

    // Display the notification for max 24h
    if (displayNotification && dayAfterUpdate < now) {
      notificationElement.classList.toggle('hidden', false);
    }
  },
);

// Clear the notification
notificationClearElement.addEventListener('click', () => {
  chrome.storage.local.set({
    displayNotification: false,
  });

  notificationElement.classList.toggle('hidden', true);
});
