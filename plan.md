# Plan: Green Home Grant eligibility checker

Status: Agreed after interview · 2026-10-12
Built from: `intent.md`, `spec.md` (Draft v2), `CLAUDE.md`, `docs/eligibility-rules.md`.

This plan says **in what order** to build what the spec describes, and how we'll know each step is done. It doesn't add anything new. If this plan and the spec disagree, the spec wins. Section numbers like §4.3 refer to `spec.md`.

---

## How we'll work

- **Eight phases, built in order.** Each phase ends at a point where the app still runs and `npm test` passes.
- **One review, at the end.** Claude works through all phases without stopping, then hands over with a summary of what changed and which acceptance criteria (ACs) pass. If something blocks progress or needs a decision that isn't in the spec, Claude stops and asks rather than guessing.
- **No commits.** Every change is left uncommitted for the team to review and commit. (Git is on a detached HEAD.)
- **Full test coverage.** Both the rule tests [U] and the screen tests [C] are written.
- **Logic first, screens second.** The eligibility rules, journey order and expiry rules are written as plain functions with unit tests *before* any page uses them. Then, if a page shows the wrong thing, we know the bug is in the page, not the rules.
- **Tests sit next to the code** they test, for example `src/eligibility/assessEligibility.test.js`.
- **Copying GOV.UK markup.** The `govuk-frontend` package includes the exact HTML for every component example, for example `node_modules/govuk-frontend/dist/govuk/components/checkboxes/template-with-divider-and-none.html`. We copy component markup from those files, so it always matches the version we installed (6.5.1), and then convert it to JSX.

---

## Phase 0: Setup

**Goal:** the existing scaffold looks like a GOV.UK page, using real GOV.UK Frontend styles, and the test runner works.

| # | Task | Files |
|---|---|---|
| 0.1 | Run `npm install`. Vitest now appears in `node_modules/.bin`, so check it runs. | – |
| 0.2 | `npm install --save-exact govuk-frontend@6.5.1` | `package.json`, `package-lock.json` |
| 0.3 | Add a `postinstall` script that copies `node_modules/govuk-frontend/dist/govuk/assets` to `public/assets`. Run it once. | `package.json` |
| 0.4 | Add `public/assets` to `.gitignore` | `.gitignore` |
| 0.5 | Add `govuk-template` / `govuk-template__body` classes, and the favicon and theme-colour tags from the GOV.UK page template | `index.html` |
| 0.6 | Import `govuk-frontend.min.css` and remove the `App.css` import | `src/main.jsx` |
| 0.7 | Delete `src/App.css` | `src/App.css` |
| 0.8 | Add the `test` block (`jsdom`, a setup file importing `@testing-library/jest-dom/vitest`). Leave `server` untouched. | `vite.config.js`, ★ `src/test/setup.js` |
| 0.9 | Add one placeholder test so `npm test` has something to run | ★ `src/test/smoke.test.js` |

**Done when:**
- `npm run dev` shows the scaffold in GOV.UK styling, with the GDS Transport font loading and no 404s in the Network tab (AC6.6c).
- `npm test` exits 0.

**Risk:** if Vite won't serve `/assets/…` from `public/`, we fall back to copying the assets in a small Vite plugin. I'll tell you before doing that.

---

## Phase 1: Rules and data (pure functions, unit tests only)

**Goal:** all the business logic is written and tested, with no screens yet.

| # | Module | What it does | Spec |
|---|---|---|---|
| 1.1 | ★ `src/content/labels.js` | Machine value → display label for every answer | §3.3 |
| 1.2 | ★ `src/state/answers.js` | `emptyAnswers`, `setAnswer` (exclusive options, clearing consent), field validators | §3.1 V1–V5 |
| 1.3 | ★ `src/eligibility/assessEligibility.js` | The eligibility algorithm | §3.2, §4.4 |
| 1.4 | ★ `src/flow/journey.js` | `nextRoute`, `backRoute`, `firstIncompleteRoute`, `isJourneyComplete`, plus a helper for consent-required and early-exit checks | §4.3 |
| 1.5 | ★ `src/state/expiry.js` | `ANSWERS_TTL_MS`, `WARNING_AFTER_MS`, `isExpired`, `isWarningDue` | §4.8 |
| 1.6 | ★ `src/state/answersStore.js` | `load(now)`, `save(answers, now)`, `clear()`, with validation and a fallback when storage is unavailable | §3.4, §3.5, §5.3 |

**ACs covered (unit tests):** AC1.1–1.11 (except 1.6a), AC2.1, AC2.2, AC3.2, AC4.2, AC4a.1–4a.3, AC5.2, AC5.3, AC5.5, AC5.6, AC7.2. The journey functions also get unit tests for every row in the §4.3 Back table and every forward arrow.

