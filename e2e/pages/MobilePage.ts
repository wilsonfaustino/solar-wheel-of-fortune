import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MobilePage extends BasePage {
  readonly menuButton: Locator;
  readonly drawer: Locator;
  readonly drawerCloseButton: Locator;
  readonly drawerOverlay: Locator;

  constructor(page: Page) {
    super(page);
    // Hamburger menu button (only visible on mobile)
    this.menuButton = page.getByRole('button', { name: /menu/i });
    // Drawer dialog
    this.drawer = page.getByRole('dialog', { name: /menu/i });
    // Close button inside drawer
    this.drawerCloseButton = this.drawer.getByRole('button', { name: /close/i });
    // Overlay backdrop
    this.drawerOverlay = page.locator('[data-radix-dialog-overlay]');
  }

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async openDrawer() {
    await this.menuButton.click();
    await this.drawer.waitFor({ state: 'visible' });
  }

  async closeDrawerViaButton() {
    await this.drawerCloseButton.click();
    await this.drawer.waitFor({ state: 'hidden' });
  }

  async closeDrawerViaOverlay() {
    // Click overlay (outside drawer content)
    await this.drawerOverlay.click({ position: { x: 10, y: 10 } });
    await this.drawer.waitFor({ state: 'hidden' });
  }

  async isDrawerVisible(): Promise<boolean> {
    return await this.drawer.isVisible();
  }

  async isMenuButtonVisible(): Promise<boolean> {
    return await this.menuButton.isVisible();
  }
}
