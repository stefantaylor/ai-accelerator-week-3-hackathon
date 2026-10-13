# Eligibility Test Cases

## Test Case Format
**Scenario**: [Description]
**Input**: Property Type | Ownership | Income | Insulation | Heating | Prior Grants
**Expected Result**: [Eligible/Ineligible], [Grant Types Available]

---

## Heat Pump Grant Eligibility

### TC-HP-001: Basic Heat Pump Eligible
**Scenario**: Homeowner with gas boiler, no existing insulation, average income
**Input**: Detached | Own outright | £40,000 | None | Gas boiler | None
**Expected Result**: Eligible for heat pump grant

### TC-HP-002: Already Has Heat Pump
**Scenario**: Homeowner already has heat pump installed
**Input**: Semi-detached | Mortgage | £30,000 | Loft insulation | Heat pump | None
**Expected Result**: Ineligible for heat pump grant (already has one)

### TC-HP-003: Renter Without Consent
**Scenario**: Tenant without landlord consent
**Input**: Terraced | Rent (no consent) | £25,000 | Partial insulation | Oil boiler | None
**Expected Result**: Ineligible (ownership status - consent required)

### TC-HP-004: Renter With Consent
**Scenario**: Tenant with landlord consent
**Input**: Flat | Rent (with consent) | £15,000 | None | Electric heating | None
**Expected Result**: Eligible for heat pump grant

### TC-HP-005: High Income Still Eligible
**Scenario**: High-income household
**Input**: Detached | Own outright | £150,000 | Cavity wall insulation | Gas boiler | None
**Expected Result**: Eligible for heat pump grant (lower support level due to income)

### TC-HP-006: Already Received Heat Pump Grant
**Scenario**: Previous heat pump grant recipient
**Input**: Bungalow | Mortgage | £35,000 | Loft insulation | Oil boiler | Heat pump grant
**Expected Result**: Ineligible for heat pump grant (already received this type)

---

## Insulation Grant Eligibility

### TC-IN-001: No Insulation, Eligible
**Scenario**: Property with no existing insulation
**Input**: Semi-detached | Own outright | £28,000 | None | Gas boiler | None
**Expected Result**: Eligible for insulation grant

### TC-IN-002: Has Some Insulation
**Scenario**: Property with partial insulation
**Input**: Terraced | Mortgage | £45,000 | Loft insulation | Gas boiler | None
**Expected Result**: Eligible for insulation grant (can upgrade additional areas)

### TC-IN-003: Already Received Insulation Grant
**Scenario**: Previous insulation grant recipient
**Input**: Detached | Own outright | £32,000 | Cavity wall insulation | Gas boiler | Insulation grant
**Expected Result**: Ineligible for insulation grant (already received this type)

### TC-IN-004: Multiple Insulation Types
**Scenario**: Multiple insulation areas selected
**Input**: Bungalow | Own outright | £20,000 | Loft + Cavity wall + Floor | Oil boiler | None
**Expected Result**: Eligible for insulation grant

### TC-IN-005: Flat With No Insulation
**Scenario**: Flat resident with no insulation
**Input**: Flat | Rent (with consent) | £18,000 | None | Electric heating | None
**Expected Result**: Eligible for insulation grant (with different options than houses)

---

## Ownership & Consent Scenarios

### TC-OWN-001: Shared Ownership - All Parties Agree
**Scenario**: Shared ownership with all parties' consent
**Input**: Semi-detached | Shared ownership (all agree) | £40,000 | None | Gas boiler | None
**Expected Result**: Eligible

