import { test as base } from '@playwright/test';
import { SidebarPage } from '../pages/SidebarPage';
import { WheelPage } from '../pages/WheelPage';

type MyFixtures = {
  wheelPage: WheelPage;
  sidebarPage: SidebarPage;
};

export const test = base.extend<MyFixtures>({
  wheelPage: async ({ page }, use) => {
    const wheelPage = new WheelPage(page);
    await wheelPage.goto();
    await use(wheelPage);
  },

  sidebarPage: async ({ page }, use) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.goto();
    await use(sidebarPage);
  },
});

export { expect } from '@playwright/test';

// Clear localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
