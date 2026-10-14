import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page object for the Kanban project board screen (sidebar + columns).
 * Exposes application-level operations ("open this project", "find this
 * card") rather than raw selectors, so specs read as behavior.
 */
export class BoardPage {
  private readonly sidebar: Locator;

  constructor(private readonly page: Page) {
    this.sidebar = page.locator('nav');
  }

  /** Switch the active board via the left-hand project navigation. */
  async openProject(projectName: string): Promise<void> {
    await this.sidebar.getByRole('button', { name: projectName }).click();
    // Project name appears as the page heading once the board has swapped.
    await expect(
      this.page.getByRole('heading', { level: 1, name: projectName }),
    ).toBeVisible();
  }

  /**
   * Locate a card by its exact title, scoped to the given column.
   * Scoping to the column is what actually proves "card X is in column Y";
   * a bare title search anywhere on the page would not verify placement.
   */
  private cardInColumn(columnName: string, cardTitle: string): Locator {
    const column = this.page
      .locator('main h2', { hasText: columnName })
      .locator('xpath=ancestor::div[contains(@class, "flex-col")][1]');

    return column.locator('div.bg-white', {
      has: this.page.getByRole('heading', { level: 3, name: cardTitle, exact: true }),
    });
  }

  /** Assert that a card with this exact title is present in this column. */
  async expectCardInColumn(cardTitle: string, columnName: string): Promise<void> {
    await expect(this.cardInColumn(columnName, cardTitle)).toBeVisible();
  }

  /** Assert that a card carries every one of the given tag labels. */
  async expectCardHasTags(cardTitle: string, columnName: string, tags: string[]): Promise<void> {
    const card = this.cardInColumn(columnName, cardTitle);
    for (const tag of tags) {
      await expect(card.getByText(tag, { exact: true })).toBeVisible();
    }
  }
}
