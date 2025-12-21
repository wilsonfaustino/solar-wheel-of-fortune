import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Theme Switching', () => {
  test('should persist theme across reloads', async ({ page, themePage }) => {
    await themePage.switchToSettingsTab();

    // Select Matrix Green theme
    await themePage.selectTheme('matrix');

    // Verify theme applied
    const themeApplied = await themePage.verifyThemeApplied('matrix');
    expect(themeApplied).toBe(true);

    // Reload page
    await page.reload();

    // Switch to Settings tab again
    await themePage.switchToSettingsTab();

    // Verify Matrix Green still selected
    const isMatrixChecked = await themePage.isThemeChecked('matrix');
    expect(isMatrixChecked).toBe(true);

    // Verify theme still applied
    const themeStillApplied = await themePage.verifyThemeApplied('matrix');
    expect(themeStillApplied).toBe(true);
  });

  test('should change visual appearance', async ({ themePage }) => {
    await themePage.switchToSettingsTab();

    // Verify default theme is cyan
    const defaultTheme = await themePage.getCurrentTheme();
    expect(defaultTheme).toBe('cyan');

    const isCyanChecked = await themePage.isThemeChecked('cyan');
    expect(isCyanChecked).toBe(true);

    // Select Sunset Orange theme
    await themePage.selectTheme('sunset');

    // Verify theme changed to sunset
    const newTheme = await themePage.getCurrentTheme();
    expect(newTheme).toBe('sunset');

    // Verify RadioGroup shows Sunset as checked
    const isSunsetChecked = await themePage.isThemeChecked('sunset');
    expect(isSunsetChecked).toBe(true);
  });
});
