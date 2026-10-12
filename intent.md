# Intent: Green Home Grant eligibility checker

## Purpose
A prototype GOV.UK service that lets **members of the public check for themselves** whether they can get a Green Home Grant for:
- **Insulation**, and/or
- **A heat pump**

and, if eligible, what **level of support** (percentage of costs) they would get.

The source of truth for the rules is `docs/eligibility-rules.md`. This document records decisions made on top of those rules.

## Users
- **Primary:** citizens self-checking before applying.
- Not for caseworkers in this prototype.

## Design system
The service **must** use the [GOV.UK Design System](https://design-system.service.gov.uk/):
- Styles, components and patterns all come from the **GOV.UK Frontend** package (`govuk-frontend`). We don't hand-write our own versions of GOV.UK styles.
- Every component (header, footer, phase banner, button, radios, checkboxes, error summary, error message, summary list, panel, notification banner, back link, skip link) uses the HTML shown for that component on the Design System website.
- Where the Design System has a pattern for something (question pages, check answers, confirmation pages, error messages), we follow it.
- If we need something the Design System doesn't have, we raise it as an open question rather than making a custom component.

## Question flow
One question per page, each with a Back link and a Continue button, following the GOV.UK Design System (see above and `CLAUDE.md`).

1. **Start page** – service description and "Start now" button.
2. **Prior grants** (checkboxes): "Have you received a Green Home Grant before?"
   - Insulation grant / Heat pump grant / None
   - If **both** grant types already received → go straight to the result page (not eligible). No further questions.
3. **Property type** (radios): Detached, Semi-detached, Terraced, Flat, Bungalow.
4. **Ownership** (radios): Own outright, Mortgage, Shared ownership, Rent.
5. **Consent** (conditional, radios Yes/No) – only shown for:
   - Shared ownership: "Do all owners agree to the work?"
   - Rent: "Do you have your landlord's consent?"
6. **Household income** (radios): Under £12,570, £12,571 – £50,270, £50,271 – £125,140, £125,141+.
7. **Uninsulated parts** (checkboxes): "Which parts of your property are not insulated?" **Skipped** if they've already received an insulation grant, because the answer can't change their result.
   - Loft or roof, Walls, Floor, or All parts are insulated, or I'm not sure.
   - "All parts are insulated" and "I'm not sure" are each exclusive: ticking one clears the other options.
   - The question asks about *parts of the home*, not *types of insulation*. This stops cavity and solid wall being counted as two separate parts, and means people don't tick parts their home doesn't have (for example, a flat with no loft).
   - Replaces the scaffolded radio options on `InsulationPage.jsx`.
8. **Current heating** (radios): Gas boiler, Oil boiler, Electric heating, Heat pump, Other. **Skipped** if they've already received a heat pump grant.
9. **Check your answers** – summary list with Change links.
10. **Result**.

## Eligibility logic
Each grant type is assessed independently.

### Blockers (apply to both grants)
| Condition | Outcome |
|---|---|
| Shared ownership or Rent **and** consent = No | Not eligible for either grant |

### Insulation grant
| Condition | Outcome |
|---|---|
| Already received an insulation grant | Not eligible |
| All parts are insulated | Not eligible |
| I'm not sure | May be eligible. An assessor will check which parts need insulating |
| Otherwise | Eligible – grant covers each part they ticked as not insulated |

### Heat pump grant
| Condition | Outcome |
|---|---|
| Already received a heat pump grant | Not eligible |
| Current heating = Heat pump | Not eligible |
| Otherwise | Eligible |

### Support level (income band)
Income never affects eligibility, only the percentage of costs covered:

| Household income | Support |
|---|---|
| Under £12,570 | 100% |
| £12,571 – £50,270 | 75% |
| £50,271 – £125,140 | 50% |
| £125,141+ | 25% |

### Property type
All property types are treated the same in this prototype, including flats.

## Result page
- Shows the outcome **per grant type** (insulation, heat pump).
- For each eligible grant, shows the support percentage. For insulation, lists the parts covered (or says an assessor will check, if they weren't sure).
- For each ineligible grant, gives the reason (e.g. already received, already has a heat pump, no consent).
- If eligible for at least one grant, the outcome is shown in a green `govuk-panel`. If not eligible for either, it's shown as a normal page heading, with no panel. (GOV.UK Frontend has no grey panel, and the Design System says panels are only for successful outcomes.)
- Next steps shown below the outcome.
- Reaching this page **deletes the user's answers** (see "Keeping answers" below). The result stays on screen, but there's no Back link, because there are no answers left to go back to.

## Keeping answers
Answers are kept in the browser's **sessionStorage** so a page refresh doesn't lose progress. Nothing leaves the browser. Answers are kept for a limited time only, so the next person to use a shared computer can't see them:
- **10-minute limit.** Answers are deleted if the user goes 10 minutes without moving forward in the form. Each time they press Continue (or "Keep my answers"), the 10 minutes start again. Going back or reading a page doesn't reset the timer.
- **Warning first.** After 8 minutes without moving forward, a GOV.UK notification banner warns them that their answers will be deleted in 2 minutes, with a "Keep my answers" button. This is required by the accessibility rules (WCAG 2.2, "Timing adjustable").
- **After deletion**, the user sees a page explaining that their answers were deleted, with a "Start again" button.
- **End of the form.** Answers are deleted as soon as the result page is reached, on both the full journey and the early exit for people who've had both grants.

## In scope
- The question flow and result page above.
- Eligibility logic as a **pure function**, separate from the UI, with **Vitest** unit tests covering every rule above.
- Answers kept in **sessionStorage** with the 10-minute limit, the warning and the deletion at the result page (see "Keeping answers").
- All UI built with **GOV.UK Frontend** (see "Design system").
- Mount the scaffolded `PhaseBanner` (alpha) and `GovukFooter`.
- Fill in the accessibility statement page.
- Validation and GOV.UK error summary on every question page.

## Out of scope (for now)
- Backend, API or database. May be added later if time allows.
- Caseworker / admin views.
- Different support options for flats.
- Fixed £ grant amounts.
- Any feature not listed here (per `CLAUDE.md`).

## Open questions
- Exact wording of the consent questions and result page content.
