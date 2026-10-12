# Spec: Green Home Grant eligibility checker

Status: Draft v2 · 2026-10-12 (v2: GOV.UK Frontend required; answers expire after 10 minutes and are deleted at the result page)
Inputs: `intent.md` (business intent), `docs/eligibility-rules.md` (rules source of truth), `CLAUDE.md` (UI constraints), existing scaffold in `src/`.

Precedence when sources conflict: `intent.md` > `docs/eligibility-rules.md` > scaffold TODO comments. Every conflict found is listed in §2.4.

---

## 1. Executive summary

### 1.1 Problem
Citizens don't know whether they can get a Green Home Grant for **insulation** or a **heat pump**, or how much of the cost would be covered. The prototype gives each person a self-service check, so they know before they apply.

### 1.2 Target audience
Members of the public checking their own eligibility, on desktop or mobile, including people using assistive technology. There are no staff or caseworker users.

### 1.3 What the service produces
For each grant type (insulation, heat pump) it gives:
- an outcome: eligible or not eligible;
- if eligible, a support level (percentage of costs) set by household income band;
- for insulation, the parts of the property the grant would cover;
- if not eligible, the reason.

The outcome is **indicative**. This is a check, not an application or a decision.

### 1.4 Out of scope (hard boundaries)
| Item | Note |
|---|---|
| Backend, API, database, network calls of any kind | May come later. The design must not block it (§3.5). |
| Submitting an application | The check ends at the result page. |
| Caseworker or admin views | – |
| Different treatment for flats | Flats follow the same rules as all other property types. |
| Fixed £ grant amounts | Only percentages are shown. |
| Authentication, accounts, save-and-return across sessions | – |
| Analytics, cookies, cookie banner | No cookies are set. sessionStorage is not a cookie. |
| Welsh language and other translations | – |
| Any feature not in this spec | Per `CLAUDE.md`: "Do not add features we did not ask for". |

---

## 2. Tech stack and constraints

