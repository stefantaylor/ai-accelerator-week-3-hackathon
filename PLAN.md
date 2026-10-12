# Plan: Green Home Grant Eligibility Checker

## Context

We're building a **GOV.UK self-service eligibility checker** that lets citizens determine whether they qualify for Green Home Grants (insulation and/or heat pump), and what percentage of costs would be covered based on household income.

**Why:** Citizens need to know eligibility before applying. This prototype answers that question through a 10-page wizard that follows GOV.UK Design System patterns and accessibility guidance.

**Scope:** One client-side SPA with no backend, using sessionStorage for persistence. All eligibility logic must be pure, testable functions. UI must be bulletproof on accessibility and gov.uk patterns.

**Constraints:**
- React 18 + Vite (no new dependencies)
- One question per page, with Back link and Continue button
- GOV.UK Design System classes only (no custom colours)
- Vitest + Testing Library for testing
- Eligibility rules are the source of truth (`docs/eligibility-rules.md`)

---

## Architecture Overview

### Three layers:
1. **Rules Engine** (`src/eligibility/assessEligibility.js`) – pure function, no React/DOM
2. **State & Flow** (`src/state/`, `src/flow/`) – manage answers and journey routing
3. **UI Components** (`src/pages/`, `src/components/`) – render the flow, collect input

### Key modules to create/refactor:

| Module | Purpose | Type |
|--------|---------|------|
| `src/eligibility/assessEligibility.js` | ★ NEW – Rules engine. Maps `answers` → `EligibilityResult` | Pure |
| `src/flow/journey.js` | ★ NEW – Route ordering, `nextRoute()`, `backRoute()`, guards | Pure |
| `src/state/answersStore.js` | ★ NEW – Load/save from sessionStorage with validation | I/O |
| `src/state/answers.js` | ★ NEW – `emptyAnswers`, `setAnswer()` (applies V3/V4 rules) | Pure |
| `src/content/labels.js` | ★ NEW – Value-to-label maps for all form options | Pure |
| `src/components/ErrorSummary.jsx` | ★ NEW – Error summary with `role="alert"` | React |
| `src/components/RadioGroup.jsx` | ★ NEW – Radio fieldset with legend, hint, error message | React |
| `src/components/CheckboxGroup.jsx` | ★ NEW – Checkbox fieldset with exclusive option support | React |
| `src/pages/PriorGrantsPage.jsx` | ★ NEW – "Have you received a Green Home Grant before?" | React |
| `src/pages/ConsentPage.jsx` | ★ NEW – Conditional consent question (varies by ownership) | React |
| `src/pages/PropertyTypePage.jsx` | REFACTOR – Update labels, remove house/apartment variants | React |
| `src/pages/OwnershipPage.jsx` | REFACTOR – Change options to match spec (Own outright, Mortgage, etc.) | React |
| `src/pages/IncomePage.jsx` | REFACTOR – Update income bands to four tiers | React |
| `src/pages/InsulationPage.jsx` | REFACTOR – Replace radios with checkboxes, reword question | React |
| `src/pages/HeatingPage.jsx` | REFACTOR – Minor: rename `InsulationPage` input to `heating` | React |
| `src/pages/CheckAnswersPage.jsx` | REFACTOR – Summary list with Change links, use labels map | React |
| `src/pages/ResultPage.jsx` | REFACTOR – Render `assessEligibility()` output with reason sentences | React |
| `src/pages/StartPage.jsx` | REFACTOR – "Start now" → `/prior-grants` instead of `/property-type` | React |
| `src/pages/AccessibilityStatementPage.jsx` | REFACTOR – Fill in TODOs, remove nested `<main>` | React |
| `src/App.jsx` | REFACTOR – Add sessionStorage seeding, mount PhaseBanner & footer | React |
| `src/App.css` | REFACTOR – Add missing GOV.UK classes (checkboxes, fieldset, hint, etc.) | CSS |
| `vite.config.js` | REFACTOR – Add `test` block with jsdom and jest-dom setup | Config |

---

## Data Model

### Answers Object
```
{
  priorGrants: string[]        // ['insulation'] | ['heatPump'] | ['insulation','heatPump'] | ['none'] | []
  propertyType: string         // 'detached' | 'semiDetached' | 'terraced' | 'flat' | 'bungalow' | ''
  ownership: string            // 'ownOutright' | 'mortgage' | 'sharedOwnership' | 'rent' | ''
  consent: string              // 'yes' | 'no' | '' (only required if ownership is sharedOwnership/rent)
  incomeBand: string           // 'under12570' | '12571to50270' | '50271to125140' | 'over125141' | ''
  uninsulatedParts: string[]   // ['loft'] | ['walls'] | ['floor'] | combinations | ['allInsulated'] | ['notSure'] | []
  heating: string              // 'gasBoiler' | 'oilBoiler' | 'electric' | 'heatPump' | 'other' | ''
}
```

