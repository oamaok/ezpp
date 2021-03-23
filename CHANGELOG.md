# ezpp! changelog

[google web store](https://chrome.google.com/webstore/detail/ezpp/aimihpobjpagjiakhcpijibnaafdniol) - [firefox add-ons](https://addons.mozilla.org/fi/firefox/addon/ezpp/) - [source code](https://github.com/oamaok/ezpp) - [github](https://github.com/oamaok/ezpp) - [issues](https://github.com/oamaok/ezpp/issues)

## v1.10.1
 - Fix AR calculations (thanks to [acrylic-style](https://github.com/acrylic-style))
 - Add setting to use original song metadata (thanks to [acrylic-style](https://github.com/acrylic-style))
 - Fix Swedish translation file encoding (thanks to [Walavouchey](https://github.com/Walavouchey))
 - Remove local changelog, use GitHub link instead
 - Refactor settings system

## v1.10.0
 - Add Taiko support (thanks to [acrylic-style](https://github.com/acrylic-style))
 - Add Swedish translations (thanks to [Walavouchey](https://github.com/Walavouchey))
 - Calculator code refactoring
 - Minor stylistic improvements

## v1.9.0
 - Display AR (thanks to [acrylic-style](https://github.com/acrylic-style))
 - Fix BPM display for HT (thanks to [acrylic-style](https://github.com/acrylic-style))
 - Add Hungarian translations (thanks to [Tudi20](https://github.com/Tudi20))
 - Add Turkish translations (thanks to [EmirhaN998](https://github.com/EmirhaN998))
 - Update pp calculation package [ojsama](https://github.com/Francesco149/ojsama) (thanks to [hesch](https://github.com/hesch))

## v1.8.6
 - Display BPM
 - Remove analytics for Firefox

## v1.8.5
 - Update [ojsama](https://github.com/Francesco149/ojsama) to v1.2.5

## v1.8.4
 - Update Japanese translations (thanks to [sjcl](https://github.com/sjcl))
 - Update Spanish translations (thanks to [Alejandro Loarca](https://github.com/loarca))
 - Update Finnish translations

## v1.8.3
 - Add darkmode
 - Add Korean translations (thanks to [pine5508](https://github.com/pine5508))

## v1.8.2
 - Even more accurate pp calculations
 - Add Simplified Chinese translations (thanks to [TsukiPoi](https://github.com/TsukiPoi))

## v1.8.1
 - Update pp calculations to accurately match the pp rebalance
 - Add Brazilian Portuguese translations (thanks to [ekisu](https://github.com/ekisu))

## v1.8.0
 - Update pp calculations to match the rebalance (almost)
 - Add Traditional Chinese translations (thanks to [tomokarin](https://github.com/tomokarin))
 - Add Italian translations (thanks to [Frank1907](https://github.com/Frank1907))

## v1.7.3
 - Fix addon not working on the old site while not logged in
 - Add error reporting to content script

## v1.7.2
 - Hide extension after changing to a non-beatmap page on new site
 - Use Exo as font only for Vietnamese

## v1.7.1
 - Use Exo as font for Vietnamese support
 - Bundle images and fonts as assets

## v1.7.0
 - Add Japanese translation (thanks to [sjcl](https://github.com/sjcl))
 - Add Vietnamese translation (thanks to [natsukagami](https://github.com/natsukagami))
 - Rework project structure
 - Rework page information resolving

## v1.6.0
 - Display calculation results immediately
 - Remove input limitations
 - Load beatmap and beatmap background in parallel for faster boot
 - Minor stylistic enhancements

## v1.5.12
 - Fix font size on some Windows machines
 - Display current version inside the header

## v1.5.11
 - Fix star rating display logic
 - Fix notification system

## v1.5.10
 - Add Polish translation (thanks to [Desconocidosmh](https://github.com/Desconocidosmh))
 - Display star difficulty
 - Minor content align fixes
 - Improve translation system
 - Upgrade bundling system

## v1.5.9
 - Remove erroneous analytics data object
 - Format analytics numerals properly

## v1.5.8
 - Improve calculation analytics format
 - Minor code style improvements

## v1.5.7
 - Add Romanian translation (thanks to [NoireHime](https://github.com/NoireHime))
 - Add French translation (thanks to [xZoomy](https://github.com/xZoomy))
 - Fix error display
 - Sort languages by language code

## v1.5.6
 - Add Russian translation (thanks to [pazzaru](https://github.com/pazzaru))
 - Add Slovakian translation (thanks to [Thymue](https://github.com/Thymue))
 - Update [ojsama](https://github.com/Francesco149/ojsama) to fix rare calculation error

## v1.5.5
 - Fix settings panel opening under main panel

## v1.5.4
 - Minor stylistic changes
 - Harden the extension against network errors
 - Fix bug affecting some Vietnamese users (Cốc Cốc browser)
 - Send calculation settings in error reports

## v1.5.3
 - Allow 'Delete' key in fields
 - Add Github link
 - Send current browser and beatmap URL in error reports

## v1.5.2
 - Improved translation system
 - Improved error reporting
 - Minor analytics enhancements

## v1.5.1
 - Fix update notification popping up every time

## v1.5.0
 - Add settings menu
 - Add translations (fi, en, de, es)
 - Add analytics toggle

## v1.4.8
 - Update PP calculations to match the HD rebalance
 - Allow comma as a decimal separator
 - Minor stylistic changes

## v1.4.7
 - Fix URL parsing, again :(

## v1.4.6
 - Fix URL parsing error causing failures with the new osu! website

## v1.4.5
 - Send errors to Google Analytics for easier debugging

## v1.4.4.
 - Try to fix error related to new osu! website rollout

## v1.4.3
 - Analytics fix

## v1.4.2
 - Allow navigation with arrow keys in numeric inputs
 - Improve analytics

## v1.4.1
 - Fix HalfTime mod

## v1.4.0
 - Use [ojsama](https://github.com/Francesco149/ojsama) for pp calculations

## v1.3.2
 - Add keyboard shortcuts for mods (thanks to [Artikash](https://github.com/Artikash) for initial implementation!)
 - Minor refactoring

## v1.3.1
 - Use local fonts and images
 - Remove analytics from the Firefox version
 - Minor code cleaning

## v1.3.0
 - Build process improvements
 - Separation of styles from script files
 - Firefox update \o/

## v1.2.15
 - Fix proper error messages not being displayed

## v1.2.14
 - Fix site version detection
 - Add cleaner error display
 - Minor stylistic changes

## v1.2.13
 - Fix errors caused by changes in osu.ppy.sh HTML generation

## v1.2.12
 - Add analytics

## v1.2.11
 - Fix the extension not working on [http://new.ppy.sh](http://new.ppy.sh) beatmapset pages

## v1.2.10
 - Fix CS buff not capping at 5

## v1.2.9
 - Fix not being able to select mods

## v1.2.8
 - Limit accuracy, combo and miss field values
 - Add missing charset meta tag
 - Add local changelog 
 - Remove JS minification for Firefox builds

## v1.2.7
 - Add Firefox support

## v1.2.6
 - Add proper error handling

## v1.2.5
 - Add missing version number from notification (whoops!)

## v1.2.4
 - Add check for conflicting mods and disable the counterpart automatically
 - Add version update notifications bar
 - Add version change detection

## v1.2.3
 - Fix bug where miss count would default to -1 resulting in erroneous PP calculations
 - Fix bug where on some beatmaps certain accuracies would cause the extension to crash

## v1.2.2
 - Add support for old beatmaps missing the game mode field, default to standard mode