### 2.1 Stack
| Concern | Choice |
|---|---|
| Language | JavaScript (ES modules, JSX). No TypeScript. |
| UI | React 18 (`react`, `react-dom`) |
| Routing | `react-router-dom` v7, `BrowserRouter` in `src/main.jsx` |
| Build/dev | Vite 8. Port 5002 and lab hosting config in `vite.config.js` must be kept unchanged. |
| Unit tests | Vitest 5 |
| Component tests | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` (already declared) |
| Persistence | Browser `window.sessionStorage` only, with a 10-minute expiry (§3.4) |
| Design system | **GOV.UK Frontend** (`govuk-frontend`, pinned to an exact version, currently `6.5.1`). This is the only new runtime dependency. |
| Styling | GOV.UK Frontend's precompiled CSS, `govuk-frontend/dist/govuk/govuk-frontend.min.css`, imported once in `src/main.jsx` |

No other new runtime dependencies: no third-party React wrapper for GOV.UK (such as `govuk-react`), CSS framework, Sass or state library.

**How GOV.UK Frontend is used in React.** GOV.UK Frontend ships CSS, JavaScript and Nunjucks templates, but no React components. So we:
1. use its CSS for all styling;
2. write each component in JSX as a copy of the HTML shown in that component's "HTML" tab on the Design System website, for the pinned version (with `class` → `className`, `for` → `htmlFor`, and so on);
3. **don't** call its JavaScript (`initAll` / `createAll`). Its scripts change the page directly, behind React's back. For example, ticking "No" on prior grants would untick the other boxes on screen, but React would still think they were ticked and would save the wrong answer. The few behaviours we need (exclusive checkboxes, focusing the error summary) are written in React instead (§4.1).

Because the GOV.UK Frontend JavaScript isn't run, `<body>` doesn't get the `govuk-frontend-supported` class. No component in this spec needs it.

### 2.2 Setup gaps to close
1. Run `npm install`. The test devDependencies are declared but not installed (`node_modules/.bin` has no `vitest`).
2. `npm install --save-exact govuk-frontend@6.5.1`.
3. **Fonts and images.** The precompiled CSS loads fonts and images from `/assets/fonts/…` and `/assets/images/…`. Copy `node_modules/govuk-frontend/dist/govuk/assets` to `public/assets`, so Vite serves them at those paths. Do this with a `postinstall` npm script (for example, `cp -R node_modules/govuk-frontend/dist/govuk/assets public/`) and add `public/assets` to `.gitignore`.
4. `index.html`: add `class="govuk-template"` to `<html>` and `class="govuk-template__body"` to `<body>`, as in the GOV.UK Frontend page template. Add the favicon and theme-colour `<link>`/`<meta>` tags from that template, pointing at `/assets/images/…`.
5. `src/main.jsx`: import `govuk-frontend/dist/govuk/govuk-frontend.min.css` in place of `./App.css` (see §2.4 for `App.css`).
6. Add a `test` block to `vite.config.js` with `environment: 'jsdom'` and a setup file that imports `@testing-library/jest-dom/vitest`. Leave the `server` block untouched.
7. The `test` / `test:watch` npm scripts already exist. Keep them.

### 2.3 UI constraints (from `intent.md`, `CLAUDE.md` and the GOV.UK Design System)
- Use only classes defined by GOV.UK Frontend. Don't add custom classes, custom colours or styles that copy or override GOV.UK Frontend.
- Every component's markup matches the Design System's HTML for the pinned version (§2.1). The required components are in the table below.
- If something can't be built from GOV.UK Frontend components, it goes in Open questions (§7). It isn't built as a custom component.
- **One question per page**, each with a **Back link** and a **Continue** button.
- Check answers uses `<dl class="govuk-summary-list">`.
- The error summary has `role="alert"`, the heading "There is a problem", and links to each field in error.
- Every input has a `<label>`. Each radio or checkbox group is wrapped in `<fieldset class="govuk-fieldset">` with a `<legend>` that holds the question as the page `<h1>`.
- Follow government accessibility guidance (WCAG 2.2 AA):
  - each route sets a unique `document.title` in the format `<Page> - Check if you can get a Green Home Grant - GOV.UK`, prefixed `Error: ` while validation errors are shown;
  - there is only one `<main>` element;
  - all interaction works by keyboard;
  - focus is visible;
  - a skip link (`<a href="#main-content" class="govuk-skip-link">Skip to main content</a>`) is the first thing in `<body>`'s content, and `<main>` has `id="main-content"`;
  - the timeout warning meets WCAG 2.2.1 "Timing adjustable" (§4.8).

**GOV.UK Frontend components used.** Each one is built from the markup on its Design System page.

| Component | Where it's used |
|---|---|
| Skip link | Every page |
| Header | Every page (`GovukHeader`) |
| Service navigation (service name only) | Every page (`ServiceNavigation`), directly below the header |
| Phase banner, Tag | Every page (`PhaseBanner`) |
| Footer | Every page (`GovukFooter`) |
| Back link | Every question page and check answers |
| Button (including the start button variant) | Start page, every question page, check answers, timeout warning, session expired page |
| Radios (including the "or" divider) | Property type, ownership, consent, income, heating |
| Checkboxes (including the "or" divider) | Prior grants, insulation |
| Fieldset, Hint, Error message, Error summary | Every question page |
| Summary list | Check answers |
| Panel | Result page, eligible outcome only |
| Notification banner | Timeout warning (§4.8) |

Typography and layout use GOV.UK Frontend's `govuk-heading-*`, `govuk-body`, `govuk-list`, `govuk-link`, `govuk-visually-hidden`, `govuk-width-container`, `govuk-main-wrapper` and `govuk-grid-*` classes.

### 2.4 Scaffold conflicts and how they are resolved
| Scaffold | Conflict | Resolution |
|---|---|---|
| `PropertyTypePage` options ("Detached house", "Flat/apartment"…) | Labels differ from the rules | Use the values in §3.1. Labels may keep "house" wording (see Open question Q6). |
| `OwnershipPage` options (Own with/without mortgage, three rental types) | Different set from the rules | Use the rules: Own outright, Mortgage, Shared ownership, Rent. |
| `IncomePage` options (Under 31,000 / 31,000–50,000 / Over 50,000) | Different bands | Use the rules' four bands. |
| `InsulationPage` radios ("Yes – both wall and loft"…, "I do not know") | Intent asks which parts are *not* insulated | Checkboxes: Loft or roof, Walls, Floor, or All parts are insulated, or I'm not sure (§4.2). |
| `App.jsx` state `insulation: ''` | Must hold several values, and the meaning has flipped | Rename it to `uninsulatedParts` and make it an array (§3.1). The route and page file names stay as `/insulation` and `InsulationPage`. |
| Back links use `<a href>` | Each click reloads the whole page | Use the router `<Link>`. Back targets depend on earlier answers (§4.3). |
| `PropertyTypePage` Back goes to `/` | Prior grants is now the first question | Back goes to `/prior-grants`. |
| `AccessibilityStatementPage` renders its own `<main>` | Two `<main>` elements on the page | Replace the outer `<main>` with a fragment. |
| `StartPage` navigates to `/property-type` | Prior grants is now first | Navigate to `/prior-grants`. |
| `src/App.css` hand-writes `govuk-*` classes and `--govuk-*` variables | GOV.UK Frontend must provide all styles | Delete `App.css` and its import in `main.jsx`. GOV.UK Frontend's CSS replaces it. |
| `CLAUDE.md` used to say "Use the govuk-* classes defined in src/App.css" | Conflicted with `intent.md` ("Design system") | Resolved: `CLAUDE.md` now says GOV.UK Frontend (Q13). |
| `GovukHeader` is a bare text link | Not the GOV.UK Frontend header (no crown logo, no service name) | Rebuild it from the Design System header markup (GOV.UK logo linking to `https://www.gov.uk/`). In GOV.UK Frontend v6 the header doesn't hold the service name, so add a ★ `ServiceNavigation` component (Service navigation markup, service name only, no navigation links, so no JavaScript is needed) with "Check if you can get a Green Home Grant" linking to `/`. |
| `GovukFooter` has only the meta list | Not the full GOV.UK Frontend footer (no licence or crown copyright) | Rebuild it from the Design System footer markup. Keep the accessibility statement link in the meta list, using the router `<Link>`. |
| `GovukButton` | Missing the start button's arrow icon and `data-module`/`data-prevent-double-click` attributes | Match the Design System button markup, including the start variant's arrow SVG. Leave out `data-module`, since the GOV.UK Frontend JavaScript isn't run (§2.1). |
| `PhaseBanner` | Close to the Design System markup | Check it against the Design System phase banner and fix any differences. |
| `intent.md` earlier draft: grey "not eligible" panel (`govuk-panel--not-eligible`) | GOV.UK Frontend has no grey panel. The Design System says to use the panel only for a successful outcome. | The not-eligible outcome is a `govuk-heading-l` `<h1>`, with no panel (§4.6). |

---

## 3. Data architecture

There is no server-side data. Everything lives in one client-side `answers` object held in React state in `App.jsx` and mirrored to sessionStorage. Answers last **10 minutes from the last progression** (§3.4, §4.8) and are **deleted when the result page is reached** (§4.7).

### 3.1 `Answers` model
Values are stable machine strings. Display labels live only in the UI layer (§3.3).

| Field | Type | Allowed values | Required when |
|---|---|---|---|
| `priorGrants` | `string[]` | `'insulation'`, `'heatPump'`, `'none'` | Always (first question) |
| `propertyType` | `string` | `'detached'`, `'semiDetached'`, `'terraced'`, `'flat'`, `'bungalow'` | `priorGrants` does not contain both grant types |
| `ownership` | `string` | `'ownOutright'`, `'mortgage'`, `'sharedOwnership'`, `'rent'` | as above |
| `consent` | `string` | `'yes'`, `'no'` | as above, **and** `ownership ∈ {sharedOwnership, rent}` |
| `incomeBand` | `string` | `'under12570'`, `'12571to50270'`, `'50271to125140'`, `'over125141'` | as for `propertyType` |
| `uninsulatedParts` | `string[]` | `'loft'`, `'walls'`, `'floor'`, `'allInsulated'`, `'notSure'` | as for `propertyType`, **and** `priorGrants` doesn't contain `'insulation'` |
| `heating` | `string` | `'gasBoiler'`, `'oilBoiler'`, `'electric'`, `'heatPump'`, `'other'` | as for `propertyType`, **and** `priorGrants` doesn't contain `'heatPump'` |

