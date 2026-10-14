import { test } from '../fixtures/test';
import boardCases from '../data/board-cases.json';
import type { BoardCase } from '../data/types';

/**
 * Data-driven board verification.
 *
 * Every row of tests/data/board-cases.json becomes its own Playwright test
 * via this single parameterized block (Playwright's documented pattern:
 * https://playwright.dev/docs/test-parameterize#parameterized-tests).
 *
 * Adding Test Case 7 means adding one object to board-cases.json —
 * no new test code, no duplicated login/navigation logic.
 */
const cases = boardCases as BoardCase[];

for (const testCase of cases) {
  test(`${testCase.id}: "${testCase.cardTitle}" is in "${testCase.column}" on ${testCase.project}`, async ({
    authenticatedBoardPage,
  }) => {
    await authenticatedBoardPage.openProject(testCase.project);
    await authenticatedBoardPage.expectCardInColumn(testCase.cardTitle, testCase.column);
    await authenticatedBoardPage.expectCardHasTags(testCase.cardTitle, testCase.column, testCase.tags);
  });
}
