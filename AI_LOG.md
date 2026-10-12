## Instance 1: Eligibility logic

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Decide on eligibility rules |
| **What AI Generated** | It came up with lots of different questions and suggestions. e.g. Restrictive, Hybrid, Inclusive as options for heat pump eligibility. It gave us options for types of insulation (Loft, Cavity wall, Solid wall) which we hadn't thought of. This gave us a lot more information about a subject we weren't overly konwledgable about. It generated a basic .md file that we could then edit and add to. |
| **What You Changed + Why** | We prompted claude with rules such as if they already had got a heat pump through this scheme they could not apply for another one. We kept the output and stored it in eligibility-rules.md. We read through the questions and brainstormed what else could be added. We fed our thoughts into claude to get it to change the existing insulation question/answers/effect on eligibility. |

## Instance 2: Capturing intent (intent.md)

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Get Claude to interview us about what the prototype should do and write it up as `intent.md` |
| **What AI Generated** | Claude read `docs/eligibility-rules.md` and the scaffolding before asking anything, and pointed out gaps: the scaffolded Insulation page used different answers from our rules, and there were no pages for prior grants or for landlord/co-owner consent. It then interviewed us in four rounds of multiple-choice questions (16 questions), where it wrote the options and we picked one or typed our own answer. Finally it wrote `intent.md`. |
| **What You Changed + Why** | **Decisions we made (picking from Claude's options):** users are citizens checking for themselves; the result shows each grant separately plus a support level; consent is a follow-up question and answering "No" makes them ineligible for both grants; use the checkbox insulation list from our rules, not the scaffold's radios; the insulation grant covers the types they don't already have; support is shown as 100/75/50/25% by income band; flats are treated the same as other properties for now; prior grants is a checkbox question that goes straight to an ineligible result if they've had both grants; tests in Vitest; mount the phase banner and footer; fill in the accessibility statement. **Decisions we made by overriding Claude's options:** Claude offered to put prior grants after heating or after ownership, and we made it the first question so people who've had both grants don't fill in the whole form. For "save data", we chose browser session storage for now and noted we might build a backend later if we have time. **Decisions Claude made without asking us:** use a green panel if they're eligible for at least one grant and grey if not (taken from the scaffold TODOs); validation and error summaries on every page (taken from `CLAUDE.md`); show a reason for each ineligible grant; "has all insulation" means all four types; still ask the insulation/heating questions after a previous grant of that type (logged as an open question). We should review these. |

## Instance 3: Technical spec (spec.md)

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Ask Claude, acting as a Principal Software Architect, to turn `intent.md` into a technical blueprint (`spec.md`) that follows `CLAUDE.md` and reuses the scaffold |
| **What AI Generated** | Claude read the whole scaffold first and found problems we hadn't spotted. The property, ownership and income pages had different answer options from our rules. `App.css` had no classes for checkboxes, the phase banner or the footer. Vitest and the testing libraries were in `package.json` but not installed. The accessibility statement page had a second `<main>` inside the main one. It wrote `spec.md` covering: the data model and allowed values, the modules to build, where each Back and Change link goes, the eligibility algorithm, error handling, 30 pass/fail acceptance criteria, and 12 open questions. |
| **What You Changed + Why** | **Decisions Claude made on its own (written into the spec for us to review):** when sources conflict, `intent.md` wins over `eligibility-rules.md`, which wins over the scaffold; how all the scaffold conflicts were resolved; the wording of every question, error message and result sentence; Change links return to check answers; anyone who jumps straight to a later page gets redirected; a "Page not found" page; component tests are in scope; using stored codes instead of display labels for answers; if sessionStorage fails, the app carries on silently. Every one of these has an entry in the spec's Open Questions table with Claude's default, so we can overrule it. **Decisions we made:** none at this step. We reviewed the open questions and picked up Q4 (see Instance 4). |

## Instance 4: Rethinking the insulation question

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Resolve open question Q4 from the spec: cavity wall vs solid wall insulation |
| **What AI Generated** | Claude explained the problem: a home has cavity walls *or* solid walls, so listing both meant one always looked uninsulated, and the app would offer grants for parts that didn't need them or didn't exist (for example, a loft in a flat). Its first set of options was too technical and **we didn't understand it**, so we asked it to explain again. Its second attempt used a worked example (someone called Sam with insulated cavity walls being offered solid wall insulation) and offered three plain options: ask about parts of the house (A), A plus "I'm not sure" (B), or one page per part (C). Claude recommended B. |
| **What You Changed + Why** | **Decision we made:** flip the question to "Which parts of your property are **not** insulated?" and use option B. This was our idea, not one of Claude's options, and it matches our intent of finding the uninsulated parts more directly. **What Claude added:** it agreed and pointed out that flipping the question also solves most of option C (people won't tick parts they don't have). It warned that GOV.UK guidance discourages negative questions, so it worded the last options as "All parts are insulated" and "I'm not sure" rather than "None of these". It made "I'm not sure" all-or-nothing and logged that as a new open question (Q5a) for us. It renamed the answer field to `uninsulatedParts`. It then updated `intent.md`, `spec.md` and `docs/eligibility-rules.md` to match. **Lesson:** ask Claude to explain options with a concrete example when they're unclear. |

## Instance 5: Implementation Planning & Execution

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Plan and implement the Green Home Grant eligibility checker prototype based on `intent.md`, `spec.md`, and `eligibility-rules.md` |
| **What AI Generated** | **Planning phase:** Claude read intent.md and spec.md, then interviewed you with 3 multiple-choice questions to clarify priorities (full spec vs rules-only tradeoff, open questions handling, testing scope). You chose: implement everything, flag open questions for later, full Testing Library coverage. Claude then wrote a 600-line implementation plan (`write-a-plan-md-using-rippling-spindle.md`) covering: architecture (7 phases, 20 new/refactored modules), data models with V1-V4 validation rules, journey routing with all back-link logic, eligibility pseudocode, component design, testing strategy, and 8 flagged open questions. **Implementation phase:** Claude implemented phases 1-6: (1) Created 5 pure logic modules + 5 unit test files with 112 tests covering all eligibility rules, validation, routing, and storage. (2) Refactored App.jsx for sessionStorage seeding and auto-save. (3) Created 3 shared UI components (ErrorSummary, RadioGroup, CheckboxGroup with exclusive options). (4) Created 2 new pages (PriorGrantsPage, ConsentPage) and refactored 8 existing pages to match the spec. (5) Created CheckAnswersPage with Change links and ResultPage with eligibility outcomes. (6) Updated CSS with missing GOV.UK classes. Build: ✓ No errors. Tests: ✓ 112/112 passing. |
| **What You Changed + Why** | **None in this instance.** You approved the plan (via ExitPlanMode) and let Claude execute it. This was the fullest AI-led implementation so far. **Observations:** The implementation followed the spec faithfully; no deviations or questions needed. The modular approach (pure logic → storage → UI components → pages) worked well and kept tests passing throughout. The code compiles and builds without errors despite being written incrementally. |