Initial state: every `string` field is `''` and every `string[]` field is `[]`.

**Validation rules (structural, enforced by the model):**
- V1. A `string` field is either `''` (unanswered) or one of its allowed values.
- V2. A `string[]` field contains only allowed values and has no duplicates.
- V3. Exclusive options: if `priorGrants` contains `'none'`, it contains nothing else. If `uninsulatedParts` contains `'allInsulated'` or `'notSure'`, it contains nothing else.
- V4. `consent` must be `''` when `ownership ∉ {sharedOwnership, rent}`. Changing ownership to a type that doesn't need consent clears `consent`.
- V5. A field is "answered" when it is a non-empty string or a non-empty array.
- V6. `uninsulatedParts` must be `[]` when `priorGrants` contains `'insulation'`, and `heating` must be `''` when `priorGrants` contains `'heatPump'`. Changing `priorGrants` to include a grant type clears the matching answer. (Skipped questions, Q1.)

### 3.2 `EligibilityResult` model (output of the rules engine)
```
EligibilityResult {
  overallEligible: boolean            // true if either grant is eligible
  supportPercentage: 100|75|50|25|null // null when incomeBand not answered (early exit)
  insulation: GrantOutcome
  heatPump:   GrantOutcome
}
GrantOutcome {
  eligible: boolean
  reason: ReasonCode | null           // null iff eligible
  coveredParts?: string[]             // insulation only; present iff eligible and not needsAssessment;
                                      // non-empty subset of ['loft','walls','floor']
  needsAssessment?: boolean           // insulation only; true iff eligible because user answered 'notSure'
}
ReasonCode =
  'ALREADY_RECEIVED'      // prior grant of this type
  | 'NO_CONSENT'          // shared ownership / rent with consent = 'no'
  | 'ALREADY_INSULATED'   // insulation only: user answered 'allInsulated'
  | 'ALREADY_HAS_HEAT_PUMP' // heat pump only: heating = 'heatPump'
```
If more than one reason applies, the first in this order wins: `ALREADY_RECEIVED`, `NO_CONSENT`, `ALREADY_INSULATED` / `ALREADY_HAS_HEAT_PUMP`.

### 3.3 Display label maps
`src/content/labels.js` maps each machine value to its display label. The question pages, check answers and the result page all use it, so a label is defined once.

| Income value | Label | Support % |
|---|---|---|
| `under12570` | Under £12,570 | 100 |
| `12571to50270` | £12,571 to £50,270 | 75 |
| `50271to125140` | £50,271 to £125,140 | 50 |
| `over125141` | £125,141 or more | 25 |

### 3.4 Persistence schema (sessionStorage)
| Item | Value |
|---|---|
| Key | `ghg-checker` |
| Value | `JSON.stringify({ version: 2, savedAt: number, answers: Answers })`. `savedAt` is `Date.now()` at the last **progression**. |
| Progression | A valid Continue on any question page (normal or change mode), or pressing "Keep my answers" on the timeout warning (§4.8). Back links, browser navigation, viewing a page and pressing Start don't count. |
| Written | on every progression, with a fresh `savedAt` |
| Read | once, when `App` first mounts, to seed the initial state |
| Expiry | `ANSWERS_TTL_MS = 10 * 60 * 1000`. Answers have expired when `now - savedAt >= ANSWERS_TTL_MS`. |
| Cleared | (a) when the result page is reached (§4.7); (b) when the answers expire (§4.8); (c) when the stored value fails validation on read. Clearing removes the key **and** resets in-memory `answers` to `emptyAnswers`. |
| Validation on read | The parsed object must have `version === 2`, `savedAt` must be a finite number that isn't in the future, the answers must not have expired, and every field must pass V1–V6. Any failure means the stored value is removed and the app starts from the initial state (§5.3). An expired value found on read also sends the user to `/session-expired` if they were part-way through (§4.8). |

The key no longer has a version suffix. Old `ghg-checker:v1` values are ignored and never read.

### 3.5 Future backend seam
All storage access goes through one module (`answersStore`) with the interface `load(now): { answers, savedAt, expired }`, `save(answers, now): void` and `clear(): void`. A later backend replaces only this module. Pages never touch `sessionStorage` directly. `now` is passed in (not read inside the module), so tests can control time.

---

## 4. Component design

