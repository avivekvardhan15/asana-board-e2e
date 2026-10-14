import { test, expect } from '../fixtures/test';
import credentials from '../data/credentials.json';
import type { Credentials } from '../data/types';

test.describe('Login', () => {
  test('logs in to the Demo App with valid admin credentials', async ({ page, loginPage }) => {
    const adminCredentials = credentials.admin as Credentials;

    await loginPage.goto();
    await loginPage.login(adminCredentials);

    // A successful login lands on the default "Web Application" board.
    await expect(page.getByRole('heading', { level: 1, name: 'Web Application' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});
