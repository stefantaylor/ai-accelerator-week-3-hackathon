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

## Question flow
One question per page, each with a Back link and a Continue button, following the GOV.UK Design System (see `CLAUDE.md`).

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
7. **Existing insulation** (checkboxes): Loft, Cavity wall, Solid wall, Floor, None of the above.
   - Replaces the scaffolded radio options on `InsulationPage.jsx`.
8. **Current heating** (radios): Gas boiler, Oil boiler, Electric heating, Heat pump, Other.
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
| Already has all four insulation types (loft, cavity wall, solid wall, floor) | Not eligible |
| Otherwise | Eligible – grant covers each insulation type they do **not** already have |

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
- For each eligible grant, shows the support percentage. For insulation, lists the types covered.
- For each ineligible grant, gives the reason (e.g. already received, already has a heat pump, no consent).
- Uses a `govuk-panel`: green if eligible for at least one grant, otherwise grey/not eligible.
- Next steps shown below the panel.

## In scope
- The question flow and result page above.
- Eligibility logic as a **pure function**, separate from the UI, with **Vitest** unit tests covering every rule above.
- Answers kept in **sessionStorage** so a page refresh does not lose progress. Nothing leaves the browser.
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
- Whether to skip the insulation or heating question when the user has already received that grant type (currently: still asked).
