# Spec: Green Home Grant eligibility checker

Status: Draft v1 · 2026-10-12
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

### 2.1 Stack (already in the scaffold; do not change)
| Concern | Choice |
|---|---|
| Language | JavaScript (ES modules, JSX). No TypeScript. |
| UI | React 18 (`react`, `react-dom`) |
| Routing | `react-router-dom` v7, `BrowserRouter` in `src/main.jsx` |
| Build/dev | Vite 8. Port 5002 and lab hosting config in `vite.config.js` must be kept unchanged. |
| Unit tests | Vitest 5 |
| Component tests | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` (already declared) |
| Persistence | Browser `window.sessionStorage` only |
| Styling | `src/App.css` only |

There are no new runtime dependencies. In particular, no `govuk-frontend` package, CSS framework or state library.

### 2.2 Setup gaps to close
1. Run `npm install`. The test devDependencies are declared but not installed (`node_modules/.bin` has no `vitest`).
2. Add a `test` block to `vite.config.js` with `environment: 'jsdom'` and a setup file that imports `@testing-library/jest-dom/vitest`. Leave the `server` block untouched.
3. The `test` / `test:watch` npm scripts already exist. Keep them.

### 2.3 UI constraints (from `CLAUDE.md` and the GOV.UK Design System)

**Design System Patterns Implemented:**
- **Question pages**: One question per page with Back link, legend heading (h1), and Continue button
- **Error validation**: Validate on Continue click (not as-you-type), display error summary at page top with role="alert" and heading "There is a problem", preserve user input on redisplay
- **Checkboxes with exclusive options**: Position "none" or "all insulated" options last with "or" divider; implement exclusive behavior so selecting one clears others
- **Conditional reveals**: Show Consent question only when Ownership is Shared ownership or Rent; use appropriate wording per context
- **Summary list**: Check answers page uses `<dl class="govuk-summary-list">` with Change links including visually hidden context text (e.g. "Change property type")
- **Panel component**: Result page displays green panel for eligible outcomes ("You may be eligible…") and grey for ineligible ("You are not eligible…")
- **Accessibility patterns**: All inputs have associated labels; radio/checkbox groups in fieldsets with legends; proper focus states; title prefix for error pages

**CSS & Styling:**
- Use only `govuk-*` classes defined in `src/App.css`, and no custom colours. Any new class must use only the existing `--govuk-*` colour variables.
- Implement focus states on all interactive elements (outline: 3px solid var(--govuk-yellow), outline-offset: 0)
- Add visited link styling (#4c2c92) for user navigation context
- Ensure sufficient spacing and touch targets (minimum 40px for inputs)

**Accessibility (WCAG 2.2 AA):**
- Each route sets a unique `document.title` in the format `<Page> - Check if you can get a Green Home Grant - GOV.UK`, prefixed `Error: ` when validation errors are shown
- There is only one `<main>` element
- All interaction works by keyboard (Tab, Enter, Space)
- Focus is visible and properly managed (moved to error summary on validation failure)
- Error messages are action-oriented and guide users to solution

**CSS additions required.** `App.css` is missing classes that this spec needs. Add these, with styles taken from the GOV.UK Frontend equivalents and using the existing colour variables only:
- `govuk-checkboxes`, `__item`, `__input`, `__label`, `__divider` (needed for the prior grants and insulation pages);
- `govuk-fieldset__legend`, `govuk-fieldset__legend--l`, `govuk-fieldset__heading`;
- `govuk-hint`;
- `govuk-link`;
- `govuk-phase-banner*` and `govuk-tag` (used by the existing `PhaseBanner.jsx`);
- `govuk-footer*` (used by the existing `GovukFooter.jsx`);
- `govuk-radios__divider`.

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

---

## 3. Data architecture

There is no server-side data. Everything lives in one client-side `answers` object held in React state in `App.jsx` and mirrored to sessionStorage.

### 3.1 `Answers` model
Values are stable machine strings. Display labels live only in the UI layer (§3.3).

| Field | Type | Allowed values | Required when |
|---|---|---|---|
| `priorGrants` | `string[]` | `'insulation'`, `'heatPump'`, `'none'` | Always (first question) |
| `propertyType` | `string` | `'detached'`, `'semiDetached'`, `'terraced'`, `'flat'`, `'bungalow'` | `priorGrants` does not contain both grant types |
| `ownership` | `string` | `'ownOutright'`, `'mortgage'`, `'sharedOwnership'`, `'rent'` | as above |
| `consent` | `string` | `'yes'`, `'no'` | as above, **and** `ownership ∈ {sharedOwnership, rent}` |
| `incomeBand` | `string` | `'under12570'`, `'12571to50270'`, `'50271to125140'`, `'over125141'` | as for `propertyType` |
| `uninsulatedParts` | `string[]` | `'loft'`, `'walls'`, `'floor'`, `'allInsulated'`, `'notSure'` | as for `propertyType` |
| `heating` | `string` | `'gasBoiler'`, `'oilBoiler'`, `'electric'`, `'heatPump'`, `'other'` | as for `propertyType` |

Initial state: every `string` field is `''` and every `string[]` field is `[]`.

**Validation rules (structural, enforced by the model):**
- V1. A `string` field is either `''` (unanswered) or one of its allowed values.
- V2. A `string[]` field contains only allowed values and has no duplicates.
- V3. Exclusive options: if `priorGrants` contains `'none'`, it contains nothing else. If `uninsulatedParts` contains `'allInsulated'` or `'notSure'`, it contains nothing else.
- V4. `consent` must be `''` when `ownership ∉ {sharedOwnership, rent}`. Changing ownership to a type that doesn't need consent clears `consent`.
- V5. A field is "answered" when it is a non-empty string or a non-empty array.

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
| Key | `ghg-checker:v1` |
| Value | `JSON.stringify({ version: 1, answers: Answers })` |
| Written | after every committed change to `answers` (Continue on a valid page) |
| Read | once, when `App` first mounts, to seed the initial state |
| Cleared | never by the app. It ends with the browser tab. |
| Validation on read | The parsed object must have `version === 1`, and every field must pass V1–V4. Any failure means the stored value is discarded and the app starts from the initial state (§5.3). |

### 3.5 Future backend seam
All storage access goes through one module (`answersStore`) with the interface `load(): Answers` and `save(answers): void`. A later backend replaces only this module. Pages never touch `sessionStorage` directly.

---

## 4. Component design

### 4.1 Module breakdown
| Module (new = ★) | Responsibility | Pure? |
|---|---|---|
| ★ `src/eligibility/assessEligibility.js` | `assessEligibility(answers) → EligibilityResult`. Applies §4.4. No React, DOM or storage. | Yes |
| ★ `src/flow/journey.js` | Route order, `nextRoute(current, answers)`, `backRoute(current, answers)`, `firstIncompleteRoute(answers)`, `isJourneyComplete(answers)`. Applies §4.3. | Yes |
| ★ `src/state/answersStore.js` | `load()` / `save()` against sessionStorage, schema validation (§3.4), and fallback when storage is unavailable. | No (I/O) |
| ★ `src/state/answers.js` | `emptyAnswers`, `setAnswer(answers, field, value) → answers` (applies V3 and V4, including clearing dependent fields), and per-field validators. | Yes |
| ★ `src/content/labels.js` | Value-to-label maps (§3.3). The income-to-percentage map lives in `assessEligibility`, not here. | Yes |
| ★ `src/components/ErrorSummary.jsx` | Props: `errors: {fieldId, message}[]`. Renders nothing when the list is empty. Otherwise renders `role="alert"`, the heading "There is a problem", and anchor links to `#fieldId`. Moves focus to itself when first shown. | – |
| ★ `src/components/RadioGroup.jsx` | `fieldset`, a `legend` holding the `h1`, an optional hint, an error message and radios. Props: `name`, `legend`, `options`, `value`, `onChange`, `error`, optional `dividerBefore` (for the "or" divider). The first input's id is `name`, so the error summary can link to it. | – |
| ★ `src/components/CheckboxGroup.jsx` | Same as `RadioGroup` but with checkboxes. Supports one `exclusive` option (V3): ticking it unticks all others, and ticking any other option unticks it. | – |
| `src/components/GovukButton.jsx` | Reuse as is. | – |
| `GovukHeader`, `PhaseBanner`, `GovukFooter` | Reuse as is. Mount them in `App.jsx`: the banner below the header with `phase="alpha"`, the footer after `</main>`'s container. | – |
| ★ `src/pages/PriorGrantsPage.jsx` | Question page | – |
| ★ `src/pages/ConsentPage.jsx` | Question page. The wording depends on `ownership`. | – |
| Existing question pages ×5 | Fill in the TODOs to match §4.2. | – |
| `CheckAnswersPage.jsx` | Summary list with Change links (§4.5). | – |
| `ResultPage.jsx` | Renders `assessEligibility(answers)` (§4.6). | – |
| `StartPage.jsx` | Service description and Start button to `/prior-grants`. | – |
| `AccessibilityStatementPage.jsx` | Fill in the TODO sections and remove the nested `<main>`. | – |
| `App.jsx` | Owns `answers` state, seeded from `answersStore.load()`. Passes `answers` and an `onAnswer(field, value)` callback to pages. Saves on change. Registers the routes. | – |

