import {
  Baby,
  Briefcase,
  CalendarOff,
  CircleHelp,
  GraduationCap,
  Plane,
  Stethoscope,
  Thermometer,
} from 'lucide-react';

export const UNAVAILABILITY_ICONS = [
  { id: 'vacation', Icon: Plane, text: 'VACATION' },
  { id: 'sick', Icon: Thermometer, text: 'SICK' },
  { id: 'work-trip', Icon: Briefcase, text: 'WORK TRIP' },
  { id: 'training', Icon: GraduationCap, text: 'TRAINING' },
  { id: 'family', Icon: Baby, text: 'FAMILY' },
  { id: 'appointment', Icon: Stethoscope, text: 'APPOINTMENT' },
  { id: 'pto', Icon: CalendarOff, text: 'PTO' },
  { id: 'other', Icon: CircleHelp, text: 'DUNNO' },
] as const;

export type UnavailabilityIconId = (typeof UNAVAILABILITY_ICONS)[number]['id'];

/** Returns undefined for a missing or unknown id, since room peers can send any string. */
export function getUnavailabilityIcon(iconId?: string) {
  return UNAVAILABILITY_ICONS.find((preset) => preset.id === iconId);
}
