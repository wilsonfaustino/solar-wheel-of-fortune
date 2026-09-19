export interface Name {
  id: string;
  value: string;
  weight: number;
  createdAt: Date;
  lastSelectedAt: Date | null;
  selectionCount: number;
  isExcluded: boolean;
  categoryId: string | null;
}

export interface NameList {
  id: string;
  title: string;
  description?: string;
  names: Name[];
  cycles?: Cycle[];
  events?: SpecialEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export type SelectionMethod = 'wheel' | 'volunteer';

export interface SelectionRecord {
  id: string;
  nameId: string;
  nameValue: string;
  listId: string;
  timestamp: Date;
  sessionId: string;
  spinDuration: number;
  selectionMethod?: SelectionMethod;
}

/** Dates are ISO day strings (YYYY-MM-DD) to avoid timezone drift and Date rehydration. */
export interface Cycle {
  id: string;
  name: string;
  start: string;
  end: string;
  cooldownWeeks: number;
}

export type CyclePhase = 'cycle' | 'cooldown';

export interface CycleStatus {
  cycle: Cycle;
  phase: CyclePhase;
  dayOfPhase: number;
  totalPhaseDays: number;
  percentComplete: number;
  weekOfCycle: number;
  totalCycleWeeks: number;
  /** Weekday-only axis: weekends take no space on the cycle timeline. */
  weekdayOfCycle: number;
  totalCycleWeekdays: number;
  /** Weekdays in each calendar week the cycle covers; first and last may be short. */
  weekdaysPerWeek: number[];
  cooldownWeekdays: number;
  daysToCooldownStart: number;
  daysToCycleEnd: number;
  nextCycle: { cycle: Cycle; daysUntilStart: number } | null;
}

/** A dated highlight (launch, demo day, holiday) rendered over the cycle timeline. */
export interface SpecialEvent {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface EventCountdown {
  event: SpecialEvent;
  isActive: boolean;
  daysUntilStart: number;
  daysRemaining: number;
}

export interface EventOverlap {
  event: SpecialEvent;
  leftPercent: number;
  widthPercent: number;
  clipped: boolean;
}