### 4.2 Pages and validation
Each question page does the following:
1. Initialises its local field value from `answers` (so Back, Change and refresh pre-fill the answer).
2. When Continue is pressed, validates the field. If it's invalid, it shows errors (§5.1), sets the `Error:` title prefix and stays on the page. If it's valid, it calls `onAnswer` and navigates to `nextRoute`.
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
| `/result` | Result | – | (panel title, §4.6) | – |
| `/accessibility-statement` | A11y statement | – | Accessibility statement | – |

### 4.3 Journey state machine
Normal forward order:

```
/ → /prior-grants
/prior-grants ──(priorGrants ⊇ {insulation, heatPump})──▶ /result        [early exit]
/prior-grants ──(otherwise)──▶ /property-type → /ownership
/ownership ──(sharedOwnership | rent)──▶ /consent → /income
/ownership ──(ownOutright | mortgage)──▶ /income
/income → /insulation → /heating → /check-answers → /result
```

Back links are always `backRoute(current, answers)`:

| Current | Back to |
|---|---|
| `/prior-grants` | `/` |
| `/property-type` | `/prior-grants` |
| `/ownership` | `/property-type` |
| `/consent` | `/ownership` |
| `/income` | `/consent` if consent is required, else `/ownership` |
| `/insulation` | `/income` |
| `/heating` | `/insulation` |
| `/check-answers` | `/heating` |
| `/result` | `/prior-grants` on the early-exit path, else `/check-answers` |

