import { type Browser, expect, test } from '@playwright/test';
import { SidebarPage, WheelPage } from '../pages';

/** Each browser context has its own localStorage, like two people on two machines. */
async function openApp(browser: Browser, path = '/') {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  await page.goto(path);
  await page.getByRole('button', { name: 'IMPORT', exact: true }).waitFor();
  return page;
}

test.describe('Live room', () => {
  // ponytail: runs against the real Supabase project from .env.local and leaves one room row per run
  test('syncs edits and selections between two browsers', async ({ browser }) => {
    const hostPage = await openApp(browser);
    const shareLiveButton = hostPage.getByRole('button', { name: /share live/i });
    test.skip(!(await shareLiveButton.isVisible()), 'Needs VITE_SUPABASE_* in .env.local');

    await shareLiveButton.click();
    await expect(hostPage.getByText(/LIVE ROOM/)).toBeVisible();
    const roomHash = new URL(hostPage.url()).hash;
    expect(roomHash).toMatch(/^#[0-9a-f-]{36}$/);

    const guestPage = await openApp(browser, `/${roomHash}`);
    await expect(guestPage.getByText(/LIVE ROOM/)).toBeVisible();

    const hostSidebar = new SidebarPage(hostPage);
    const guestSidebar = new SidebarPage(guestPage);

    await hostSidebar.addName('FROMHOST');
    await expect(guestSidebar.nameItems.filter({ hasText: 'FROMHOST' })).toBeVisible();

    await guestSidebar.addName('FROMGUEST');
    await expect(hostSidebar.nameItems.filter({ hasText: 'FROMGUEST' })).toBeVisible();

    await new WheelPage(hostPage).centerButton.click();
    await expect(guestPage.locator('[data-sonner-toast]')).toContainText('SELECTED');

    await hostPage.context().close();
    await guestPage.context().close();
  });
});
