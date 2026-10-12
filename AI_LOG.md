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

## Instance 3: XXX

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** |  |
| **What AI Generated** |  |
| **What You Changed + Why** | |

## Instance 4: XXX

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** |  |
| **What AI Generated** |  |
| **What You Changed + Why** | |

## Instance 5: XXX

| Field | Detail |
|-------|--------|
| **Date** | 2026-10-12 |
| **Task** |  |
| **What AI Generated** |  |
| **What You Changed + Why** | |



