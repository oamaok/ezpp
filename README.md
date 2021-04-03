# ezpp!

ezpp! is a browser extension that allows you to calculate pp
values for a beatmap without manually downloading the beatmap.


## Translating

All translation efforts are warmly welcome! The base English translations can be found [here](https://github.com/oamaok/ezpp/blob/master/translations/en.json). After translating the file you should also add relevant information to [this file](https://github.com/oamaok/ezpp/blob/master/translations/languages.json), where the `code` field should match with the `.json` file you created. If you are unsure on how to edit the files, feel free to [raise an issue](https://github.com/oamaok/ezpp/issues/new) or ask away in the pull request.

## Developing

### Prerequisities

Versions of software used at the time of writing:

```shell
[teemu@home ezpp]$ node -v
v14.15.4
[teemu@home ezpp]$ yarn -v
1.22.4
```

### Setup

Clone the repository and run the following commands.
```
yarn
```

### Chromium-based browsers

 - Run `yarn start:chrome`. This will create a `build/` directory to the repository root.
 - Open up Chrome and navigate to `chrome://extensions`.
 - Enable `Developer mode`.
 - Click the `Load unpacked` button and select the previously mentioned `build` directory. 
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `yarn start:chrome` script is running.

To build a production version of the package, run `yarn build:chrome`.

### Firefox

 - Run `yarn start:firefox`. This will create a `build/` directory to the repository root.
 - Open up Firefox and navigate to `about:debugging#/runtime/this-firefox`.
 - Click the `Load Temporary Add-on` button and select any file in the previously mentioned directory.
 - The extension is now ready to go!

All the changes made are compiled automatically as long as the `yarn start:firefox` script is running.

To build a production version of the package, run `yarn build:firefox`.

### Production builds

Run `yarn build:all`. Two files, `ezpp-chrome.zip` and `ezpp-firefox.zip`, are generated.

## Installing

Chrome/Chromium: [Install from Google WebStore](https://chrome.google.com/webstore/detail/ezpp/aimihpobjpagjiakhcpijibnaafdniol)

Firefox: [Install from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/ezpp/)

## License

[MIT](https://github.com/oamaok/ezpp/blob/master/LICENSE)
