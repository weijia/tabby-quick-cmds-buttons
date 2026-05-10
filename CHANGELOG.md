# Changelog

## [Unreleased]

### Added
- Tooltip on command buttons — shows `description` (if set) or the command `text` on hover
- `.npmrc` with `legacy-peer-deps=true` (required because `tabby-core` declares stale Angular peer deps)

### Fixed
- Buttons panel scroll/overflow: removed `height:0px` on the floating container, added `max-height:70vh` with `overflow-y:auto` so the panel scrolls instead of forcing the user to drag the entire panel to reach off-screen buttons
- Button containers now use `display:flex; flex-wrap:wrap` so buttons wrap within the available width instead of extending in a single line
- **Security:** Added viewport boundary clamping on drag — panel cannot be dragged off-screen anymore
- **Security:** Tab headers now wrap and scroll instead of stretching to full height (prevents accordion effect)

### Changed
- Bumped Angular dependencies from `^12.0.0` to `^15.2.6` to match Tabby v1.0.230
- Bumped `@ng-bootstrap/ng-bootstrap` from `^2.2.0` to `^14.1.0`
- Replaced `node-sass` (deprecated) with `sass` (Dart Sass) `^1.97.3`
- Bumped `ts-loader` from `^5.2.1` to `^9.5.4`
- Bumped `typescript` from `~4.2.3` to `^4.9.5`
- Bumped `css-loader` from `^5.1.1` to `^6.11.0`
- Bumped `pug` from `^2.0.3` to `^3.0.3`

## [1.1.0]
- Tab grouping support with vue3-tabs-component
- PrimeVue theme integration
- System theme toggle in settings
- Draggable floating button panel
- Context menu integration

## [1.0.0]
- Initial release — toolbar buttons for quick commands