**Done when:** `npm test` passes, and every rule row in `intent.md` → "Eligibility logic" has at least one named test (AC7.2). I'll list the test names against the rule rows for you to check.

---

## Phase 2: Shared GOV.UK components

**Goal:** the building blocks every page needs, each copied from GOV.UK Frontend markup.

| # | Component | Source template (in `govuk-frontend/dist/govuk/components/`) |
|---|---|---|
| 2.1 | `GovukHeader` (rewrite) | `header/template-default.html` |
| 2.2 | ★ `ServiceNavigation` | `service-navigation/` (service name only, no links) |
| 2.3 | `PhaseBanner` (check and fix) | `phase-banner/` |
| 2.4 | `GovukFooter` (rewrite; accessibility link uses router `<Link>`) | `footer/` |
| 2.5 | `GovukButton` (add start variant arrow) | `button/` |
| 2.6 | ★ `BackLink` (router `<Link>`) | `back-link/` |
| 2.7 | ★ `ErrorSummary` (focuses itself when shown) | `error-summary/` |
| 2.8 | ★ `RadioGroup` (fieldset, legend as `<h1>`, hint, error, "or" divider) | `radios/`, `fieldset/`, `hint/`, `error-message/` |
| 2.9 | ★ `CheckboxGroup` (exclusive options handled in React) | `checkboxes/template-with-divider-and-none.html` and others |
| 2.10 | ★ `TimeoutWarning` (`role="alert"`, "Keep my answers") | `notification-banner/` |
| 2.11 | ★ `usePageTitle(title, hasErrors)`, a small hook that sets `document.title`, with an `Error: ` prefix when there are errors | – (see "Things to check" below) |

