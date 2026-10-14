import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import type { Credentials } from '../data/types';
import credentials from '../data/credentials.json';

type Fixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  /** Logged-in board page: handles the login flow before the test body runs. */
  authenticatedBoardPage: BoardPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },

  authenticatedBoardPage: async ({ page, loginPage, boardPage }, use) => {
    const adminCredentials = credentials.admin as Credentials;

    await loginPage.goto();
    await loginPage.login(adminCredentials);

    await use(boardPage);
  },
});

export { expect } from '@playwright/test';
