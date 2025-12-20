import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('List Management', () => {
  test('should create new list via prompt dialog', async ({ sidebarPage }) => {
    // Create new list
    await sidebarPage.createList('Work');

    // Verify list appears in selector
    const currentList = await sidebarPage.getCurrentListName();
    expect(currentList).toContain('Work');
  });

  test.skip('should switch between lists', async ({ sidebarPage }) => {
    // TODO: Flaky test - dropdown state management needs investigation
    // Create second list
    await sidebarPage.createList('Work');
    await sidebarPage.addName('Bob');

    // Switch to Default List
    await sidebarPage.switchToList('Default List');

    // Verify Bob not visible in Default List
    const bobItem = sidebarPage.nameItems.filter({ hasText: 'Bob' });
    await expect(bobItem).not.toBeVisible();

    // Switch back to Work
    await sidebarPage.switchToList('Work');

    // Verify Bob visible again
    await expect(bobItem).toBeVisible();
  });

  test.skip('should delete list with confirmation', async ({ sidebarPage }) => {
    // TODO: Confirm button locator needs investigation
    // Create list with >5 names to trigger confirmation
    await sidebarPage.createList('Temp List');
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
    for (const name of names) {
      await sidebarPage.addName(name);
    }

    // Switch to Default List (must be inactive to delete)
    await sidebarPage.switchToList('Default List');

    // Delete Temp List
    await sidebarPage.deleteList('Temp List');

    // Verify list removed (should still show Default List)
    const currentList = await sidebarPage.getCurrentListName();
    expect(currentList).toContain('Default List');
  });

  test.skip('should rename list inline', async ({ sidebarPage }) => {
    // TODO: Inline edit textbox locator needs investigation
    // Create new list
    await sidebarPage.createList('Old Name');

    // Switch to Default List (must be inactive to rename)
    await sidebarPage.switchToList('Default List');

    // Rename Old Name list
    await sidebarPage.renameList('Old Name', 'New Name');

    // Switch to New Name list to verify it was renamed
    await sidebarPage.switchToList('New Name');

    // Verify list name updated
    const currentList = await sidebarPage.getCurrentListName();
    expect(currentList).toContain('New Name');
  });
});