**Change mode.** A Change link goes to `<route>?change=true`. When Continue is pressed in change mode:
- If the change triggers the early exit (both prior grants), go to `/result`.
- If the change makes a previously unrequired question required (ownership changed to `sharedOwnership`/`rent` and `consent` is empty), go to `/consent?change=true`.
- If prior grants is changed *away* from both, and later answers are missing, go to `firstIncompleteRoute(answers)`. The journey then continues in normal mode.
- Otherwise go to `/check-answers`.

In change mode, Back goes to `/check-answers`.

**Route guards** (deep links, bookmarks, a refresh after storage loss). Every question route after `/prior-grants`, plus `/check-answers` and `/result`, checks that all earlier required questions are answered. If any are missing, it redirects (replace, not push) to `firstIncompleteRoute(answers)`.
- `/result` is allowed when `isJourneyComplete(answers)` is true, or when the early-exit condition holds.
- `/check-answers` is not allowed on the early-exit path. It redirects to `/result`.
- `/consent` when consent is not required redirects to `nextRoute('/ownership')`.
- Unknown routes get a GOV.UK "Page not found" page with a link to `/`. This is the only new route beyond the question flow.

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
- The function is total. For any input that passes V1–V4 (including the early-exit partial input), it returns a well-formed result and never throws.

