# ezpp!

ezpp! is a chrome extension which allows you to calculate pp
values for a beatmap without manually downloading the beatmap.

## Developing

Prerequisities:
 - Your favorite code editor
 - Node.js, NPM
 - Chrome/Chromium browser OR Firefox

Setup after cloning the repository:
```
npm install
```

### Developing for Chrome/Chromium

 - Run `npm run-script dev:chrome`. This will create `dist` directory inside the directory containing the extension.
 - Open up Chrome and navigate to `chrome://extensions`.
 - Enable `Developer mode`.
 - Click the `Load unpacked extension...` button and select the previously mentioned  `dist` directory. 
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `npm run-script dev:chrome` script is running. The extension reloads scripts and styles every time you refresh the `chrome://extensions` page.

### Developing for Firefox

 - Run `npm run-script dev:firefox`. This will create `dist` directory inside the directory containing the extension.
 - Open up Firefox and navigate to `about:debugging`.
 - Click the `Load Temporary Add-on` button and select any file in the previously mentioned directory
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `npm run-script dev:firefox` script is running.

## Installing

Chrome/Chromium: [Install from Google WebStore](https://chrome.google.com/webstore/detail/ezpp/aimihpobjpagjiakhcpijibnaafdniol)

Firefox: [Install from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ezpp/)

## License

[GNU AFFERO GENERAL PUBLIC LICENSE](https://github.com/oamaok/ezpp/blob/master/LICENSE)
