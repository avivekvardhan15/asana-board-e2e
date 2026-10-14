import { type Locator, type Page } from '@playwright/test';
import type { Credentials } from '../data/types';

/**
 * Page object for the "Project Board Login" screen.
 * Owns only login-page UI vocabulary; it does not assert on the
 * outcome of login — that is the caller's/spec's responsibility.
 */
export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.signInButton.click();
  }
}
