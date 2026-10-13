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

## Instance 5: GOV.UK Frontend and keeping answers for 10 minutes

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Update `intent.md` and `spec.md` so that (1) the app must use the GOV.UK Design System and its GOV.UK Frontend components, and (2) answers only last 10 minutes after each step forward in the form, and are deleted once the result page is reached |
| **What AI Generated** | Claude checked the real `govuk-frontend` package (version 6.5.1) before writing anything. It found that the package's CSS loads fonts and images from `/assets/…`, so the spec now includes a setup step to copy them. It explained that GOV.UK Frontend doesn't include React components, so we copy each component's HTML into JSX and don't run its JavaScript. Its example: the GOV.UK script would untick checkboxes on screen without React knowing, so the wrong answers would be saved. It found that a 10-minute timeout with no warning breaks the accessibility rules (WCAG 2.2.1 "Timing adjustable", level A), and asked us how to handle it using a worked example (Priya making a cup of tea). It then added to the spec: a 10-minute timer that restarts on every Continue, a warning banner at 8 minutes, a "Your answers have been deleted" page, a way for the result page to still show the outcome after the answers are deleted, 14 new acceptance criteria, and new open questions Q13 to Q17. |
| **What You Changed + Why** | **Decisions we made:** warn the user at 8 minutes with a "Keep my answers" button, then delete their answers and explain why (we picked Claude's recommended option because it's the only one that meets the accessibility rules). We asked Claude to update `CLAUDE.md`, which still told it to use the hand-written classes in `App.css`. We accepted Claude's other decisions. **Decisions Claude made without asking us (we reviewed them and they're fine):** no grey "not eligible" panel, because GOV.UK Frontend doesn't have one and panels are only for good outcomes; no Back link on the result page, because the answers are gone; keep the GDS Transport font for the hackathon, even though it's only licensed for `service.gov.uk` sites; delete `App.css`. |

## Instance 6: Implementation plan (plan.md)

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Ask Claude to write `plan.md` from the spec and intent, without writing any code until we've reviewed it |
| **What AI Generated** | An eight-phase plan: setup, then the rules as tested functions, then shared GOV.UK components, the app shell, question pages, check answers and result, the timeout, and finally accessibility checks. Each phase lists its tasks, files, the acceptance criteria it covers and what "done" means. Every acceptance criterion in the spec is assigned to a phase. While planning, Claude checked the GOV.UK Frontend v6 templates and **found a mistake in our spec**: v6 moved the service name out of the header into a separate "Service navigation" component. It corrected `spec.md`. It also planned a small page-title helper that the spec didn't name. |
| **What You Changed + Why** | **Decisions we made:** we didn't let Claude write any code until we'd reviewed the plan, and we asked it to interview us with clarifying questions before starting. Claude proposed stopping for review after every phase, with one commit per phase. We changed this in the interview (Instance 7). **Lesson:** checking the real package rather than relying on memory caught a version difference that would have left the service name off every page. |

## Instance 7: Interview before building

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Ask Claude to interview us with clarifying questions before carrying out `plan.md` |
| **What AI Generated** | Three rounds of multiple-choice questions (10 in total), each with a worked example and a recommended option. They covered how we work together (review checkpoints, git, how much testing), the placeholder content in the spec's open questions, and three open questions about how the form behaves. Claude also spotted that git was on a detached HEAD, which means commits could get lost. After we answered, it updated `spec.md`, `intent.md` and `plan.md` to match. |
| **What You Changed + Why** | **Decisions we made:** one review at the end instead of after every phase (going against Claude's recommendation, to save time); no commits by Claude, because we'll commit ourselves; full rule and screen tests, because we have enough time; placeholders for "What happens next", the accessibility contacts and the feedback link; keep the consent wording; keep "I'm not sure" all-or-nothing; include a "Page not found" page. **We overruled Claude's recommendation on one form question:** skip the insulation question if they've already had an insulation grant, and skip the heating question if they've had a heat pump grant, because the answer can't change their result. Claude updated the spec for this: a new rule (V6) that clears the skipped answer, a new question order and Back links, changes to the Change links on check answers, and 5 new acceptance criteria (G4a). |

## Instance 8: Building the app from plan.md

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** | Ask Claude to carry out every phase of `plan.md` without stopping, and without committing |
| **What AI Generated** | The whole app: the eligibility rules, question order, 10-minute expiry and storage as tested functions; GOV.UK components copied from the `govuk-frontend` 6.5.1 templates (header and footer logos pulled out of the package by script so they couldn't be mistyped); 9 question and summary pages; the result, "Your answers have been deleted", "Page not found" and accessibility statement pages; and the timeout warning. 139 tests, all passing. It also ran a temporary axe accessibility scan of every page (no serious or critical issues), and checked that every CSS class comes from GOV.UK Frontend. **Problems it found and fixed:** Vite's production build failed on an old Internet Explorer hack in GOV.UK Frontend's CSS. The tests showed that finishing the form sometimes landed on the first question instead of the result, because React Router 7 changes page slightly later than the answers were cleared. A missing newline in `.gitignore` had stopped `node_modules` being ignored. |
| **What You Changed + Why** | *To fill in after review.* **Still to check by hand (Claude couldn't open a browser here):** a keyboard-only run through, a screen reader check of the timeout warning, Lighthouse colour contrast, and the Network tab. **Claude's decisions to review** (listed in `plan.md` → Results): moving focus to the heading on every page change, putting the Back link above `<main>`, the `vite.config.js` CSS setting, and the labels and text the spec didn't fix. |

