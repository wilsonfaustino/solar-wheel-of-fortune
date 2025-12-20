import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SidebarPage extends BasePage {
  readonly addNameInput: Locator;
  readonly addButton: Locator;
  readonly bulkImportButton: Locator;
  readonly listSelector: Locator;
  readonly nameItems: Locator;

  constructor(page: Page) {
    super(page);
    this.addNameInput = page.getByPlaceholder(/enter name/i);
    this.addButton = page.getByRole('button', { name: /add name/i });
    this.bulkImportButton = page.getByRole('button', { name: /bulk import/i });
    // List selector button contains "ACTIVE LIST" text
    this.listSelector = page.locator('button:has-text("ACTIVE LIST")').first();
    // Name items are divs containing edit/delete buttons
    this.nameItems = page
      .locator('.group')
      .filter({ has: page.getByRole('button', { name: /edit/i }) });
  }

  async addName(name: string) {
    await this.addNameInput.fill(name);
    await this.addButton.click();
  }

  async bulkImport(names: string[]) {
    await this.bulkImportButton.click();
    const textarea = this.page.getByRole('textbox', { name: /paste names/i });
    await textarea.fill(names.join('\n'));
    const importButton = this.page.getByRole('button', { name: /^import$/i });
    await importButton.click();
  }

  async deleteName(name: string) {
    const item = this.nameItems.filter({ hasText: name });
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  async editName(oldName: string, newName: string) {
    const item = this.nameItems.filter({ hasText: oldName });
    const editButton = item.getByRole('button', { name: /edit/i });
    await editButton.click();
    const input = item.getByRole('textbox');
    await input.fill(newName);
    await input.press('Enter');
  }

  async excludeName(name: string) {
    const item = this.nameItems.filter({ hasText: name });
    const excludeButton = item.getByRole('button', { name: /exclude/i });
    await excludeButton.click();
  }

  async getNameCount(): Promise<number> {
    return await this.nameItems.count();
  }

  // List management methods
  async createList(name: string) {
    await this.listSelector.click();

    // Set up prompt dialog handler before clicking
    this.page.once('dialog', async (dialog) => {
      await dialog.accept(name);
    });

    // Click "CREATE NEW LIST" menu item
    const createItem = this.page.getByText(/create new list/i);
    await createItem.click();

    // Wait for dropdown to close after list creation
    await this.page.waitForTimeout(500);
  }

  async switchToList(listName: string) {
    // If dropdown is stuck open, close it first with Escape
    await this.pressEscape();
    await this.page.waitForTimeout(200);

    await this.listSelector.click();
    const listItem = this.page.getByRole('menuitem').filter({ hasText: listName });
    await listItem.click();
  }

  async deleteList(listName: string) {
    // If dropdown is stuck open, close it first with Escape
    await this.pressEscape();
    await this.page.waitForTimeout(200);

    await this.listSelector.click();
    const listItem = this.page.locator('.group').filter({ hasText: listName });
    // Hover over item to reveal delete button
    await listItem.hover();
    const deleteButton = listItem.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
  }

  async renameList(oldName: string, newName: string) {
    // If dropdown is stuck open, close it first with Escape
    await this.pressEscape();
    await this.page.waitForTimeout(200);

    await this.listSelector.click();
    const listItem = this.page.locator('.group').filter({ hasText: oldName });
    // Hover over item to reveal edit button
    await listItem.hover();
    const editButton = listItem.getByRole('button', { name: /edit/i });
    await editButton.click();
    // Edit inline input
    const input = listItem.getByRole('textbox');
    await input.fill(newName);
    await input.press('Enter');
  }

  async getCurrentListName(): Promise<string | null> {
    return await this.listSelector.textContent();
  }

  // Export modal methods
  async selectExportFormat(format: 'csv' | 'json') {
    const radioButton = this.page.getByRole('radio', {
      name: new RegExp(format, 'i'),
    });
    await radioButton.click();
  }

  async setExportFilename(filename: string) {
    const filenameInput = this.page.getByPlaceholder(/filename/i);
    await filenameInput.fill(filename);
  }

  async clickExportDownload() {
    const downloadButton = this.page.getByRole('button', { name: /download/i });
    await downloadButton.click();
  }

  async closeExportModal() {
    await this.pressEscape();
  }
}
