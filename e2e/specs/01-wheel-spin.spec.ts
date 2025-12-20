import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Wheel Spin Animation', () => {
  test('should spin wheel on center button click', async ({ wheelPage }) => {
    // Default list has 12 names
    await wheelPage.verifyNamesDisplayed(12);

    // Click center button to spin
    await wheelPage.spin();

    // Verify toast notification appears with selected name
    const selectedName = await wheelPage.getSelectedName();
    expect(selectedName).toBeTruthy();
    expect(selectedName).toMatch(/selected/i);
  });

  test('should spin wheel on Space key press', async ({ wheelPage }) => {
    // Press Space to trigger spin
    await wheelPage.spinViaKeyboard();

    // Verify toast appears
    const toast = wheelPage.page.locator('.toast-container').first();
    await expect(toast).toBeVisible();
  });

  test('should disable button during spin', async ({ wheelPage }) => {
    // Start spin without awaiting completion
    void wheelPage.centerButton.click();

    // Immediately check if button is disabled
    await expect(wheelPage.centerButton).toBeDisabled();

    // Wait for spin to complete
    await wheelPage.waitForSpinComplete();

    // Button should be enabled again
    await expect(wheelPage.centerButton).toBeEnabled();
  });

  test('should show toast notification after spin', async ({ wheelPage }) => {
    await wheelPage.spin();

    // Verify toast is visible
    const toast = wheelPage.page.locator('.toast-container').first();
    await expect(toast).toBeVisible();

    // Verify toast contains "selected" text
    await expect(toast).toContainText(/selected/i);
  });
});