### 4.5 Check your answers
- `<dl class="govuk-summary-list">`, with one `govuk-summary-list__row` per **required** answered field, in journey order.
  - The Consent row appears only when consent is required.
  - Multi-value answers are shown one per line using the labels from §3.3.
- Each row has a "Change" link (`govuk-link`) to `<route>?change=true`, with visually hidden context text, for example `Change <span class="govuk-visually-hidden">property type</span>`.
- The "Accept and continue" button (`GovukButton`) navigates to `/result`.

### 4.6 Result page
1. Panel:
   - if `overallEligible`: `govuk-panel` with the title "You may be eligible for a Green Home Grant" and the body "We could cover {supportPercentage}% of the cost";
   - otherwise: `govuk-panel govuk-panel--not-eligible` with the title "You are not eligible for a Green Home Grant".
2. An `h2` "Insulation grant" section, showing one of:
   - eligible with `needsAssessment`: "You may be eligible. An assessor will check which parts of your property need insulating.";
   - eligible, with a `govuk-list` of the covered parts;
   - not eligible, with a reason sentence mapped from the `ReasonCode`.
3. An `h2` "Heat pump grant" section, showing eligible or the reason.
4. An `h2` "What happens next" section (copy to be confirmed, Q3). It must state that this is a check and not an application.

| ReasonCode | Sentence |
|---|---|
| `ALREADY_RECEIVED` | You have already received this grant. You can only get one grant of each type. |
| `NO_CONSENT` (shared) | All owners of the property must agree to the work before you can apply. |
| `NO_CONSENT` (rent) | You need your landlord's permission before you can apply. |
| `ALREADY_INSULATED` | You told us all parts of your property are insulated. |
| `ALREADY_HAS_HEAT_PUMP` | Your property already has a heat pump. |

### 4.7 Persistence flow
```
App mount ─▶ answersStore.load() ─▶ valid? use it : emptyAnswers
onAnswer(field, value) ─▶ setAnswer() (applies V3/V4) ─▶ setState ─▶ answersStore.save()
```

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
| Prior grants changed to both types in change mode | Go to `/result`, which shows the early-exit outcome. Later answers stay in state but are ignored. |
| Prior grants changed from both to fewer | The journey resumes at `firstIncompleteRoute`. |
| Browser Back or Forward buttons | Pages pre-fill from `answers`, and guards still apply. |
| Browser refresh on any page | State is restored from sessionStorage, and the page re-renders with its answers pre-filled. |
| New tab, or tab closed and reopened | sessionStorage is empty, so the journey starts fresh (the guards redirect). |
| Unknown URL | "Page not found" page. |

### 5.3 Broken dependencies
| Failure | Detection | Recovery |
|---|---|---|
| `sessionStorage` unavailable or throws (private mode, disabled storage, quota) | `try/catch` around every storage call | Continue with in-memory state only. No error shown to the user, and nothing breaks. The only effect is that a refresh loses progress. |
| Stored JSON can't be parsed | `JSON.parse` throws | Discard the stored value, start from `emptyAnswers`, and overwrite it on the next save. |
| Stored data has the wrong `version` or fails V1–V4 | Schema check in `load()` | Same as above. |
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
- AC3.1 [C] Ticking both grant types on `/prior-grants` and continuing goes directly to `/result`, which shows the not-eligible panel and `ALREADY_RECEIVED` for both grants.
- AC3.2 [U] `assessEligibility` with only `priorGrants` set to both types returns a well-formed result without throwing.
- AC3.3 [C] On the early-exit path, Back on `/result` goes to `/prior-grants`, and `/check-answers` redirects to `/result`.

