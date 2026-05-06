# Apply Wintermuted Design System to Game of Life

## Overview
Replace MUI (Material UI) in the `@game-of-life/app` package with `@wintermuted/ui-theme`.
Where the design system lacks equivalents, create new CSS components first, document them in
the showcase, then consume them in the app. Full MUI removal — no hybrid.

## Phases

### Phase 1 — New Design System Components (`wintermuted-ui-theme`)
- [ ] `styles/components/toggle.css` — pill toggle switch via styled `<input type="checkbox">` + CSS `:checked`
- [ ] `styles/components/slider.css` — custom `<input type="range">` track + thumb
- [ ] `styles/components/toggle-group.css` — exclusive button group (semantic variant of tab-bar)
- [ ] `styles/components/toast.css` — fixed bottom-center notification; tonal variants (success/danger/warning/info)
- [ ] Register all 4 in `styles/components.css` barrel and `package.json` exports

### Phase 2 — Showcase Docs (`wintermuted-ui-theme`)
- [ ] `showcase/toggle.html`
- [ ] `showcase/slider.html`
- [ ] `showcase/toggle-group.html`
- [ ] `showcase/toast.html`
- [ ] Update `showcase/showcase.js` NAV_STRUCTURE
- [ ] Update `showcase/components.html` index cards

### Phase 3 — Wire Dependency
- [ ] Add `"@wintermuted/ui-theme": "file:../../../wintermuted-ui-theme"` to `packages/app/package.json`
- [ ] Remove `@mui/*` and `@emotion/*` from `packages/app/package.json`
- [ ] `npm install` at repo root
- [ ] Import `@wintermuted/ui-theme/index.css` in `src/index.tsx`

### Phase 4 — Migrate `App.tsx`
- [ ] Remove MUI AppBar/Toolbar; replace with `<header class="app-header">`
- [ ] Nav links via `<nav class="app-nav">` + react-router `NavLink`
- [ ] Theme toggle: `.btn.btn-ghost` + unicode ☀/🌙
- [ ] Remove `ThemeProvider`/`createTheme`/`CssBaseline`; set `data-theme` attr on `<html>`

### Phase 5 — Migrate `Home.tsx`
- [ ] `Container` → `.app-shell`; `Box` flex → `.sidebar-layout`
- [ ] `Paper` panels → `.card.card-body`
- [ ] `Snackbar/Alert` → React state + `.toast.toast-success`

### Phase 6 — Migrate `GridControls.tsx`
- [ ] `Button` → `.btn` variants; unicode icons
- [ ] `Slider` → `<input type="range" class="wm-slider">`
- [ ] `Dialog` → `.modal-overlay` + `.modal-panel` pattern

### Phase 7 — Migrate `PatternInput.tsx` + `PatternSelector.tsx`
- [ ] `Tabs/Tab` → `.tab-bar` + `.tab-btn`
- [ ] `List/ListItem` → styled `<ul>` list rows
- [ ] `Chip` → `.badge`

### Phase 8 — Migrate `CustomPatternInput.tsx`
- [ ] `TextField multiline` → native `<textarea>`
- [ ] `Alert` error → `.inline-panel.inline-panel-danger`
- [ ] `Collapse` → className display toggle

### Phase 9 — Migrate `RulesPanel.tsx`
- [ ] `Paper` → `.card`
- [ ] `Switch/FormControlLabel` → `.wm-toggle` (new component)

### Phase 10 — Migrate `ColorPaletteSelector.tsx`
- [ ] `ToggleButtonGroup/ToggleButton` → `.toggle-group` (new component)

### Phase 11 — Migrate `About.tsx` + `LanguageSwitcher.tsx`
- [ ] `Container/Paper` → `.app-shell.card`
- [ ] `List` → `<ul class="wm-list">`
- [ ] `Menu/MenuItem` → native `<select>`

### Phase 12 — Clean Up
- [ ] Delete `App.scss`, `GridControls.scss`, `_variables.scss`
- [ ] Remove all remaining MUI/Emotion imports
- [ ] `npm test` passes
- [ ] Visual check: light + dark theme, all controls

## Relevant Files

### wintermuted-ui-theme (new)
- `styles/components/toggle.css`
- `styles/components/slider.css`
- `styles/components/toggle-group.css`
- `styles/components/toast.css`
- `styles/components.css` (update)
- `package.json` (update exports)
- `showcase/toggle.html`
- `showcase/slider.html`
- `showcase/toggle-group.html`
- `showcase/toast.html`
- `showcase/showcase.js` (update NAV_STRUCTURE)
- `showcase/components.html` (update index cards)

### game-of-life (modify)
- `packages/app/package.json`
- `packages/app/src/index.tsx`
- `packages/app/src/app/ThemeContext.tsx`
- `packages/app/src/app/App.tsx`
- `packages/app/src/app/components/Home.tsx`
- `packages/app/src/app/components/GridControls.tsx`
- `packages/app/src/app/components/PatternInput.tsx`
- `packages/app/src/app/components/PatternSelector.tsx`
- `packages/app/src/app/components/CustomPatternInput.tsx`
- `packages/app/src/app/components/RulesPanel.tsx`
- `packages/app/src/app/components/ColorPaletteSelector.tsx`
- `packages/app/src/app/components/About.tsx`
- `packages/app/src/app/components/LanguageSwitcher.tsx`

### game-of-life (delete)
- `packages/app/src/app/styles/App.scss`
- `packages/app/src/app/styles/GridControls.scss`
- `packages/app/src/app/styles/_variables.scss`

## Verification
1. `npm test` passes in `game-of-life/`
2. App runs at `http://localhost:3000/game-of-life/` without errors
3. Light + dark theme toggle flips `data-theme` on `<html>`
4. All 4 new showcase pages render correctly
5. No MUI imports remain in `packages/app/src/`

## Decisions
- Full MUI removal: eliminates style conflicts and ~400KB bundle weight
- Native HTML only: Slider = `<input type="range">`, Switch = styled `<input type="checkbox">`,
  Language = `<select>` — zero new JS dependencies
- Unicode icons for this pass (▶ ⏸ ↺ ⏭)
- `file:` dependency for local development
- Dark-first: game-of-life was already dark; DS dark theme is a clean match
- `Grid.scss` untouched — canvas component has no MUI usage