### Validation Rules
- **V1:** String fields are either `''` (unanswered) or one of their allowed values.
- **V2:** Array fields contain only allowed values, no duplicates.
- **V3:** Exclusive options – if `priorGrants` contains `'none'`, nothing else; if `uninsulatedParts` contains `'allInsulated'` or `'notSure'`, nothing else.
- **V4:** `consent` clears when `ownership` changes to a type that doesn't require it (ownOutright/mortgage).

### EligibilityResult Output
```
{
  overallEligible: boolean
  supportPercentage: 100 | 75 | 50 | 25 | null
  insulation: {
    eligible: boolean
    reason: null | 'ALREADY_RECEIVED' | 'NO_CONSENT' | 'ALREADY_INSULATED'
    coveredParts?: ['loft', 'walls', 'floor']  // subset, in order
    needsAssessment?: boolean                   // true if user answered 'notSure'
  }
  heatPump: {
    eligible: boolean
    reason: null | 'ALREADY_RECEIVED' | 'NO_CONSENT' | 'ALREADY_HAS_HEAT_PUMP'
  }
}
```

---

## Journey & Route Guards

### Normal flow:
```
/ → /prior-grants → /property-type → /ownership → /consent (conditional) → /income → /insulation → /heating → /check-answers → /result
```

### Early exit:
```
/prior-grants (both grant types ticked) → /result
```

### Back links (centralized in `backRoute(current, answers)`):
- Each page calls `backRoute()` to determine where Back goes
- Handles dynamic back targets based on prior answers (e.g., `/income` → `/consent` or `/ownership` depending on consent requirement)

### Route guards:
- Pages after `/prior-grants` require all earlier questions answered
- Deep links redirect to `firstIncompleteRoute(answers)`
- `/result` requires journey complete OR early-exit condition

### Change mode:
- Change links go to `<route>?change=true`
- Back always goes to `/check-answers` in change mode
- Continue routes depend on whether change triggers early exit or new missing questions

---

## Eligibility Rules (Pseudocode)

```
pct = SUPPORT_PERCENT[incomeBand] ?? null  // 100/75/50/25 or null if not answered

INSULATION:
  if priorGrants contains 'insulation'              → ALREADY_RECEIVED (ineligible)
  elif (ownership is sharedOwnership or rent) AND consent='no' → NO_CONSENT (ineligible)
  elif uninsulatedParts == ['allInsulated']        → ALREADY_INSULATED (ineligible)
  elif uninsulatedParts == ['notSure']             → eligible, needsAssessment=true
  elif uninsulatedParts is non-empty               → eligible, coveredParts=those parts (in PARTS order)
  else                                              → (shouldn't happen if form validation works)

HEAT_PUMP:
  if priorGrants contains 'heatPump'               → ALREADY_RECEIVED (ineligible)
  elif (ownership is sharedOwnership or rent) AND consent='no' → NO_CONSENT (ineligible)
  elif heating == 'heatPump'                       → ALREADY_HAS_HEAT_PUMP (ineligible)
  else                                              → eligible

overallEligible = insulation.eligible OR heatPump.eligible
supportPercentage = overallEligible ? pct : null
```

**Invariants:**
- `propertyType` never affects the output
- `incomeBand` never affects eligibility or reason, only `supportPercentage`
- `heating` never affects insulation, `uninsulatedParts` never affects heat pump

---

## Component Design

### Question Pages (all refactored or new)
- Fetch current value from `answers`
- On Continue: validate, call `onAnswer(field, value)`, navigate to `nextRoute()`
- On Back: navigate to `backRoute()`
- Show error summary + field errors if validation fails
- Pre-fill from answers on mount (survives refresh + Back button)

### Shared UI Components
- **RadioGroup**: fieldset with legend, radios, optional hint, optional divider ("or"), error message
- **CheckboxGroup**: Same, plus exclusive option support (ticking one clears others)
- **ErrorSummary**: `role="alert"`, heading "There is a problem", links to field ids, focus management

### Check Answers Page
- `<dl class="govuk-summary-list">`
- One row per required answered field (Consent row only if required)
- Each row has a "Change" link to `<route>?change=true` with visually hidden context text
- Button: "Accept and continue" → `/result`

### Result Page
- **Panel**: Green if eligible for ≥1 grant, grey otherwise
- **Insulation section** (`<h2>`): Shows eligible (with parts or assessor note) or reason
- **Heat pump section** (`<h2>`): Shows eligible or reason
- **What happens next** (`<h2>`): Placeholder text noting this is a check, not an application

