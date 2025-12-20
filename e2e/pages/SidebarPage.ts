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
    this.addButton = page.getByRole('button', { name: /^add$/i });
    this.bulkImportButton = page.getByRole('button', { name: /bulk import/i });
    this.listSelector = page.getByRole('button', { name: /default list/i }).first();
    this.nameItems = page.getByRole('listitem');
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
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  async editName(oldName: string, newName: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: oldName });
    const editButton = item.getByRole('button', { name: /edit/i });
    await editButton.click();
    const input = item.getByRole('textbox');
    await input.fill(newName);
    await input.press('Enter');
  }

  async excludeName(name: string) {
    const item = this.page.getByRole('listitem').filter({ hasText: name });
    const excludeButton = item.getByRole('button', { name: /exclude/i });
    await excludeButton.click();
  }

  async getNameCount(): Promise<number> {
    return await this.nameItems.count();
  }
}
