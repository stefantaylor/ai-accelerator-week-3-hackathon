# Room 101: Green Home Grant

# Submission Details
## Links
- App: https://app2-lab11138.labs.decoded.com/
- Code: https://github.com/stefantaylor/ai-accelerator-week-3-hackathon

## What's in our submission
```
src/
  pages/          One component per page in the journey
  components/     Shared GOV.UK components (header, footer, radios, checkboxes, error summary)
  eligibility/    The eligibility rules (assessEligibility.js - pure function)
  flow/           Page order and navigation logic (journey.js)
  state/          Storing and validating answers
  content/        Labels for answers
  __tests__/      Unit and component tests
tests/integration/  Playwright end-to-end tests
docs/             Eligibility rules and test cases
AI_LOG.md         AI Interaction Log
intent.md         App Intent
spec.md           App Spec
plan.md           App Plan
```

## Please look at (beyond the MVS)
- We attempted to hit all the "Excellent" goals for the Rubrik
- We implemented Playwright for for integration testing
-- We also implemented Playwright user interface mode to enable UI for Playwright tests
- We created a Welsh language implementation where the user can easily switch between English and Welsh (Welsh language not proofed)
- We also included the lighthouse bash script for accessibility and performance checks

<br>
<br>
***
<br>

# Green Home Grant eligibility checker

A prototype GOV.UK service that lets members of the public check whether they can get a Green Home Grant for **insulation** and/or **a heat pump**, and, if they are eligible, what level of support they would get.

The service follows the [GOV.UK Design System](https://design-system.service.gov.uk/): one question per page, a Back link and Continue button on each page, error summaries, and a "Check your answers" summary before the result.


## How the service works

Users answer these questions, one per page:

1. Have you received a Green Home Grant before?
2. What type of property do you have?
3. What is your ownership status?
4. Consent from other owners or your landlord (only asked for shared ownership or renting)
5. What is your household income?
6. Which parts of your property are not insulated?
7. What is your current heating system?

They then check their answers and see a result for each grant type. Anyone who has already received both grants goes straight to the result after the first question.

## Documentation

- [`docs/eligibility-rules.md`](docs/eligibility-rules.md) – the eligibility rules (source of truth)
- [`docs/eligibility-test-cases.md`](docs/eligibility-test-cases.md) – worked examples of the rules
- [`intent.md`](intent.md) – what the service is for and decisions made on top of the rules
- [`spec.md`](spec.md) – requirements and design
- [`AI_LOG.md`](AI_LOG.md) – log of AI-assisted work on the project

## Prerequisites

- [Node.js](https://nodejs.org/) 22 or later
- npm (installed with Node.js)

Install dependencies from the project folder:

```bash
npm install
```

## Running the application

Start the development server:

```bash
npm run dev
```

The app runs on port **5002** by default. You can change this with the `VITE_PORT` environment variable:

```bash
VITE_PORT=3000 npm run dev
```

To build and preview the production version:

```bash
npm run build
npm run preview
```

## Running the tests

### Unit and component tests

Unit and component tests use [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). They live in `src/__tests__/` and cover the eligibility logic, the journey flow and the answer store.

```bash
npm test             # run once
npm run test:watch   # re-run when files change
```

### End-to-end tests

End-to-end tests use [Playwright](https://playwright.dev/). They live in `tests/integration/` and run against a production build on port 4173, in both desktop and mobile Chrome. Playwright builds and starts the app for you.

The first time, install the Playwright browser:

```bash
npx playwright install chromium
```

Then run the tests:

```bash
npm run test:e2e
```

Playwright writes an HTML report, including a video of each test, to `playwright-report/`. To view it:

```bash
npm run test:e2e:report
```

This serves the report on port 8080.

#### Watching the tests step by step (UI mode)

To run the tests in Playwright's UI mode, where you can watch each test run and see a screenshot of every step:

```bash
npm run test:e2e -- --ui --ui-host=0.0.0.0 --ui-port=8080
```

Then open `https://code-lab<userid>.labs.decoded.com/proxy/8080/` in your browser, replacing `<userid>` with your lab user ID. Choose a test and select the play button to run it. The timeline shows a screenshot for each step.

### Linting

```bash
npm run lint
```

### Accessibility and performance (Lighthouse)

`lighthouse.sh` builds the app, serves it on port 5000 and runs Lighthouse against it, then prints the performance and accessibility scores. Make sure nothing else is using port 5000, then run:

```bash
bash lighthouse.sh
```

## Project structure

```
src/
  pages/          One component per page in the journey
  components/     Shared GOV.UK components (header, footer, radios, checkboxes, error summary)
  eligibility/    The eligibility rules (assessEligibility.js)
  flow/           Page order and navigation logic (journey.js)
  state/          Storing and validating answers
  content/        Labels for answers
  __tests__/      Unit and component tests
tests/integration/  Playwright end-to-end tests
docs/             Eligibility rules and test cases
```