### Layout & Accessibility
- Every page: one `<h1>`, one `<main>`, every input has `<label>`
- Document title: `<Page> - Check if you can get a Green Home Grant - GOV.UK`, prefixed `Error: ` when errors shown
- Phase banner (alpha) mounted in `App.jsx` below header
- Footer mounted below `</main>`, links to accessibility statement
- All interactions work by keyboard, focus visible at every step

---

## Testing Strategy

### Unit tests (Vitest, `src/__tests__/`)
**Eligibility rules** (`assessEligibility.test.js`):
- Every condition in the pseudocode above
- Income band mapping (100/75/50/25)
- Exclusive checkbox logic (V3)
- Consent-required logic (V4)
- Early exit condition (both prior grants)
- Result object shape validation
- All conditions from acceptance criteria G1–G4

**State & validation** (`answers.test.js`, `answersStore.test.js`):
- V1–V4 enforcement (type validation, exclusive options, dependent fields)
- `setAnswer()` applies V3/V4 correctly
- `load()` rejects invalid/corrupted storage
- `save()`/`load()` round-trip works
- Storage unavailable doesn't crash

**Journey logic** (`journey.test.js`):
- `nextRoute()` for every page + input combination
- `backRoute()` for consent-required vs not
- `firstIncompleteRoute()` guards
- Early-exit path behavior
- Change mode routing

### Component tests (Testing Library, `src/__tests__/`)
**Form behavior** (`RadioGroup.test.js`, `CheckboxGroup.test.js`):
- Radios work as expected, checkboxes allow multiple selection
- Exclusive checkbox clears others when ticked
- Error messages appear on validation failure
- Hint text renders

**Page components** (one per page):
- Renders with answers pre-filled
- Continue validates and calls `onAnswer`
- Back navigates to `backRoute()`
- Error summary appears with correct links
- Title includes "Error:" when errors shown
- Change mode: Back goes to `/check-answers`
- Keyboard navigation works (Tab, Enter, Space)
- Focus management (error summary gets focus)

**Check answers** (`CheckAnswersPage.test.js`):
- Summary list renders all required fields
- Conditional row (Consent) appears/disappears correctly
- Change links go to correct routes with `?change=true`
- Labels come from `labels.js` map

**Result page** (`ResultPage.test.js`):
- Panel title/style matches eligibility
- Reason sentences for each `ReasonCode`
- Support percentage displays for eligible outcomes
- Insulation covered parts listed or assessor note shown

**Accessibility patterns** (cross all pages):
- `<main>` appears exactly once
- Every fieldset has a legend, every input has a label
- Error summary has `role="alert"` and correct heading
- Document titles are set and unique
- No colour used alone to convey information

### Manual/Integration checks
- Full journey start to finish works end-to-end
- sessionStorage survives refresh on any page
- Keyboard-only navigation entire flow
- Axe/Lighthouse scan for no critical/serious issues
- No network requests (DevTools Network tab)

---

## Implementation Order

### Phase 1: Foundation (Pure logic, no UI yet)
1. Create `src/state/answers.js` – empty answers model + `setAnswer()` with V3/V4
2. Create `src/eligibility/assessEligibility.js` – rules engine
3. Create `src/flow/journey.js` – route logic
4. Create `src/content/labels.js` – value-to-label map
5. Unit tests for all of the above

### Phase 2: Storage & app state
6. Create `src/state/answersStore.js` – sessionStorage load/save
7. Refactor `App.jsx` – seed state from storage, pass answers + onAnswer to routes
8. Add `test` block to `vite.config.js`
9. `npm install` (if needed)

### Phase 3: UI components
10. Add missing CSS classes to `src/App.css`
11. Create `src/components/ErrorSummary.jsx`, `RadioGroup.jsx`, `CheckboxGroup.jsx`
12. Component tests for the above

### Phase 4: Question pages
13. Create `src/pages/PriorGrantsPage.jsx` (new)
14. Create `src/pages/ConsentPage.jsx` (new, conditional)
15. Refactor `PropertyTypePage`, `OwnershipPage`, `IncomePage`, `InsulationPage`, `HeatingPage` – match spec, add validation
16. Component tests for all pages

### Phase 5: Summary & result
17. Refactor `CheckAnswersPage.jsx` – summary list with Change links, use labels map
18. Refactor `ResultPage.jsx` – render eligibility with reason sentences
19. Component tests