**ACs covered (component tests):** AC1.6a (exclusive checkbox behaviour on the component), AC6.2 (labels, fieldsets, legends) at component level, AC8.6 (warning doesn't take focus).

**Done when:** component tests pass. I'll also show you a side-by-side comparison of each component's JSX against its source template (AC6.6b).

---

## Phase 3: App shell, state and routing

**Goal:** `App.jsx` holds the answers, saves them, and sends people to the right page. Pages can stay as stubs for now.

| # | Task | Spec |
|---|---|---|
| 3.1 | Page layout: skip link → header → service navigation → phase banner → width container → `<main id="main-content">` → footer. Only one `<main>`. | §2.3, §4.1 |
| 3.2 | State: `answers`, `savedAt`, `outcome`. Seed from `answersStore.load(Date.now())`. | §4.7 |
| 3.3 | `onAnswer(field, value)`: apply `setAnswer`, set `savedAt = now` and save | §4.7 |
| 3.4 | `onFinish(finalAnswers)`: snapshot `{ answers, result }` into `outcome`, clear storage and answers, go to `/result`. Clear `outcome` when leaving `/result`. | §4.7 |
| 3.5 | Register all routes, including ★ `/prior-grants`, ★ `/consent`, ★ `/session-expired` and a "Page not found" catch-all | §4.2, §4.3 |
| 3.6 | Route guards (redirect with replace), including the `/result` and `/check-answers` special cases, and skipped `/insulation` or `/heating` | §4.3 |
| 3.7 | Fix the nested `<main>` in `AccessibilityStatementPage` (change it to a fragment) | §2.4 |

**ACs covered:** AC6.3 (one `<main>`), AC6.8 (banner and footer on every page), plus guard tests for deep links.

**Done when:** you can type any URL and land on the right page or be redirected correctly.

---

## Phase 4: Start page and question pages

**Goal:** the whole question flow works with validation.

| # | Page | Notes |
|---|---|---|
| 4.1 | `StartPage` | Description, start button → `/prior-grants` |
| 4.2 | ★ `PriorGrantsPage` | Checkboxes, "No" is exclusive. Both grants → `onFinish` (early exit). |
| 4.3 | `PropertyTypePage` | Use the spec's values, not the scaffold's |
| 4.4 | `OwnershipPage` | Use the spec's values. Changing ownership clears consent. |
| 4.5 | ★ `ConsentPage` | Wording depends on ownership |
| 4.6 | `IncomePage` | Four bands |
| 4.7 | `InsulationPage` | Checkboxes. "All parts are insulated" and "I'm not sure" are exclusive. Skipped if an insulation grant was already received. |
| 4.8 | `HeatingPage` | Skipped if a heat pump grant was already received. |

Every page follows the same pattern (§4.2): pre-fill from answers → Continue → check expiry → validate → error summary or `onAnswer` + `nextRoute`. Back link from `backRoute`. Change mode (`?change=true`) as in §4.3.

**ACs covered:** AC1.6a (on the real page), AC3.1, AC4.1, AC4.3, AC4a.5, AC5.1, AC5.7, AC6.1, AC6.2, AC6.4.

**Done when:** you can click through every path (owner, renter yes/no, shared ownership, early exit, insulation-only prior grant, heat-pump-only prior grant) by hand, and the component tests pass.

---

## Phase 5: Check answers, result and session expired

| # | Page | Notes |
|---|---|---|
| 5.1 | `CheckAnswersPage` | `govuk-summary-list`, Change links with hidden context text, "Accept and continue" → expiry check → `onFinish` |
| 5.2 | `ResultPage` | Reads only `outcome`. Green panel if eligible, plain `<h1>` if not. A section per grant with its reasons, and "What happens next", which says the answers were deleted. No Back link. |
| 5.3 | ★ `SessionExpiredPage` | Heading, explanation, "Start again" → `/` |

**ACs covered:** AC2.3, AC3.3, AC4a.4, AC5.8, AC5.9, AC6.7, change-mode routing (§4.3) tests.

**Done when:** a full journey ends on the right result, and afterwards sessionStorage is empty and every question page is blank.

---

## Phase 6: Timeout warning and expiry

**Goal:** the 10-minute rule works, including in background tabs.

| # | Task | Spec |
|---|---|---|
| 6.1 | Two timers in `App` based on `savedAt` (warning at 8 minutes, expiry at 10). Reset them when `savedAt` changes, and clear them on unmount. | §4.8 |
| 6.2 | Show `TimeoutWarning` at the top of `<main>`. "Keep my answers" counts as a progression. | §4.8 |
| 6.3 | On expiry: clear everything and go to `/session-expired` (replace) | §4.8 |
| 6.4 | Also check expiry on route change, on `visibilitychange`, and before every Continue, Accept and continue, and "Keep my answers" | §4.8 |
| 6.5 | `load()` finding expired answers on startup → `/session-expired` | §4.7 |

**ACs covered:** AC8.1–AC8.6, using Vitest fake timers.

**Done when:** the tests pass, and a manual check with the timings temporarily shortened (for example, a 20-second expiry in dev only, then put back) shows the warning and the expired page.

---

## Phase 7: Accessibility statement and manual checks

| # | Task |
|---|---|
| 7.1 | Fill in every TODO in `AccessibilityStatementPage`. Known non-compliances: JavaScript is required. Placeholder contact details marked as a prototype (Q12). (AC6.9) |
| 7.2 | Keyboard-only run through the whole journey, with focus visible (AC6.5) |
| 7.3 | Screen reader check of the timeout warning (AC8.7) |
| 7.4 | axe or Lighthouse scan of every page, with no serious or critical issues (AC6.10) |
| 7.5 | Network tab: no requests apart from static assets (AC5.4) |
| 7.6 | Code checks: no `.css` files in `src/`, no inline styles, no colour literals, only GOV.UK classes, no GOV.UK Frontend JavaScript imported (AC6.6, AC6.6a) |

**Done when:** every [M] AC has a recorded pass or a listed problem. Results go in a short checklist at the bottom of this file.

---

## Phase 8: Wrap-up

- Run `npm test` one last time (AC7.1).
- Go through the spec's §6 AC list and tick each one with the test name or manual check that covers it.
- Draft the AI_LOG entries for you to edit (you write the "What You Changed + Why" column).

---

## Things to check in this plan

These are small choices I made while planning. None of them change what the service does.

1. **Service navigation (spec corrected).** GOV.UK Frontend v6 moved the service name out of the header into a separate "Service navigation" component. I updated `spec.md` §2.3 and §2.4 to match. Without this, the service name wouldn't appear at the top of the page.
2. **`usePageTitle` hook.** The spec requires page titles (§2.3) but doesn't name a module for them. I've planned one tiny shared hook rather than repeating the same code on 12 pages.
3. **Shortened timings for the manual test** in Phase 6 are temporary and are removed before the phase ends.

## Decisions from the interview (2026-10-12)

| Topic | Decision |
|---|---|
| Review checkpoints | One review at the end, not after every phase |
| Git | No commits. Changes are left for the team to commit. |
| Tests | Full: rule tests and screen tests (Q10) |
| "What happens next" text | Clearly marked placeholder (Q3) |
| Accessibility statement contacts | Clearly fake placeholder details (Q12) |
| Feedback link | `#` (Q11) |
| Consent wording | As in spec §4.2 (Q2) |
| Skip insulation/heating after a prior grant of that type | **Skip it.** Spec updated: V6, §4.3 order, Back links, guards, change mode, ACs G4a (Q1). |
| "I'm not sure" | All-or-nothing (Q5a) |
| Page not found | Included (Q9) |

---

## Results (2026-10-12)

All phases built. `npm test`: **7 test files, 139 tests, all passing.** Nothing committed.

### Acceptance criteria

| AC | Status | Where |
|---|---|---|
| AC1.1–AC1.11 | ✅ | `src/eligibility/assessEligibility.test.js` |
| AC1.6a | ✅ | `src/test/questionPages.test.jsx` (exclusive checkboxes) |
| AC2.1, AC2.2 | ✅ | `assessEligibility.test.js` |
| AC2.3 | ✅ | `src/test/journey.test.jsx` (full journey) |
| AC3.1, AC3.3 | ✅ | `journey.test.jsx` (early exit) |
| AC3.2 | ✅ | `assessEligibility.test.js` |
| AC4.1 | ✅ | `questionPages.test.jsx`, `journey.test.jsx` |
| AC4.2 | ✅ | `src/state/answers.test.js` |
| AC4.3 | ✅ | `src/flow/journey.test.js`, `journey.test.jsx` |
| AC4a.1–AC4a.3 | ✅ | `journey.test.js`, `answers.test.js` |
| AC4a.4, AC4a.5 | ✅ | `journey.test.js`, `journey.test.jsx` |
| AC5.1, AC5.7–AC5.9 | ✅ | `journey.test.jsx` |
| AC5.2, AC5.3, AC5.5, AC5.6 | ✅ | `src/state/answersStore.test.js` |
| AC5.4 | ✅ code check / ⏳ browser | No `fetch`, XHR, beacon or WebSocket in `src/`. Network tab check still to do. |
| AC6.1–AC6.4 | ✅ | `questionPages.test.jsx` (every question page), `journey.test.jsx` (other pages) |
| AC6.5 | ⏳ **team to check** | Keyboard-only run through |
| AC6.6, AC6.6a | ✅ | No `.css` files in `src/`, no inline styles, no colour literals, every class is a GOV.UK Frontend class, no GOV.UK Frontend JavaScript imported |
| AC6.6b | ✅ | Markup copied from the `govuk-frontend` 6.5.1 templates. Header and footer SVGs were extracted from the package by script, not retyped. |
| AC6.6c | ✅ server / ⏳ browser | Fonts, crest, favicon and manifest all return 200 from the dev server. Browser Network tab check still to do. |
| AC6.7, AC6.8 | ✅ | `journey.test.jsx` |
| AC6.9 | ✅ | Accessibility statement filled in, with placeholders marked `[prototype: …]` |
| AC6.10 | ✅ jsdom / ⏳ browser | axe-core scan of every page, error states and both result types: no serious or critical issues. Colour contrast can't be checked in jsdom, so a Lighthouse run in a browser is still to do. |
| AC7.1, AC7.2 | ✅ | Every rule row in `intent.md` has a test named after it in `assessEligibility.test.js` |
| AC8.1–AC8.6 | ✅ | `src/test/timeout.test.jsx` (fake timers) |
| AC8.7 | ⏳ **team to check** | Screen reader check of the timeout warning |

⏳ = needs a real browser. Claude couldn't open one here: headless Firefox (a snap package) won't start inside code-server. The planned Phase 6 manual check with shortened timings wasn't done for the same reason. The fake-timer tests cover the same behaviour.

### Differences from the plan and spec

1. **Answers cleared on arrival.** When the result or expired page is reached, stored answers are deleted straight away, but the in-memory copy is cleared only once the new page has loaded. React Router 7 applies navigation as a low-priority update, so clearing first let the old page's guard redirect to the first question. The tests caught this.
2. **Focus moves to the new page's `<h1>`** after every page change, and the window scrolls to the top. The spec didn't say this. In a single-page app, screen reader users aren't told that a new page has loaded unless focus moves. Remove it if you'd rather not have it (the `useEffect` in `App.jsx` that runs on route change).
3. **Back link sits above `<main>`**, where the GOV.UK page template puts it (`beforeContent`). `App.jsx` renders it from `backRoute`, rather than each page doing it.
4. **Shared question page.** All 7 question pages use one `QuestionPage` component, with the fieldset markup in `QuestionFieldset`. Each page file only holds its wording and options.
5. **`vite.config.js` has a `css.lightningcss.errorRecovery` setting.** GOV.UK Frontend's CSS has an old Internet Explorer hack that stops Vite's production build. This setting drops just those rules. The `server` block is unchanged.
6. **Labels not fixed by the spec**, which you may want to review: "Own with a mortgage" (the spec value is `mortgage`); the check answers row names ("Previous Green Home Grants", "Own or rent", "Permission for the work", …); and the start page and result page body text.
