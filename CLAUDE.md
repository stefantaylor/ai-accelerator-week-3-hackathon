# Project context
This is a GOV.UK service. All UI must follow the GOV.UK Design System.
- Use GOV.UK Frontend (the govuk-frontend package) for all styles. Copy each component's HTML from the Design System website. Don't run its JavaScript. No custom classes, colours or CSS.
- One question per page. Continue button, Back link.
- Summary list is a <dl> with govuk-summary-list classes.
- Error summary: role="alert", heading "There is a problem", links to each field in error
- Every input has a <label>. Do not add features we did not ask for
- Make sure to follow government accessibility guidance - https://www.gov.uk/help/accessibility-statement