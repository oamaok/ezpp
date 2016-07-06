# ezpp!

ezpp! is a chrome extension which allows you to calculate pp
values for a beatmap without manually downloading the beatmap.

## Developing

Prerequisities:
 - Node.js
 - Chrome/Chromium browser OR Firefox

Setup after cloning the repository:
```
npm install -g webpack
npm install
```

### Developing for Chrome/Chromium

 - Run `npm run-script chrome`. This will create `dist` directory inside the directory containing the repository.
 - Open up Chrome and navigate to `chrome://extensions`.
 - Enable `Developer mode`.
 - Click the `Load unpacked extension...` button and select the previously mentioned  `dist` directory. 
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `npm run-script chrome` script is running. The extension reloads scripts and styles every time you open the popup.

### Developing for Firefox

`/* TODO */`

## Installing

Chrome/Chromium: [Install from Google WebStore](https://chrome.google.com/webstore/detail/ezpp/aimihpobjpagjiakhcpijibnaafdniol)

Firefox: [Install from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ezpp/)

## License

[GNU AFFERO GENERAL PUBLIC LICENSE](https://github.com/oamaok/ezpp/blob/master/LICENSE)
