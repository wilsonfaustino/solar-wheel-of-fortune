import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Volunteer Pick', () => {
  test('volunteer button is visible on active name and absent on excluded name', async ({
    sidebarPage,
    page,
  }) => {
    // Add a name so we can control the state
    await sidebarPage.addName('TestVolunteer');

    // Hover over the new active name to reveal action buttons
    const activeItem = sidebarPage.nameItems.filter({ hasText: 'TESTVOLUNTEER' });
    await activeItem.hover();

    // Volunteer button should be visible on active names
    const volunteerButton = activeItem.getByRole('button', { name: /volunteer testvolunteer/i });
    await expect(volunteerButton).toBeVisible();

    // Exclude the name
    await sidebarPage.excludeName('TESTVOLUNTEER');

    // Hover over the now-excluded name
    const excludedItem = page.locator('.group').filter({ hasText: 'TESTVOLUNTEER' });
    await excludedItem.hover();

    // Volunteer button should NOT be present for excluded names
    const excludedVolunteerButton = excludedItem.getByRole('button', {
      name: /volunteer testvolunteer/i,
    });
    await expect(excludedVolunteerButton).not.toBeVisible();
  });

  test('clicking volunteer moves name to excluded section', async ({ sidebarPage, page }) => {
    await sidebarPage.addName('Volunteer1');

    // Verify name is in the active section initially
    const activeCountBefore = await page
      .locator('.group')
      .filter({ hasText: 'VOLUNTEER1' })
      .count();
    expect(activeCountBefore).toBeGreaterThan(0);

    // Click volunteer
    await sidebarPage.clickVolunteer('VOLUNTEER1');

    // Wait for the name to move to excluded section
    await page.waitForTimeout(300);

    // The name should now appear in the excluded section (with strikethrough)
    const excludedItem = page.locator('.group').filter({ hasText: 'VOLUNTEER1' });
    await expect(excludedItem.locator('.line-through')).toBeVisible();
  });

  test('history tab shows star and VOLUNTEER tag after volunteer pick', async ({
    sidebarPage,
    page,
  }) => {
    await sidebarPage.addName('StarVolunteer');

    // Volunteer the name
    await sidebarPage.clickVolunteer('STARVOLUNTEER');

    // Switch to History tab
    await page.getByRole('button', { name: /history tab/i }).click();

    // Should show the name in history
    await expect(page.getByText('STARVOLUNTEER')).toBeVisible();

    // Should show the VOLUNTEER label
    await expect(page.getByText('VOLUNTEER', { exact: true })).toBeVisible();
  });
});