### TC-OWN-002: Shared Ownership - Not All Parties Agree
**Scenario**: Shared ownership without all parties' consent
**Input**: Terraced | Shared ownership (no agreement) | £35,000 | Loft insulation | Gas boiler | None
**Expected Result**: Ineligible (requires all parties' agreement)

### TC-OWN-003: Renter - Landlord Consent Obtained
**Scenario**: Tenant with documented landlord consent
**Input**: Flat | Rent (with consent) | £22,000 | None | Oil boiler | None
**Expected Result**: Eligible

### TC-OWN-004: Renter - No Landlord Consent
**Scenario**: Tenant without landlord permission
**Input**: Detached | Rent (no consent) | £25,000 | Cavity wall insulation | Heat pump | None
**Expected Result**: Ineligible (landlord consent required)

---

## Income Band Impact

### TC-INC-001: Lowest Income Band
**Scenario**: Very low income household
**Input**: Terraced | Own outright | £12,570 or less | None | Gas boiler | None
**Expected Result**: Eligible (higher support level due to income)

### TC-INC-002: Low-Mid Income Band
**Scenario**: Low-mid income household
**Input**: Semi-detached | Mortgage | £25,000 | Loft insulation | Oil boiler | None
**Expected Result**: Eligible (standard support level)

### TC-INC-003: Mid-High Income Band
**Scenario**: Mid-high income household
**Input**: Detached | Own outright | £75,000 | None | Gas boiler | None
**Expected Result**: Eligible (reduced support level due to income)

### TC-INC-004: Highest Income Band
**Scenario**: High income household
**Input**: Bungalow | Own outright | £150,000 | Cavity wall insulation | Gas boiler | None
**Expected Result**: Eligible (minimal support level due to income)

---

## Property Type Impact

### TC-PROP-001: Detached House
**Scenario**: Standard detached property
**Input**: Detached | Own outright | £35,000 | None | Gas boiler | None
**Expected Result**: Eligible (full options available)

### TC-PROP-002: Flat - Different Options
**Scenario**: Flat property
**Input**: Flat | Rent (with consent) | £30,000 | None | Gas boiler | None
**Expected Result**: Eligible (limited options due to shared responsibility)

### TC-PROP-003: Bungalow
**Scenario**: Single-story property
**Input**: Bungalow | Own outright | £28,000 | Loft insulation | Oil boiler | None
**Expected Result**: Eligible (full options available)

---

## Combined Complex Scenarios

### TC-COMPLEX-001: Low Income Renter - Multiple Barriers
**Scenario**: Low-income tenant without landlord consent
**Input**: Flat | Rent (no consent) | £15,000 | None | Gas boiler | None
**Expected Result**: Ineligible (lacks ownership consent)

### TC-COMPLEX-002: Shared Ownership - Partial Agreement
**Scenario**: Shared ownership property where not all parties agree
**Input**: Semi-detached | Shared ownership (no agreement) | £32,000 | None | Heat pump | None
**Expected Result**: Ineligible (requires all parties' agreement)

### TC-COMPLEX-003: Eligible for Both Grants
**Scenario**: Homeowner eligible for multiple grant types
**Input**: Detached | Own outright | £40,000 | None | Gas boiler | None
**Expected Result**: Eligible for both heat pump and insulation grants

### TC-COMPLEX-004: Prior Grants Restrict Options
**Scenario**: Previous recipient applying again
**Input**: Terraced | Mortgage | £25,000 | None | Oil boiler | Heat pump grant + Insulation grant
**Expected Result**: Ineligible (already received both grant types)

### TC-COMPLEX-005: Flat Renter Full Eligibility
**Scenario**: Flat renter with all requirements met
**Input**: Flat | Rent (with consent) | £18,000 | Cavity wall insulation | Electric heating | None
**Expected Result**: Eligible for available grants (limited by property type)

---

## Edge Cases

### TC-EDGE-001: Rent Consent Boundary
**Scenario**: Renter status unclear on consent
**Input**: Terraced | Rent (consent unclear) | £28,000 | Loft insulation | Gas boiler | None
**Expected Result**: Cannot proceed (requires clear consent)

### TC-EDGE-002: Income Band Boundary
**Scenario**: Income exactly at band threshold
**Input**: Semi-detached | Own outright | £12,570 | None | Gas boiler | None
**Expected Result**: Eligible (Personal allowance band)

### TC-EDGE-003: Multiple Insulation - All Types
**Scenario**: Maximum insulation selected
**Input**: Detached | Own outright | £50,000 | Loft + Cavity wall + Solid wall + Floor | Gas boiler | None
**Expected Result**: Eligible for insulation grant (assessment for all areas)

### TC-EDGE-004: No Grants Previously - First Time
**Scenario**: Fresh applicant, no history
**Input**: Bungalow | Own outright | £22,000 | None | Oil boiler | None
**Expected Result**: Eligible for all applicable grants