### G4: Consent follow-up
- AC4.1 [C] `/consent` is shown only after `sharedOwnership` or `rent`, with the matching wording.
- AC4.2 [U] Changing ownership to `ownOutright` or `mortgage` clears `consent`.
- AC4.3 [C] Back on `/income` goes to `/consent` when consent is required, and to `/ownership` otherwise.

### G5: Progress survives refresh (sessionStorage)
- AC5.1 [C/M] After answering three questions, a refresh keeps all three answers pre-filled.
- AC5.2 [U] `load()` returns `emptyAnswers` for missing, unparseable, wrong-version or V1–V4-invalid data.
- AC5.3 [U] When `sessionStorage` throws, `load()` and `save()` don't throw.
- AC5.4 [M] DevTools Network tab: the journey makes no requests apart from static assets.

### G6: GOV.UK patterns and accessibility
- AC6.1 [C] Every question page: Continue with no answer shows an error summary with `role="alert"` and the heading "There is a problem". It contains one link per error, and the link's `href` matches an existing input id.
- AC6.2 [C] Every input has an associated `<label>`, and every radio or checkbox group is in a `fieldset` with a `legend`.
- AC6.3 [C] Each page has exactly one `<h1>` and exactly one `<main>`.
- AC6.4 [C] Each route sets a unique `document.title`, prefixed `Error: ` when errors are shown.
- AC6.5 [M] The whole journey can be completed using only the keyboard, with focus visible at every step.
- AC6.6 [M] `grep` of `src/` shows no colour literals outside the `:root` variables in `App.css`, and all classes used are defined in `App.css`.
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
| Q1 | Should the insulation or heating question be skipped when the user has already received that grant type? | intent.md, Open questions | Still asked (no change to the flow). |
| Q2 | What is the exact wording of the consent questions? | intent.md, Open questions | The wording in §4.2. |
| Q3 | What is the result page content, especially "What happens next" (where and how to apply, contact details)? | intent.md, Open questions | Placeholder text saying this is a check, not an application. |
| Q4 | ~~Cavity wall vs solid wall~~ **Resolved 2026-10-12:** ask which *parts* are not insulated (loft, walls, floor) instead of insulation types. | Team decision | – |
| Q5 | ~~"I don't know" option~~ **Resolved 2026-10-12:** "I'm not sure" gives "may be eligible, an assessor will check". | Team decision | – |
| Q5a | Can someone be unsure about only *some* parts (for example, they know the loft isn't insulated but don't know about the walls)? At the moment "I'm not sure" is all-or-nothing. | Found while resolving Q5 | All-or-nothing. |
| Q6 | Should property-type labels include "house" ("Detached house") as the scaffold did? | Scaffold vs rules | Use the rules' labels ("Detached"). |
| Q7 | Should the support percentage be the same for both grants, or could heat pump and insulation differ? | intent.md says "support level" in the singular | One percentage applies to both. |
| Q8 | Should "Start now" clear previous answers in the same tab? | Not covered | Doesn't clear them. Answers are pre-filled. |
| Q9 | Is the "Page not found" route acceptable, given the "no unrequested features" rule? It's standard GOV.UK hygiene. | `CLAUDE.md` constraint | Included. Remove it if you don't want it. |
| Q10 | Are component tests ([C] criteria) in scope, or only unit tests for the rules? The test libraries are already installed, but intent.md only says "unit tests for rules". | intent.md vs package.json | [C] criteria are tested with Testing Library. Fall back to manual checks if time runs short. |
| Q11 | Where does the phase banner "feedback" link go? | Scaffold `feedbackHref="#"` | `#` |
| Q12 | What contact details go in the accessibility statement (reasonable adjustments, the enforcement procedure)? | Scaffold TODOs | Placeholder contact details, marked as a prototype. |
