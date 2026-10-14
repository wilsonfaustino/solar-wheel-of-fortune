import { getUnavailabilityIcon, UNAVAILABILITY_ICONS } from './unavailability';

describe('getUnavailabilityIcon', () => {
  it.each(
    UNAVAILABILITY_ICONS.map((preset) => [preset.id, preset.text])
  )('finds preset %s', (iconId, text) => {
    expect(getUnavailabilityIcon(iconId)?.text).toBe(text);
  });

  it('includes the pto preset', () => {
    expect(getUnavailabilityIcon('pto')?.text).toBe('PTO');
  });

  it('returns undefined for an unknown id', () => {
    expect(getUnavailabilityIcon('teleport')).toBeUndefined();
  });

  it('returns undefined when no id is given', () => {
    expect(getUnavailabilityIcon()).toBeUndefined();
  });
});
