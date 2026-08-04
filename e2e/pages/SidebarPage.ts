import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SidebarPage extends BasePage {
  readonly addNameInput: Locator;
  readonly addButton: Locator;
  readonly bulkImportButton: Locator;
  readonly listSelector: Locator;
  readonly listMenu: Locator;
  readonly nameItems: Locator;

  constructor(page: Page) {
    super(page);
    this.addNameInput = page.getByPlaceholder(/enter name/i);
    this.addButton = page.getByRole('button', { name: /add name/i });
    this.bulkImportButton = page.getByRole('button', { name: /bulk import/i });
    // List selector button contains "ACTIVE LIST" text
    this.listSelector = page.locator('button:has-text("ACTIVE LIST")').first();
    this.listMenu = page.getByRole('menu');
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

  async clickVolunteer(name: string) {
    const item = this.nameItems.filter({ hasText: name });
    await item.hover();
    const volunteerButton = item.getByRole('button', {
      name: new RegExp(`volunteer ${name}`, 'i'),
    });
    await volunteerButton.click();
  }

  async getNameCount(): Promise<number> {
    return await this.nameItems.count();
  }

  // List management methods

  // List items call preventDefault on onSelect, so the dropdown stays open after
  // acting on one. Every list method opens and closes it explicitly instead.
  private async openListMenu() {
    if ((await this.listSelector.getAttribute('data-state')) !== 'open') {
      await this.listSelector.click();
    }
    await this.listMenu.waitFor({ state: 'visible' });
  }

  private async closeListMenu() {
    if (await this.listMenu.isVisible()) {
      await this.pressEscape();
      await this.listMenu.waitFor({ state: 'hidden' });
    }
  }

  private listItem(listName: string): Locator {
    return this.listMenu.getByRole('menuitem').filter({ hasText: listName });
  }

  async createList(name: string) {
    await this.openListMenu();
    await this.listMenu.getByRole('menuitem', { name: /create new list/i }).click();

    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel('List name').fill(name);
    await dialog.getByRole('button', { name: 'CREATE' }).click();
    await dialog.waitFor({ state: 'hidden' });
    await this.closeListMenu();
  }

  async switchToList(listName: string) {
    await this.openListMenu();
    // The first button in the row selects the list; edit and delete follow it
    await this.listItem(listName).locator('button').first().click();
    await this.closeListMenu();
  }

  // Assumes the list holds at least one name, which is the only case that
  // opens a confirmation. Deleting an empty list is immediate.
  async deleteList(listName: string) {
    await this.openListMenu();
    const item = this.listItem(listName);
    await item.hover();
    await item.getByRole('button', { name: `Delete ${listName}` }).click();

    const confirmDialog = this.page.getByRole('alertdialog');
    await confirmDialog.getByRole('button', { name: 'Delete' }).click();
    await confirmDialog.waitFor({ state: 'hidden' });
    await this.closeListMenu();
  }

  async renameList(oldName: string, newName: string) {
    await this.openListMenu();
    const item = this.listItem(oldName);
    await item.hover();
    await item.getByRole('button', { name: `Edit ${oldName}` }).click();

    // Edit mode swaps the menu item out for an input, so scope to the menu
    const input = this.listMenu.getByRole('textbox');
    await input.fill(newName);
    await input.press('Enter');
    await this.closeListMenu();
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
