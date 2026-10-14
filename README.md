# Asana Board E2E — Data-Driven Playwright Suite (TypeScript)

End-to-end tests for the Asana-style demo app
(<https://create-asana-like-pr-39y5.bolt.host/>). The suite logs in, opens a
project board, and checks that specific cards sit in the expected column with the
expected tags.

All board scenarios live in one JSON file. A single spec loops over that file
and generates one Playwright test per entry, so adding a test case means adding a
JSON object — no new test code.

---

## Test cases covered

| ID  | Project            | Card                          | Column      | Tags                    |
|-----|--------------------|-------------------------------|-------------|-------------------------|
| TC1 | Web Application    | Implement user authentication | To Do       | Feature, High Priority  |
| TC2 | Web Application    | Fix navigation bug            | To Do       | Bug                     |
| TC3 | Web Application    | Design system updates         | In Progress | Design                  |
| TC4 | Mobile Application | Push notification system      | To Do       | Feature                 |
| TC5 | Mobile Application | Offline mode                  | In Progress | Feature, High Priority  |
| TC6 | Mobile Application | App icon design               | Done        | Design                  |

Plus one standalone login test (`login.spec.ts`).

---

## Project structure

```
asana-board-e2e/
├── tests/
│   ├── data/
│   │   ├── board-cases.json     # The six test cases — edit this to add/change cases
│   │   ├── credentials.json     # Login credentials (admin / password123)
│   │   └── types.ts             # BoardCase and Credentials interfaces
│   ├── pages/
│   │   ├── LoginPage.ts         # Page object: fill username/password, click Sign in
│   │   └── BoardPage.ts         # Page object: open project, find card in column, check tags
│   ├── fixtures/
│   │   └── test.ts              # Custom fixtures, incl. authenticatedBoardPage (logs in first)
│   └── specs/
│       ├── board-cases.spec.ts  # Loops over board-cases.json → one test per row
│       └── login.spec.ts        # Standalone login check
|
└── README.md
```

---

## How it works

```
board-cases.json ──► board-cases.spec.ts ──► authenticatedBoardPage fixture ──► BoardPage / LoginPage ──► Demo app
   (what to test)      (loop: 1 test/row)       (logs in before each test)        (how to interact)
```

1. **Data** — `board-cases.json` holds each case's `id`, `project`, `cardTitle`,
   `column` and `tags`.
2. **Spec** — `board-cases.spec.ts` iterates the array and calls `test()` once per
   row, using Playwright's
   [parameterized tests](https://playwright.dev/docs/test-parameterize#parameterized-tests)
   pattern. Each row becomes its own test with its own name, result and failure
   artifacts.
3. **Fixture** — `authenticatedBoardPage` navigates to the app and logs in with the
   admin credentials before handing the test a `BoardPage`. No spec repeats login code.
4. **Page objects** — each test body does three things:
   - `openProject(project)` — clicks the project in the sidebar and waits for its heading
   - `expectCardInColumn(cardTitle, column)` — finds the card **within** that column,
     which proves placement rather than just existence
   - `expectCardHasTags(cardTitle, column, tags)` — checks every expected tag on that card

---

## Setup

### Prerequisites

- Node.js 18 or newer
- npm

### Required config files

This archive contains the test source only. To run it, the project root also needs
the standard Playwright files below. If you already have them, skip this step.

**`package.json`** — create and install dependencies:

```bash
npm init -y
npm install -D @playwright/test typescript @types/node
npx playwright install chromium
```

**`playwright.config.ts`** — `LoginPage.goto()` navigates to `/`, so `baseURL` must be set:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://create-asana-like-pr-39y5.bolt.host/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

**`tsconfig.json`** — needed because the specs import `.json` files:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["tests", "playwright.config.ts"]
}
```

---

## Running the tests

| Command | What it does |
|---|---|
| `npx playwright test` | Run all 7 tests headless |
| `npx playwright test --headed` | Run with a visible browser |
| `npx playwright test --ui` | Interactive UI mode (step through, time-travel debugging) |
| `npx playwright test -g TC5` | Run a single case by ID |
| `npx playwright test tests/specs/login.spec.ts` | Run only the login test |
| `npx playwright show-report` | Open the HTML report from the last run |
| `npx tsc` | Type-check the project |

Expected result on the live app: **7 passed**.

---

## Adding a test case

Append an object to `tests/data/board-cases.json`:

```json
{
  "id": "TC7",
  "project": "Mobile Application",
  "cardTitle": "Your card title",
  "column": "Done",
  "tags": ["Bug"]
}
```

Run `npx playwright test` — it appears as a new test automatically. No changes to
any `.ts` file are needed.

Field names must match the `BoardCase` interface in `tests/data/types.ts` exactly
(`cardTitle`, not `title`; `tags` must be an array, even for a single tag).

---

## Credentials

Stored in `tests/data/credentials.json`:

| Field    | Value         |
|----------|---------------|
| username | `admin`       |
| password | `password123` |

These are public demo credentials. For a real system, move them to environment
variables rather than committing them.

---

## Locator strategy and DOM assumptions

- **LoginPage** uses accessible locators only — `getByLabel('Username')`,
  `getByLabel('Password')`, `getByRole('button', { name: 'Sign in' })` — so styling
  changes to the login form don't break it.
- **BoardPage** uses accessible locators for the sidebar (`nav` buttons) and the
  project heading (`h1`), but its column and card lookups depend on the app's current
  markup:
  - a column is the nearest ancestor `div` with class `flex-col` above a `main h2`
    containing the column name
  - a card is a `div.bg-white` inside that column containing an `h3` with the exact
    card title

  If the app's layout or CSS classes change, update `cardInColumn()` in
  `tests/pages/BoardPage.ts`. Specs and data stay as they are.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `page.goto: Cannot navigate to invalid URL` | `baseURL` missing from `playwright.config.ts` |
| `Cannot find module '../data/board-cases.json'` | `resolveJsonModule` not enabled in `tsconfig.json` |
| `Executable doesn't exist` | Run `npx playwright install chromium` |
| Card or column not found | Check the JSON spelling, or the app's markup changed — see the section above |

Failed tests keep a screenshot and trace in `test-results/`. Open a trace with:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```
