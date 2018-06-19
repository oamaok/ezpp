import manifest from '../static/manifest.json';
import { getTranslation } from './translations';

const notificationElement = document.getElementById('notification');
const notificationClearElement = document.getElementById('notification-clear');
const versionElement = document.getElementById('version');

versionElement.innerText = getTranslation('version-update-message', manifest.version);

function clearNotification() {
  chrome.storage.local.set({
    displayNotification: false,
  });

  notificationElement.classList.toggle('hidden', true);
}

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

    if (displayNotification) {
      notificationElement.classList.toggle('hidden', false);
    }

    // Display the notification for max 24h
    const dayAfterUpdate = updatedAt + 24 * 60 * 60 * 1000;
    if (dayAfterUpdate < now) {
      clearNotification();
    }
  },
);

// Clear the notification
notificationClearElement.addEventListener('click', clearNotification);
