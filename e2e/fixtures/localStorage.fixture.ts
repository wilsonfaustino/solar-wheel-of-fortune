import { test as base } from '@playwright/test';
import { HistoryPage, MobilePage, SidebarPage, ThemePage, WheelPage } from '../pages';

type MyFixtures = {
  wheelPage: WheelPage;
  sidebarPage: SidebarPage;
  historyPage: HistoryPage;
  themePage: ThemePage;
  mobilePage: MobilePage;
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

  historyPage: async ({ page }, use) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await use(historyPage);
  },

  themePage: async ({ page }, use) => {
    const themePage = new ThemePage(page);
    await themePage.goto();
    await use(themePage);
  },

  mobilePage: async ({ page }, use) => {
    const mobilePage = new MobilePage(page);
    await mobilePage.goto();
    await use(mobilePage);
  },
});

export { expect } from '@playwright/test';

// Clear localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

// Reset viewport after mobile tests
test.afterEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
});