### 4.1 Module breakdown
| Module (new = ★) | Responsibility | Pure? |
|---|---|---|
| ★ `src/eligibility/assessEligibility.js` | `assessEligibility(answers) → EligibilityResult`. Applies §4.4. No React, DOM or storage. | Yes |
| ★ `src/flow/journey.js` | Route order, `nextRoute(current, answers)`, `backRoute(current, answers)`, `firstIncompleteRoute(answers)`, `isJourneyComplete(answers)`. Applies §4.3. | Yes |
| ★ `src/state/answersStore.js` | `load(now)` / `save(answers, now)` / `clear()` against sessionStorage, schema and expiry checks (§3.4), and fallback when storage is unavailable. | No (I/O) |
| ★ `src/state/expiry.js` | `ANSWERS_TTL_MS`, `WARNING_AFTER_MS` (8 minutes), `isExpired(savedAt, now)`, `isWarningDue(savedAt, now)`. | Yes |
| ★ `src/state/answers.js` | `emptyAnswers`, `setAnswer(answers, field, value) → answers` (applies V3, V4 and V6, including clearing dependent fields), and per-field validators. | Yes |
| ★ `src/content/labels.js` | Value-to-label maps (§3.3). The income-to-percentage map lives in `assessEligibility`, not here. | Yes |
| ★ `src/components/ErrorSummary.jsx` | GOV.UK Frontend error summary markup. Props: `errors: {fieldId, message}[]`. Renders nothing when the list is empty. Otherwise renders `role="alert"`, the heading "There is a problem", and anchor links to `#fieldId`. Moves focus to itself when first shown (done in React, since the GOV.UK Frontend JavaScript isn't run). | – |
| ★ `src/components/RadioGroup.jsx` | GOV.UK Frontend radios markup: `govuk-form-group`, `fieldset`, a `legend` holding the `h1`, an optional hint, an error message and radios. Props: `name`, `legend`, `options`, `value`, `onChange`, `error`, optional `dividerBefore` (for the "or" divider). The first input's id is `name`, so the error summary can link to it. | – |
| ★ `src/components/CheckboxGroup.jsx` | Same as `RadioGroup` but with GOV.UK Frontend checkboxes markup. Supports `exclusive` options (V3): ticking one unticks all others, and ticking any other option unticks the exclusive ones. This is done in React state, not with GOV.UK Frontend's `data-behaviour="exclusive"` script (§2.1). | – |
| ★ `src/components/BackLink.jsx` | GOV.UK Frontend back link markup, rendered as a router `<Link>`. Prop: `to`. | – |
| ★ `src/components/TimeoutWarning.jsx` | GOV.UK Frontend notification banner (§4.8). Props: `onKeep`. | – |
| `src/components/GovukButton.jsx` | Update to match the Design System markup (§2.4). | – |
| `GovukHeader`, `PhaseBanner`, `GovukFooter` | Update to match the Design System markup (§2.4). Mount them in `App.jsx`: the skip link first, then the header, then `ServiceNavigation`, then the banner with `phase="alpha"`, then the width container, with the footer after it. | – |
| ★ `src/pages/SessionExpiredPage.jsx` | Shown after answers expire (§4.8). | – |
| ★ `src/pages/PriorGrantsPage.jsx` | Question page | – |
| ★ `src/pages/ConsentPage.jsx` | Question page. The wording depends on `ownership`. | – |
| Existing question pages ×5 | Fill in the TODOs to match §4.2. | – |
| `CheckAnswersPage.jsx` | Summary list with Change links (§4.5). | – |
| `ResultPage.jsx` | Renders the in-memory `outcome` snapshot (§4.6, §4.7), not `answers`. | – |
| `StartPage.jsx` | Service description and Start button to `/prior-grants`. | – |
| `AccessibilityStatementPage.jsx` | Fill in the TODO sections and remove the nested `<main>`. | – |
| `App.jsx` | Owns `answers` and `savedAt` state, seeded from `answersStore.load(Date.now())`, and the in-memory `outcome` snapshot. Passes `answers`, `onAnswer(field, value)` and `onFinish(finalAnswers)` to pages. Saves on every progression. Runs the expiry timers and shows `TimeoutWarning` (§4.8). Registers the routes. | – |

### 4.2 Pages and validation
Each question page does the following:
1. Initialises its local field value from `answers` (so Back, Change and refresh pre-fill the answer).
2. When Continue is pressed, first checks whether the answers have expired (§4.8). If they have, it goes to `/session-expired` and saves nothing. Otherwise it validates the field. If it's invalid, it shows errors (§5.1), sets the `Error:` title prefix and stays on the page. If it's valid, it calls `onAnswer` (which counts as a progression) and navigates to `nextRoute`. If `nextRoute` is `/result` (the early exit), it calls `onFinish(finalAnswers)` instead, where `finalAnswers` includes the answer just given (§4.7).
3. Never writes to `answers` until Continue succeeds.

| Route | Page | Control | Question (h1/legend) | Error message if empty |
|---|---|---|---|---|
| `/` | Start | – | Check if you can get a Green Home Grant | – |
| `/prior-grants` | PriorGrants | checkbox; `none` is exclusive, labelled "No, I have not received a Green Home Grant", after an "or" divider | Have you received a Green Home Grant before? (hint: Select all that apply) | Select if you have received a Green Home Grant before |
| `/property-type` | PropertyType | radio | What type of property do you live in? | Select the type of property you live in |
| `/ownership` | Ownership | radio | Do you own or rent your property? | Select if you own or rent your property |
| `/consent` | Consent | radio Yes/No | sharedOwnership: "Do all owners of the property agree to the work?" · rent: "Do you have your landlord's permission for the work?" | Select yes if all owners agree to the work / Select yes if you have your landlord's permission |
| `/income` | Income | radio | What is your annual household income? | Select your annual household income |
| `/insulation` | Insulation | checkbox: Loft or roof, Walls, Floor; then an "or" divider; then the exclusive options "All parts are insulated" and "I'm not sure" | Which parts of your property are not insulated? (hint: Select all that apply) | Select which parts of your property are not insulated, or select 'All parts are insulated' or 'I'm not sure' |
| `/heating` | Heating | radio | What is your main heating system? | Select your main heating system |
| `/check-answers` | CheckAnswers | – | Check your answers | – |
| `/result` | Result | – | (outcome heading, §4.6) | – |
| `/session-expired` | SessionExpired | – | Your answers have been deleted | – |
| `/accessibility-statement` | A11y statement | – | Accessibility statement | – |

### 4.3 Journey state machine
Normal forward order:

```
/ → /prior-grants
/prior-grants ──(priorGrants ⊇ {insulation, heatPump})──▶ /result        [early exit]
/prior-grants ──(otherwise)──▶ /property-type → /ownership
/ownership ──(sharedOwnership | rent)──▶ /consent → /income
/ownership ──(ownOutright | mortgage)──▶ /income
/income ──(insulation not received)──▶ /insulation
/income ──(insulation received)──▶ /heating                       [skip insulation]
/insulation ──(heat pump not received)──▶ /heating
/insulation ──(heat pump received)──▶ /check-answers              [skip heating]
/heating → /check-answers → /result
```

At most one of `/insulation` and `/heating` is skipped, because receiving both grants is the early exit.

Back links are always `backRoute(current, answers)`:

| Current | Back to |
|---|---|
| `/prior-grants` | `/` |
| `/property-type` | `/prior-grants` |
| `/ownership` | `/property-type` |
| `/consent` | `/ownership` |
| `/income` | `/consent` if consent is required, else `/ownership` |
| `/insulation` | `/income` |
| `/heating` | `/insulation`, or `/income` if insulation was skipped |
| `/check-answers` | `/heating`, or `/insulation` if heating was skipped |
| `/result` | No Back link. The answers have been deleted (§4.7), so there's nothing to go back to. |
| `/session-expired` | No Back link |

**Change mode.** A Change link goes to `<route>?change=true`. When Continue is pressed in change mode:
- If the change triggers the early exit (both prior grants), call `onFinish` and go to `/result`.
- If the change makes a previously unrequired question required and it's empty, go to that question with `?change=true`. This happens when ownership changes to `sharedOwnership`/`rent` (→ `/consent`), or when a grant type is removed from prior grants (→ `/insulation` or `/heating`). If more than one is now required, go to the first in journey order. After it, continue to the next newly required empty question, then `/check-answers`.
- If prior grants is changed *away* from both, and later answers are missing, go to `firstIncompleteRoute(answers)`. The journey then continues in normal mode.
- Otherwise go to `/check-answers`.

In change mode, Back goes to `/check-answers`.

**Route guards** (deep links, bookmarks, a refresh after storage loss or expiry). Every question route after `/prior-grants`, plus `/check-answers`, checks that all earlier required questions are answered. If any are missing, it redirects (replace, not push) to `firstIncompleteRoute(answers)`.
- `/result` is allowed only when an in-memory `outcome` snapshot exists (§4.7). Otherwise it redirects to `firstIncompleteRoute(answers)`, which is `/prior-grants` because the answers have been deleted.
- `/check-answers` is not allowed on the early-exit path. It calls `onFinish` and redirects to `/result`.
- `/session-expired` is always allowed.
- `/consent` when consent is not required redirects to `nextRoute('/ownership')`.
- `/insulation` or `/heating`, when skipped (Q1), redirects to `nextRoute` of the page before it.
- Unknown routes get a GOV.UK "Page not found" page with a link to `/`. This and `/session-expired` (§4.8) are the only new routes beyond the question flow.

### 4.4 Eligibility algorithm (`assessEligibility`)
These steps are evaluated in order. "Received" means `priorGrants` contains that grant type.

```
pct = PERCENT[incomeBand] ?? null              // 100/75/50/25

insulation:
  if received('insulation')                      → ineligible, ALREADY_RECEIVED
  elif consentRequired && consent == 'no'        → ineligible, NO_CONSENT
  elif uninsulatedParts == ['allInsulated']      → ineligible, ALREADY_INSULATED
  elif uninsulatedParts == ['notSure']           → eligible, needsAssessment = true
  else                                           → eligible, coveredParts = uninsulatedParts (in PARTS order)

heatPump:
  if received('heatPump')                        → ineligible, ALREADY_RECEIVED
  elif consentRequired && consent == 'no'        → ineligible, NO_CONSENT
  elif heating == 'heatPump'                     → ineligible, ALREADY_HAS_HEAT_PUMP
  else                                           → eligible

overallEligible = insulation.eligible || heatPump.eligible
supportPercentage = overallEligible ? pct : null
```
where `PARTS = ['loft','walls','floor']` and `consentRequired = ownership ∈ {sharedOwnership, rent}`.

Invariants:
- `propertyType` never affects the output.
- `incomeBand` never affects `eligible` or `reason`, only `supportPercentage`.
- `heating` never affects insulation, and `uninsulatedParts` never affects heat pump.
- The function is total. For any input that passes V1–V6 (including the early-exit partial input), it returns a well-formed result and never throws.

### 4.5 Check your answers
- `<dl class="govuk-summary-list">`, with one `govuk-summary-list__row` per **required** answered field, in journey order.
  - The Consent row appears only when consent is required.
  - Multi-value answers are shown one per line using the labels from §3.3.
- Each row has a "Change" link (`govuk-link`) to `<route>?change=true`, with visually hidden context text, for example `Change <span class="govuk-visually-hidden">property type</span>`.
- The "Accept and continue" button (`GovukButton`) first checks expiry (§4.8), then calls `onFinish(answers)` and navigates to `/result`.

### 4.6 Result page
Renders from the in-memory `outcome` snapshot (§4.7). It has no Back link.
1. Outcome heading:
   - if `overallEligible`: a GOV.UK Frontend `govuk-panel govuk-panel--confirmation` with the title (`<h1>`) "You may be eligible for a Green Home Grant" and the body "We could cover {supportPercentage}% of the cost";
   - otherwise: no panel. An `<h1 class="govuk-heading-l">` "You are not eligible for a Green Home Grant". (GOV.UK Frontend has no grey panel, and the Design System says to use the panel only for successful outcomes.)
2. An `h2` "Insulation grant" section, showing one of:
   - eligible with `needsAssessment`: "You may be eligible. An assessor will check which parts of your property need insulating.";
   - eligible, with a `govuk-list` of the covered parts;
   - not eligible, with a reason sentence mapped from the `ReasonCode`.
3. An `h2` "Heat pump grant" section, showing eligible or the reason.
4. An `h2` "What happens next" section (copy to be confirmed, Q3). It must state that this is a check and not an application, and that we've deleted the answers they gave.

| ReasonCode | Sentence |
|---|---|
| `ALREADY_RECEIVED` | You have already received this grant. You can only get one grant of each type. |
| `NO_CONSENT` (shared) | All owners of the property must agree to the work before you can apply. |
| `NO_CONSENT` (rent) | You need your landlord's permission before you can apply. |
| `ALREADY_INSULATED` | You told us all parts of your property are insulated. |
| `ALREADY_HAS_HEAT_PUMP` | Your property already has a heat pump. |

### 4.7 Persistence flow
```
App mount ─▶ answersStore.load(now) ─▶ valid & not expired? use it (answers, savedAt)
                                     : expired?  clear() ─▶ emptyAnswers ─▶ /session-expired (§4.8)
                                     : otherwise clear() ─▶ emptyAnswers
onAnswer(field, value) ─▶ setAnswer() (applies V3/V4/V6) ─▶ setState ─▶ savedAt = now ─▶ answersStore.save(answers, now)
onFinish(finalAnswers) ─▶ outcome = { answers: finalAnswers, result: assessEligibility(finalAnswers) }   (memory only)
                       ─▶ answersStore.clear() ─▶ answers = emptyAnswers, savedAt = null ─▶ navigate('/result')
leaving /result        ─▶ outcome = null
```

**Deleting answers at the result page.** The result page needs the answers to show its outcome, but the answers must be deleted when it's reached. So `onFinish` takes a snapshot first:
- `outcome` holds the final answers and the `EligibilityResult`. It's kept in React state only. It's never written to sessionStorage.
- `ResultPage` reads only `outcome`. `outcome.answers.ownership` picks the `NO_CONSENT` wording (§4.6).
- `outcome` is set back to `null` when the user leaves `/result`. A refresh on `/result` also loses it, so the guard redirects to `/prior-grants`.

### 4.8 Expiry and timeout warning
The timer only runs while there are answers (`savedAt !== null`). It isn't running on the start page before the first answer, on `/result`, or on `/session-expired`.

| Time since `savedAt` | What happens |
|---|---|
| 0 to under 8 minutes | Nothing. |
| 8 minutes (`WARNING_AFTER_MS`) | `TimeoutWarning` appears at the top of `<main>`, above any error summary, on whatever page the user is on. |
| 10 minutes (`ANSWERS_TTL_MS`) | `answersStore.clear()`, `answers = emptyAnswers`, `savedAt = null`, and navigate (replace) to `/session-expired`. |

**`TimeoutWarning`** is a GOV.UK Frontend notification banner (the default, not the success variant):
- It has `role="alert"`, so screen readers announce it when it appears. It doesn't move focus, so it doesn't interrupt someone part-way through typing or choosing.
- Title: "Important". Heading: "We will delete your answers in 2 minutes". Body: "You have not done anything for 8 minutes. We delete answers after 10 minutes to protect your information."
- It contains a `GovukButton` "Keep my answers". Pressing it counts as a progression: `savedAt = now`, `answersStore.save(answers, now)`, and the banner disappears.
- The text is fixed and doesn't count down second by second, because a live countdown would be read out over and over by screen readers.

**`/session-expired` page:**
- `<h1>` "Your answers have been deleted".
- Body: "You did not do anything for 10 minutes, so we deleted your answers to protect your information."
- A `GovukButton` "Start again" that navigates to `/`.
- `document.title`: `Your answers have been deleted - Check if you can get a Green Home Grant - GOV.UK`.

**Timer mechanics:**
- `App` sets two `setTimeout`s from `savedAt` (warning and expiry). It resets them whenever `savedAt` changes and clears them on unmount.
- Browsers slow down timers in background tabs, so a timer alone can fire late. `isExpired(savedAt, Date.now())` is also checked on every route change, on the `visibilitychange` event when the tab becomes visible, and before every Continue, Accept and continue and "Keep my answers". If it's true, expiry happens straight away. Answers are **never** saved after they've expired, even if a timer hasn't fired yet.

---

## 5. Edge cases and error handling

### 5.1 Validation failures (user input)
| Case | Behaviour |
|---|---|
| Continue with nothing selected | Error summary at the top of `<main>`, focused; `govuk-form-group--error` on the group; `govuk-error-message` above the inputs, with "Error:" visually hidden before it; title prefixed `Error: `; previous stored answer unchanged. |
| Error summary link clicked | Focus moves to the first input of that group (the anchor `#<name>`). |
| Exclusive checkbox ticked together with another option | Can't happen through the UI because of the `CheckboxGroup` behaviour. If it occurs anyway (for example, tampered storage), the stored state is invalid under V3 and is discarded (§5.3). |
| Error fixed, then Continue | Errors cleared, and the page moves on as normal. |

### 5.2 Navigation edge cases
| Case | Behaviour |
|---|---|
| Deep link or bookmark to a later page with earlier answers missing | Redirect (replace) to `firstIncompleteRoute` (§4.3). |
| Deep link to `/result` before the journey is complete | Redirect to `firstIncompleteRoute`. A result is never shown from partial data, except on the early-exit path. |
| Ownership changed from Rent to Own outright | `consent` is cleared (V4). The Consent row disappears from check answers, and the result no longer considers consent. |
| Ownership changed from Own to Rent in change mode | Go to `/consent?change=true` before returning to check answers. |
| Prior grants changed to both types in change mode | `onFinish` and go to `/result`, which shows the early-exit outcome. All answers, including the later ones, are deleted. |
| Prior grants changed from both to fewer | The journey resumes at `firstIncompleteRoute`. |
| Prior grants changed in change mode to add `insulation` (or `heatPump`) | `uninsulatedParts` (or `heating`) is cleared (V6), and its row disappears from check answers. |
| Prior grants changed in change mode to remove `insulation` (or `heatPump`) | Go to `/insulation?change=true` (or `/heating?change=true`), then back to check answers. |
| Browser Back or Forward buttons | Pages pre-fill from `answers`, and guards still apply. |
| Browser refresh on a question page or check answers, less than 10 minutes since the last progression | State is restored from sessionStorage, and the page re-renders with its answers pre-filled. |
| Browser refresh 10 minutes or more after the last progression | `load()` finds expired answers, clears them and goes to `/session-expired`. |
| Browser refresh on `/result` | The `outcome` snapshot is lost and the answers are already deleted, so the guard redirects to `/prior-grants`. |
| Browser Back from `/result` | `outcome` is cleared. The answers are already deleted, so the guards redirect to `/prior-grants`. |
| User goes back through earlier pages without pressing Continue for 10 minutes | Going back isn't a progression. The warning appears at 8 minutes and the answers expire at 10. |
| Tab in the background past 10 minutes | Timers may fire late, but the `visibilitychange` check expires the answers as soon as the tab is shown again (§4.8). |
| User presses Continue after 10 minutes, before the timer has fired | The pre-Continue check expires the answers. Nothing is saved, and the user goes to `/session-expired`. |
| New tab, or tab closed and reopened | sessionStorage is empty, so the journey starts fresh (the guards redirect). |
| Unknown URL | "Page not found" page. |
| Start now pressed with answers less than 10 minutes old | The answers are kept and pre-filled (Q8). |

### 5.3 Broken dependencies
| Failure | Detection | Recovery |
|---|---|---|
| `sessionStorage` unavailable or throws (private mode, disabled storage, quota) | `try/catch` around every storage call | Continue with in-memory state only. No error shown to the user, and nothing breaks. The only effect is that a refresh loses progress. |
| Stored JSON can't be parsed | `JSON.parse` throws | Discard the stored value, start from `emptyAnswers`, and overwrite it on the next save. |
| Stored data has the wrong `version` or fails V1–V6 | Schema check in `load()` | Same as above. |
| `savedAt` missing, not a number, or in the future (for example, the device clock was changed) | Check in `load()` | Same as above. It's treated as invalid, not as expired, so the user isn't shown `/session-expired`. |
| GOV.UK Frontend fonts or images fail to load | 404s in the Network tab | The CSS falls back to Arial. The `postinstall` copy (§2.2) must have run. |
| JavaScript disabled | – | Out of scope for this prototype (client-side SPA). Recorded as a known non-compliance in the accessibility statement. |

---

## 6. Acceptance criteria
Each criterion either passes or fails. **[U]** = Vitest unit test, **[C]** = component test (Testing Library), **[M]** = manual check.

### G1: Eligibility outcome per grant type
- AC1.1 [U] Every `propertyType` value gives the same result when all other inputs are equal.
- AC1.2 [U] `priorGrants=['insulation']`: insulation is ineligible with `ALREADY_RECEIVED`, and the heat pump outcome is unaffected.
- AC1.3 [U] `priorGrants=['heatPump']`: heat pump is ineligible with `ALREADY_RECEIVED`, and the insulation outcome is unaffected.
- AC1.4 [U] `uninsulatedParts=['floor','loft']`: eligible, `coveredParts=['loft','floor']` (in PARTS order).
- AC1.5 [U] `uninsulatedParts=['notSure']`: eligible, `needsAssessment=true`, no `coveredParts`.
- AC1.6 [U] `uninsulatedParts=['allInsulated']`: ineligible with `ALREADY_INSULATED`.
- AC1.6a [C] On `/insulation`, ticking "All parts are insulated" or "I'm not sure" clears every other option, and ticking a part clears both of them.
- AC1.7 [U] `heating='heatPump'`: heat pump ineligible with `ALREADY_HAS_HEAT_PUMP`. Every other heating value: eligible.
- AC1.8 [U] `ownership ∈ {ownOutright, mortgage}`: consent is never considered.
- AC1.9 [U] `sharedOwnership` or `rent` with `consent='no'`: both grants ineligible with `NO_CONSENT` (unless `ALREADY_RECEIVED` takes precedence).
- AC1.10 [U] `sharedOwnership` or `rent` with `consent='yes'`: same result as `ownOutright` for the same other inputs.
- AC1.11 [U] `overallEligible` is true if and only if at least one grant is eligible.

### G2: Support level by income
- AC2.1 [U] The bands map to 100 / 75 / 50 / 25 in the order of §3.3.
- AC2.2 [U] Changing only `incomeBand` never changes `eligible` or `reason` for either grant.
- AC2.3 [C] An eligible result shows "{n}%" in the panel body.

### G3: Early exit for people who've had both grants
- AC3.1 [C] Ticking both grant types on `/prior-grants` and continuing goes directly to `/result`, which shows the not-eligible heading (no panel) and `ALREADY_RECEIVED` for both grants.
- AC3.2 [U] `assessEligibility` with only `priorGrants` set to both types returns a well-formed result without throwing.
- AC3.3 [C] On the early-exit path, `/result` has no Back link and sessionStorage has no `ghg-checker` key.

### G4: Consent follow-up
- AC4.1 [C] `/consent` is shown only after `sharedOwnership` or `rent`, with the matching wording.
- AC4.2 [U] Changing ownership to `ownOutright` or `mortgage` clears `consent`.
- AC4.3 [C] Back on `/income` goes to `/consent` when consent is required, and to `/ownership` otherwise.

### G4a: Skipped questions (Q1)
- AC4a.1 [U] `priorGrants=['insulation']`: `nextRoute('/income')` is `/heating`, `backRoute('/heating')` is `/income`, and `isJourneyComplete` is true without `uninsulatedParts`.
- AC4a.2 [U] `priorGrants=['heatPump']`: `nextRoute('/insulation')` is `/check-answers`, `backRoute('/check-answers')` is `/insulation`, and `isJourneyComplete` is true without `heating`.
- AC4a.3 [U] Adding a grant type to `priorGrants` clears the matching answer (V6).
- AC4a.4 [C] Check answers has no row for a skipped question, and a deep link to a skipped question redirects past it.
- AC4a.5 [C] In change mode, removing `insulation` from prior grants goes to `/insulation?change=true`, then back to check answers.

### G5: Answers kept for 10 minutes, deleted at the result (sessionStorage)
- AC5.1 [C/M] After answering three questions, a refresh within 10 minutes keeps all three answers pre-filled.
- AC5.2 [U] `load(now)` returns `emptyAnswers` and removes the key for missing, unparseable, wrong-version, V1–V6-invalid, or future/missing `savedAt` data.
- AC5.3 [U] When `sessionStorage` throws, `load()`, `save()` and `clear()` don't throw.
- AC5.4 [M] DevTools Network tab: the journey makes no requests apart from static assets.
- AC5.5 [U] `isExpired(savedAt, savedAt + 9:59.999)` is false; `isExpired(savedAt, savedAt + 10:00)` is true.
- AC5.6 [U] `load(now)` with `now - savedAt >= 10 minutes` returns `expired: true` and `emptyAnswers`, and removes the key.
- AC5.7 [C] Each valid Continue writes a new `savedAt`. A Back link, browser navigation, and Continue with a validation error don't change it.
- AC5.8 [C] Reaching `/result` from check answers clears sessionStorage and in-memory answers, but the result page still shows the full outcome.
- AC5.9 [C] After `/result`, going to `/prior-grants` shows no answers pre-filled.

### G8: Timeout warning and expiry
- AC8.1 [C] With fake timers: no warning before 8 minutes. At 8 minutes, a notification banner with `role="alert"` and a "Keep my answers" button appears.
- AC8.2 [C] Pressing "Keep my answers" hides the banner and updates `savedAt`. The warning doesn't come back until 8 minutes after that.
- AC8.3 [C] At 10 minutes without a progression, the user is on `/session-expired`, sessionStorage has no `ghg-checker` key, and every question page is empty.
- AC8.4 [C] Continue pressed when `now - savedAt >= 10 minutes` (timers not yet fired) goes to `/session-expired` and saves nothing.
- AC8.5 [C] The warning doesn't appear before the first answer, on `/result` or on `/session-expired`.
- AC8.6 [C] Focus isn't moved when the warning appears.
- AC8.7 [M] With a screen reader, the warning is announced when it appears, and "Keep my answers" can be reached and pressed by keyboard.

### G6: GOV.UK patterns and accessibility
- AC6.1 [C] Every question page: Continue with no answer shows an error summary with `role="alert"` and the heading "There is a problem". It contains one link per error, and the link's `href` matches an existing input id.
- AC6.2 [C] Every input has an associated `<label>`, and every radio or checkbox group is in a `fieldset` with a `legend`.
- AC6.3 [C] Each page has exactly one `<h1>` and exactly one `<main>`.
- AC6.4 [C] Each route sets a unique `document.title`, prefixed `Error: ` when errors are shown.
- AC6.5 [M] The whole journey can be completed using only the keyboard, with focus visible at every step.
- AC6.6 [M] `src/App.css` doesn't exist, `src/` has no `.css` files, no inline `style` attributes and no colour literals, and every class used in `src/` is a GOV.UK Frontend class.
- AC6.6a [M] `package.json` lists `govuk-frontend` pinned to an exact version. `main.jsx` imports its `govuk-frontend.min.css`. No GOV.UK Frontend JavaScript is imported.
- AC6.6b [M] Each component in the §2.3 table matches the HTML on its Design System page for the pinned version (allowing for JSX attribute names).
- AC6.6c [M] DevTools Network tab shows the GDS Transport fonts and the crest image loading with no 404s.
- AC6.7 [C] Check answers is a `<dl class="govuk-summary-list">`, and each Change link has visually hidden context text.
- AC6.8 [M] The phase banner (alpha) and footer appear on every page, and the footer links to the accessibility statement.
- AC6.9 [M] The accessibility statement has every scaffold section filled in, including the known non-compliances (for example, JavaScript is required).
- AC6.10 [M] An automated scan (axe or Lighthouse) of each page reports no serious or critical issues.

### G7: Test suite
- AC7.1 `npm test` exits 0.
- AC7.2 Every rule row in `intent.md` → "Eligibility logic" has at least one [U] test.

---

## 7. Open questions
| # | Question | Source | Default if unanswered |
|---|---|---|---|
| Q1 | ~~Skip the insulation or heating question after a prior grant of that type?~~ **Resolved 2026-10-12:** skip it (§3.1 V6, §4.3). | Team decision | – |
| Q2 | What is the exact wording of the consent questions? | intent.md, Open questions | The wording in §4.2. **Confirmed 2026-10-12.** |
| Q3 | What is the result page content, especially "What happens next" (where and how to apply, contact details)? | intent.md, Open questions | Placeholder text saying this is a check, not an application. **Confirmed 2026-10-12.** |
| Q4 | ~~Cavity wall vs solid wall~~ **Resolved 2026-10-12:** ask which *parts* are not insulated (loft, walls, floor) instead of insulation types. | Team decision | – |
| Q5 | ~~"I don't know" option~~ **Resolved 2026-10-12:** "I'm not sure" gives "may be eligible, an assessor will check". | Team decision | – |
| Q5a | Can someone be unsure about only *some* parts (for example, they know the loft isn't insulated but don't know about the walls)? At the moment "I'm not sure" is all-or-nothing. | Found while resolving Q5 | All-or-nothing. **Confirmed 2026-10-12.** |
| Q6 | Should property-type labels include "house" ("Detached house") as the scaffold did? | Scaffold vs rules | Use the rules' labels ("Detached"). |
| Q7 | Should the support percentage be the same for both grants, or could heat pump and insulation differ? | intent.md says "support level" in the singular | One percentage applies to both. |
| Q8 | Should "Start now" clear previous answers in the same tab? | Not covered | Doesn't clear them. Answers less than 10 minutes old are pre-filled. Answers are always gone after the result page. |
| Q9 | Is the "Page not found" route acceptable, given the "no unrequested features" rule? It's standard GOV.UK hygiene. | `CLAUDE.md` constraint | Included. Remove it if you don't want it. **Confirmed 2026-10-12.** |
| Q10 | Are component tests ([C] criteria) in scope, or only unit tests for the rules? The test libraries are already installed, but intent.md only says "unit tests for rules". | intent.md vs package.json | [C] criteria are tested with Testing Library. Fall back to manual checks if time runs short. **Confirmed 2026-10-12.** |
| Q11 | Where does the phase banner "feedback" link go? | Scaffold `feedbackHref="#"` | `#` **Confirmed 2026-10-12.** |
| Q12 | What contact details go in the accessibility statement (reasonable adjustments, the enforcement procedure)? | Scaffold TODOs | Placeholder contact details, marked as a prototype. **Confirmed 2026-10-12.** |
| Q13 | ~~Update `CLAUDE.md` to say GOV.UK Frontend?~~ **Resolved 2026-10-12:** `CLAUDE.md` updated. | Team decision | – |
| Q14 | GDS Transport, the font in GOV.UK Frontend, may only be used on `service.gov.uk` domains. The prototype is hosted on `labs.decoded.com`. | GOV.UK Frontend guidance | Keep it for this hackathon prototype. Switching to Arial needs Sass, which is out of scope. **Confirmed 2026-10-12.** |
| Q15 | The not-eligible outcome no longer uses a grey panel (§4.6). Is a plain heading OK? | GOV.UK Frontend has no grey panel | Plain `govuk-heading-l` heading. **Confirmed 2026-10-12.** |
| Q16 | Is 8 minutes (2 minutes' warning) the right time to show the timeout warning? WCAG only requires at least 20 seconds to respond. | Team decision: warn, then delete | 8 minutes. |
| Q17 | Should the result page say how long the result stays on screen, or offer a way to save or print it? Answers are deleted, so the result can't be shown again. | Deleting at the result page | Neither. The "What happens next" text says the answers have been deleted. |
