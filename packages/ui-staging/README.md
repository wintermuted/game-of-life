# Context-free UI staging

Private preparation area for components intended for wintermuted-ui. Nothing in
this package is published or moved automatically.

```tsx
import '@wintermuted/ui-theme/index.css';
import '@game-of-life/ui-staging/style.css';
import { StatCard, NumberStepper } from '@game-of-life/ui-staging';
```

React/React DOM and the Wintermuted stylesheet/token contract are the only runtime
dependencies. Production modules do not import other Game of Life packages,
translation providers, routing, storage, or domain models. Styles load explicitly;
importing the React entry does not inject CSS. Consumers use public exports, not
source paths. Tests exercise unrelated data with no app providers or App.css.

## API and adapter ownership

| Export                     | Supplied contract                                                                                                                           | Local adapter responsibilities                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ToggleGroup<Value>`       | Options with typed values, labels, optional icons/swatches/disabled state; controlled value/change; orientation and appearance              | ColorPaletteSelector supplies palettes. Explore/Profile supply view choices. SegmentedControl preserves its existing API.                                                                                                               |
| `FacetFilter<Value>`       | Prepared options/counts/hidden/disabled flags, selected values/change, availability, reset action, translated copy                          | Explore computes counts/order, decides which zero-count selections remain removable, converts Sets, and synchronizes query state. Reset is separate from option values, so `all` is not reserved.                                       |
| `SortableTableHeader<Key>` | Column key, active state/direction, independent sort/direction callbacks and supplied icon/labels                                           | Returns a `th`, not content to nest inside another `th`. Explore retains its two distinct sort-direction defaults.                                                                                                                      |
| `StatCard`                 | Label, optional value, tone, optional child content                                                                                         | Diagnostics supplies game statistics and their formatting.                                                                                                                                                                              |
| `RankedBarList`            | Stable IDs, labels, values/value labels, optional colors, maximum scale, minimum visible width, empty/heading content                       | Diagnostics computes rankings and supplies independent scales, a 6% visible minimum, and tie-break annotations. Invalid numeric contracts throw.                                                                                        |
| `Toast`                    | Open state, message, action slot, tone, dismissal callback/label                                                                            | Existing notification hooks retain timeouts. Explore supplies its router link; Playground retains its unrelated tooltip. Hidden notices are inert.                                                                                      |
| `ColorPicker`              | Current color, labeled groups/choices, selection metadata callback, input-change callback, optional Enter-commit callback, labels/placement | useDrawColors retains palette mapping, custom slots and selected-slot policy. Optional paired `draftValue`/`onDraftChange` preserve drafts across conditional unmounts. `inputId` is optional; instances generate unique IDs otherwise. |
| `NumberStepper`            | Finite bounded value, positive step, callback, icons and accessible labels                                                                  | Playback supplies speed range 1-10 and edit-mode disabling. Fractional steps are supported; changes clamp at the boundaries.                                                                                                            |
| `LanguageSelector`         | Supplied language values/labels/disabled flags, controlled selection, native/drop-up variant                                                | LanguageSwitcher supplies en/es, regional-code normalization, and i18next updates. Popup navigation skips disabled choices and supports Escape/outside dismissal.                                                                       |

Callbacks deliver values, not application state setters or game hook objects.
Icons and rich labels are React nodes; there is no required icon library.
All user-facing copy belongs to consumers. The app owns a small `uiControls`
translation namespace for hex validation without expanding oversized locale files.

Color input accepts only six-digit hex. Valid blur updates the color without
firing the Enter-commit callback; invalid input remains visible and is described
as invalid rather than being silently replaced. Popup selection closes the picker.

## Styling

`src/styles/index.css` imports cohesive selection, filter, metric, control, and
addition styles. Component-owned rules were moved out of App.css and renamed
`wm-staged-*`; existing theme classes cover buttons, swatch toggle groups, badges,
and toast presentation. App.css retains page layout, including the vertical
playback arrangement and mobile view-toggle sizing.

Transferable additions are the outline toggle treatment, compact left-aligned
stat card, ranked comparisons, counted facet presentation, color-picker inputs
and placement, drop-up selector, stepper, and its tooltip presentation. Focus
indicators and screen-reader validation are included. These are scoped additions,
not overrides of unrelated theme primitives.

Detector findings for thick borders on tooltip pseudo-elements are intentional
arrow triangles, not card accents. Existing rules/settings tooltip triangles
were also retained to preserve the application's visual contract.

## Verification and eventual transfer

Run behavioral tests directly (Nx test targets otherwise build dependencies):

```powershell
npm run test --workspace @game-of-life/ui-staging
```

Boundary tests inspect static imports, re-exports, dynamic imports, manifest
dependencies, CSS imports, and app-specific identifiers. CI builds the workspace
and runs `test:package` to check built public exports, declarations, stylesheet
availability, and a neutral server-rendered consumer.

Before a later transfer, require passing behavioral/regression tests and CI,
independent rendering with the documented theme CSS, and desktop/mobile parity.
Do not treat import isolation alone as sufficient.

At the inspected destination revision (`e06231d`), React components used JavaScript
plus hand-authored declarations. These components deliberately use TSX under this
project's conventions; reassess destination format before the final move.
Consolidate staged classes/variants into
the canonical theme, match destination package exports/peers, and carry behavior
tests and adapters' usage examples. Do not restore duplicate ui-theme React entry
points. Transfer, publication, and upgrading this app to ui-react are separate
actions requiring a new request.