### Phase 6: Wiring
20. Refactor `StartPage.jsx` – "Start now" → `/prior-grants`
21. Add routes to `App.jsx` – all pages mounted with the journey logic
22. Refactor `AccessibilityStatementPage.jsx` – fill TODOs, remove nested `<main>`
23. Mount PhaseBanner and GovukFooter in `App.jsx`

### Phase 7: Acceptance & fixes
24. Run full acceptance criteria checklist (G1–G7)
25. Manual accessibility checks (keyboard, screen reader test, axe scan)
26. Bug fixes and polish

---

## Flagged Open Questions (Require Team Decision)

| # | Question | Impact | Recommendation if needed now |
|---|----------|--------|------|
| Q1 | Skip insulation/heating question if user already received that grant? | Flow complexity | No (ask the question anyway) |
| Q2 | Exact wording of consent questions? | Copy/UX | Use spec wording: "Do all owners agree to the work?" (shared) / "Do you have your landlord's permission for the work?" (rent) |
| Q3 | Result page "What happens next" content? | Copy | Placeholder: "This is a check to see if you might be eligible. [Apply now] or [Contact us]." |
| Q6 | Property-type labels include "house"? | Copy | Use spec labels: "Detached", "Semi-detached", etc. (no "house") |
| Q9 | Include "Page not found" route? | Feature scope | Yes (standard GOV.UK hygiene; includes it) |
| Q10 | Component tests in scope? | Testing | Yes (full Testing Library coverage per acceptance criteria G6) |
| Q12 | Contact details for accessibility statement? | Copy | Use placeholders: "Email: [example@example.gov.uk], Phone: 0123 456 7890" |

---

## Key Decisions Made

1. **Refactor existing pages** rather than rewrite – keeps the structure, updates logic and labels
2. **Centralize back route logic** in `journey.js` – pages don't decide their own back links
3. **Pure eligibility function** – `assessEligibility()` is a testable function, not a class or side effects
4. **sessionStorage only** – answers persisted but not synced to a server (seam left for future backend)
5. **Full Testing Library coverage** – all UI patterns (error summaries, labels, focus, keyboard) tested
6. **No new dependencies** – use existing React, Vite, Vitest, Testing Library

---

## Critical Files & Paths

### New files to create:
- `src/eligibility/assessEligibility.js` + `.test.js`
- `src/flow/journey.js` + `.test.js`
- `src/state/answers.js` + `.test.js`
- `src/state/answersStore.js` + `.test.js`
- `src/content/labels.js`
- `src/components/ErrorSummary.jsx` + `.test.js`
- `src/components/RadioGroup.jsx` + `.test.js`
- `src/components/CheckboxGroup.jsx` + `.test.js`
- `src/pages/PriorGrantsPage.jsx` + `.test.js`
- `src/pages/ConsentPage.jsx` + `.test.js`

### Existing files to refactor:
- `src/App.jsx` (state, storage, routes, PhaseBanner mount)
- `src/App.css` (missing GOV.UK classes)
- `src/pages/PropertyTypePage.jsx` through `AccessibilityStatementPage.jsx`
- `vite.config.js` (add test block)

---

## GOV.UK Design System Conformance

All patterns follow [GOV.UK Design System](https://design-system.service.gov.uk/) guidance:

- **Question pages**: One per page with heading, Back link, Continue button
- **Error validation**: On Continue click (not as-you-type); error summary at top with role="alert"; field-level messages; input preserved
- **Exclusive checkboxes**: "None" or "All insulated" options last with "or" divider; JavaScript exclusive behavior
- **Conditional reveals**: Consent question shown only for Shared ownership or Rent; wording varies by context
- **Summary list**: Check answers with Change links + visually hidden context text
- **Panel component**: Green for eligible ("You may be eligible…"), grey for ineligible
- **Focus states**: 3px solid yellow outline on all interactive elements
- **Visited links**: Purple (#4c2c92) to show navigation history
- **Accessibility**: WCAG 2.2 AA compliant; keyboard navigable; proper heading hierarchy; error pages titled "Error: …"

## Success Criteria (Acceptance)

The implementation is complete when:
1. **AC7.1**: `npm test` exits 0 (all tests pass)
2. **AC7.2**: Every rule in intent.md → Eligibility logic has ≥1 unit test
3. **G1–G7 acceptance criteria** all met (eligibility logic, support levels, early exit, consent, sessionStorage, patterns, test suite)
4. **Keyboard + screen reader navigable** end-to-end
5. **axe/Lighthouse scan** reports no serious/critical issues
6. **GOV.UK Design System patterns** implemented per guidance (question pages, errors, exclusive checkboxes, conditional reveals, summary list, panel)
7. **No network requests** (DevTools confirms static assets only)
