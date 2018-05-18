# ezpp!

ezpp! is a browser extension which allows you to calculate pp
values for a beatmap without manually downloading the beatmap.

## Prerequisities

 - Node.js, NPM

## Translating

All translation efforst are warmly welcome! The base English translations can be found [here](https://github.com/oamaok/ezpp/blob/master/src/translations/en.json). After translating the file you should also add relevant information to [this file](https://github.com/oamaok/ezpp/blob/master/src/js/translations.js#L1-L14). If you are unsure on how to edit the files, feel free to [raise an issue](https://github.com/oamaok/ezpp/issues/new) or ask away in the pull request.

## Developing

Setup after cloning the repository:

```
npm install
```

### Chromium-based browsers

 - Run `npm run start:chrome`. This will create `dist` directory inside the directory containing the extension.
 - Open up Chrome and navigate to `chrome://extensions`.
 - Enable `Developer mode`.
 - Click the `Load unpacked extension...` button and select the previously mentioned  `dist` directory. 
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `npm run start:chrome` script is running. The extension reloads scripts and styles every time you refresh the `chrome://extensions` page.

To build a production version of the package, run `npm run build:chrome`.

### Firefox

 - Run `npm run start:firefox`. This will create `dist` directory inside the directory containing the extension.
 - Open up Firefox and navigate to `about:debugging`.
 - Click the `Load Temporary Add-on` button and select any file in the previously mentioned directory.
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `npm run start:firefox` script is running.

To build a production version of the package, run `npm run build:firefox`.

## Installing

Chrome/Chromium: [Install from Google WebStore](https://chrome.google.com/webstore/detail/ezpp/aimihpobjpagjiakhcpijibnaafdniol)

Firefox: [Install from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ezpp/)

## License

[MIT](https://github.com/oamaok/ezpp/blob/master/LICENSE)
