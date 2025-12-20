import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Name Management', () => {
  test('should add single name via form', async ({ sidebarPage, wheelPage }) => {
    // Get initial name count (default list has 12 names)
    const initialCount = await sidebarPage.getNameCount();
    expect(initialCount).toBe(12);

    // Add new name
    await sidebarPage.addName('Alice');

    // Verify name was added
    const newCount = await sidebarPage.getNameCount();
    expect(newCount).toBe(13);

    // Verify name appears in list
    const nameItem = sidebarPage.nameItems.filter({ hasText: 'Alice' });
    await expect(nameItem).toBeVisible();

    // Verify name appears on wheel
    await wheelPage.verifyNamesDisplayed(13);
  });

  test('should bulk import multiple names', async ({ sidebarPage, wheelPage }) => {
    // Initial count: 12 names
    const initialCount = await sidebarPage.getNameCount();
    expect(initialCount).toBe(12);

    // Bulk import 3 names
    const newNames = ['Charlie', 'David', 'Eve'];
    await sidebarPage.bulkImport(newNames);

    // Verify all names were added (12 + 3 = 15)
    const newCount = await sidebarPage.getNameCount();
    expect(newCount).toBe(15);

    // Verify each name appears in list
    for (const name of newNames) {
      const nameItem = sidebarPage.nameItems.filter({ hasText: name });
      await expect(nameItem).toBeVisible();
    }

    // Verify wheel has 15 names
    await wheelPage.verifyNamesDisplayed(15);
  });
});
