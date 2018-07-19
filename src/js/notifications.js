import manifest from '../static/manifest.json';
import { createTextSetter } from './translations';

const notificationElement = document.getElementById('notification');
const notificationClearElement = document.getElementById('notification-clear');
const versionElement = document.getElementById('version');

const setVersionText = createTextSetter(versionElement, 'version-update-message');

function clearNotification() {
  chrome.storage.local.set({
    displayNotification: false,
  });

  notificationElement.classList.toggle('hidden', true);
}

// Clear the notification
notificationClearElement.addEventListener('click', clearNotification);

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
    setVersionText(manifest.version);

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

    // Display the notification for max one hour
    const dayAfterUpdate = updatedAt + 60 * 60 * 1000;
    if (dayAfterUpdate < now) {
      clearNotification();
    }
  },
);
