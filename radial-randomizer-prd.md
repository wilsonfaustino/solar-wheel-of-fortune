# Product Requirements Document: Radial Name Randomizer

> **Last Updated**: Session 2 (Name Management Sidebar Complete)
> **Current Implementation Status**: MVP 70% Complete - Core wheel & name management done
> **Next Focus**: Keyboard shortcuts, testing (Vitest), selection history, export

## 1. Product Overview

### 1.1 Vision
Create a visually stunning, highly functional name randomizer application with a distinctive radial interface that serves educators, team leaders, event organizers, and anyone needing fair, transparent random selection with style.

### 1.2 Success Metrics
- User engagement: Average session duration > 5 minutes
- Utility: 80% of users create custom name lists
- Retention: 40% of users return within 7 days
- Performance: Smooth 60fps animations on mid-range devices
- Accessibility: WCAG 2.1 AA compliance

### 1.3 Target Audience
- **Primary**: Teachers conducting classroom activities
- **Secondary**: Team leads running standups/retros
- **Tertiary**: Event organizers, game masters, content creators

---

## 2. Core Features

### 2.1 Name Management System

#### 2.1.1 Basic Operations
**Priority**: P0 (MVP)

**User Stories**
- As a user, I want to add names one at a time so I can build my list incrementally
- As a user, I want to edit existing names so I can fix typos without recreating the list
- As a user, I want to delete names so I can remove people who are absent
- As a user, I want to see a count of total names so I know my list size

**Acceptance Criteria**
- [ ] Add name via input field with Enter key or button click
- [ ] Edit name inline with click-to-edit interaction
- [ ] Delete name with confirmation dialog for lists > 10 items
- [ ] Display live count: "15 names in rotation"
- [ ] Validate: no empty names, max 100 characters per name
- [ ] Duplicate name warning with option to add anyway

**Technical Specifications**
```typescript
interface Name {
  id: string; // UUID
  value: string;
  weight: number; // default 1.0
  createdAt: Date;
  lastSelectedAt: Date | null;
  selectionCount: number;
  isExcluded: boolean;
  categoryId: string | null;
}

interface NameList {
  id: string;
  title: string;
  names: Name[];
  createdAt: Date;
  updatedAt: Date;
  settings: ListSettings;
}
```

**UI Components**
- `NameInput`: Text field with add button
- `NameListPanel`: Scrollable list with edit/delete actions
- `NameItem`: Individual name row with controls

---

#### 2.1.2 Bulk Import/Export
**Priority**: P0 (MVP)

**User Stories**
- As a user, I want to paste a list of names so I can quickly populate the randomizer
- As a user, I want to import from CSV/JSON so I can reuse existing data
- As a user, I want to export my list so I can share it with others

**Acceptance Criteria**
- [ ] Textarea for bulk paste (one name per line)
- [ ] Parse and trim whitespace automatically
- [ ] Skip empty lines during import
- [ ] Support CSV import with format: `name,weight,category`
- [ ] Export to JSON with full metadata
- [ ] Export to CSV with simplified format
- [ ] Download file with timestamp: `names-2024-12-08.csv`

**Import Formats**
```csv
// CSV Format
Name,Weight,Category
Alice,1.0,Team A
Bob,1.5,Team A
Charlie,1.0,Team B
```

```json
// JSON Format
{
  "version": "1.0",
  "title": "My Team",
  "names": [
    {
      "id": "uuid-1",
      "value": "Alice",
      "weight": 1.0,
      "categoryId": "team-a"
    }
  ]
}
```

**UI Components**
- `BulkImportModal`: Multi-step wizard for importing
- `ExportMenu`: Dropdown with format options

---

#### 2.1.3 List Presets
**Priority**: P1 (Post-MVP)

**User Stories**
- As a user, I want to load preset lists so I can get started quickly
- As a user, I want to save my list as a preset so I can reuse it later
- As a user, I want to switch between multiple lists so I can use the tool for different contexts

**Acceptance Criteria**
- [ ] Built-in presets: Common Names (50), Countries (195), Colors (20), Numbers (1-100)
- [ ] Save current list with custom name
- [ ] Quick-switch dropdown for saved lists
- [ ] Duplicate preset to create custom version
- [ ] Delete custom presets (not built-ins)
- [ ] Max 20 custom presets per user

**Data Structure**
```typescript
interface Preset {
  id: string;
  title: string;
  description?: string;
  isBuiltIn: boolean;
  nameList: NameList;
  thumbnail?: string; // Base64 preview image
}
```

**UI Components**
- `PresetGallery`: Grid of preset cards
- `PresetCard`: Preview with name count and quick-load button
- `SavePresetModal`: Form for naming and describing preset

---

### 2.2 Randomization Engine

#### 2.2.1 Core Randomization
**Priority**: P0 (MVP)

**User Stories**
- As a user, I want truly random selection so results are fair
- As a user, I want visual feedback during selection so I know the system is working
- As a user, I want to see the selected name clearly so there's no ambiguity

**Acceptance Criteria**
- [ ] Use cryptographically secure random (Web Crypto API)
- [ ] Fallback to Math.random() if crypto unavailable
- [ ] Spin animation duration: 2-4 seconds (configurable)
- [ ] Easing: cubic-bezier for deceleration feel
- [ ] Final selection highlighted with glow effect
- [ ] Prevent spinning while already in progress
- [ ] Sound effect on completion (optional, off by default)

**Algorithm**
```typescript
function selectRandom(names: Name[], excludeRecent: boolean = false): Name {
  // Filter excluded names
  let pool = names.filter(n => !n.isExcluded);
  
  // Optionally exclude recently selected
  if (excludeRecent) {
    const recentThreshold = Date.now() - (5 * 60 * 1000); // 5 min
    pool = pool.filter(n => 
      !n.lastSelectedAt || n.lastSelectedAt.getTime() < recentThreshold
    );
  }
  
  // Apply weights
  const totalWeight = pool.reduce((sum, n) => sum + n.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const name of pool) {
    random -= name.weight;
    if (random <= 0) return name;
  }
  
  return pool[0]; // Fallback
}
```

**Performance Requirements**
- Selection calculation: < 5ms for 1000 names
- Animation: 60fps throughout spin
- No jank on mobile devices

---

#### 2.2.2 Weighted Randomization
**Priority**: P1 (Post-MVP)

**User Stories**
- As a user, I want to adjust selection probability so I can favor certain names
- As a user, I want visual indicators of weights so I understand the odds
- As a user, I want to quickly set common weight presets (0.5x, 1x, 2x)

**Acceptance Criteria**
- [ ] Weight range: 0.1 to 5.0
- [ ] Default weight: 1.0
- [ ] Visual indicator: line thickness or color intensity
- [ ] Quick-set buttons: 50%, 100%, 150%, 200%
- [ ] Display effective probability percentage
- [ ] Preserve weights through export/import

**UI Components**
- `WeightSlider`: Range input with visual preview
- `WeightPresets`: Button group for common values
- `ProbabilityDisplay`: Shows calculated odds (e.g., "15.3% chance")

**Visual Mapping**
```typescript
// Map weight to visual properties
function getVisualWeight(weight: number) {
  return {
    lineWidth: 0.5 + (weight * 0.5), // 0.5px to 3px
    opacity: 0.3 + (weight * 0.2),   // 0.3 to 1.0
    fontSize: 13 + (weight * 3)       // 13px to 28px
  };
}
```

---

#### 2.2.3 Fair Mode
**Priority**: P1 (Post-MVP)

**User Stories**
- As a teacher, I want to ensure everyone gets picked eventually so no student is left out
- As a user, I want to see who hasn't been picked recently so I can ensure fairness
- As a user, I want automatic exclusion after selection so people don't get picked twice in a row

**Acceptance Criteria**
- [ ] Toggle "Fair Mode" in settings
- [ ] When enabled, track selection timestamps
- [ ] Visual indicator for "not picked recently" (> 1 hour)
- [ ] Option: auto-exclude last N selections (configurable 1-5)
- [ ] Display time since last picked on hover
- [ ] Reset all timestamps button

**Fairness Algorithm**
```typescript
interface FairModeSettings {
  enabled: boolean;
  excludeLastN: number; // 0-5
  timeWindow: number; // milliseconds
  boostUnpickedWeight: boolean;
  boostMultiplier: number; // 1.5x - 3x
}

function applyFairMode(name: Name, settings: FairModeSettings): number {
  if (!settings.enabled) return name.weight;
  
  const timeSincePicked = name.lastSelectedAt 
    ? Date.now() - name.lastSelectedAt.getTime()
    : Infinity;
  
  if (timeSincePicked > settings.timeWindow && settings.boostUnpickedWeight) {
    return name.weight * settings.boostMultiplier;
  }
  
  return name.weight;
}
```

---

### 2.3 History & Analytics

#### 2.3.1 Selection History
**Priority**: P0 (MVP)

**User Stories**
- As a user, I want to see past selections so I can review what happened
- As a user, I want to export history so I can keep records
- As a user, I want to clear history so I can start fresh

**Acceptance Criteria**
- [ ] Log each selection with timestamp
- [ ] Display last 50 selections in sidebar
- [ ] Show: name, timestamp, context (list name)
- [ ] Export history as CSV with all metadata
- [ ] Clear history with confirmation
- [ ] Search/filter history by name or date range

**Data Structure**
```typescript
interface SelectionRecord {
  id: string;
  nameId: string;
  nameValue: string; // Snapshot in case name changes
  listId: string;
  timestamp: Date;
  sessionId: string; // Group selections from same session
  spinDuration: number; // Milliseconds
}
```

**UI Components**
- `HistoryPanel`: Scrollable timeline of selections
- `HistoryItem`: Single record with timestamp and name
- `HistoryFilters`: Date range and name search
- `HistoryExport`: Download button with format options

---

#### 2.3.2 Analytics Dashboard
**Priority**: P2 (Future)

**User Stories**
- As a user, I want to see selection frequency so I can verify fairness
- As a user, I want visual charts so I can understand patterns
- As a user, I want to identify "lucky" or "unlucky" participants

**Acceptance Criteria**
- [ ] Bar chart: selection count per name
- [ ] Timeline: selections over time
- [ ] Statistics: mean, median, mode, std dev
- [ ] Highlight: most/least picked names
- [ ] Streaks: longest time without selection
- [ ] Chi-square test for fairness (p-value display)

**Charts to Implement**
1. **Frequency Bar Chart**: Horizontal bars showing selection counts
2. **Timeline**: Date on X-axis, selections as points
3. **Heatmap**: Day of week vs. hour of day
4. **Distribution Curve**: Expected vs. actual distribution

**UI Components**
- `AnalyticsDashboard`: Full-screen overlay with charts
- `FrequencyChart`: Recharts bar chart
- `FairnessScore`: Statistical summary card
- `StreakTracker`: List of longest gaps

---

### 2.4 Visual Customization

#### 2.4.1 Theme System
**Priority**: P1 (Post-MVP)

**User Stories**
- As a user, I want to choose color schemes so the app matches my preferences
- As a user, I want to preview themes before applying so I can see how they look
- As a user, I want to create custom themes so I can match my brand

**Acceptance Criteria**
- [ ] 5 built-in themes: Default (cyan), Matrix (green), Sunset (orange/pink), Arctic (blue), Neon (purple)
- [ ] Theme affects: circle color, selected glow, text accent, button borders
- [ ] Live preview on theme selection
- [ ] Custom theme editor with color pickers
- [ ] Save up to 3 custom themes
- [ ] Export/import theme JSON

**Theme Structure**
```typescript
interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;      // #000000
    circle: string;          // rgba(255,255,255,0.15)
    circleLine: string;      // rgba(255,255,255,0.12)
    text: string;            // #ffffff
    textMuted: string;       // rgba(255,255,255,0.5)
    accent: string;          // #00ffff
    accentGlow: string;      // rgba(0,255,255,0.8)
    selected: string;        // #00ffff
    selectedGlow: string;    // rgba(0,255,255,0.8)
    button: string;          // rgba(255,255,255,0.2)
    buttonHover: string;     // rgba(255,255,255,0.4)
  };
  fonts: {
    primary: string;         // 'Courier New', monospace
    weight: {
      normal: number;        // 300
      selected: number;      // 600
    };
  };
}
```

**Built-in Themes**
```typescript
const themes: Record<string, Theme> = {
  default: {
    name: "Cyan Pulse",
    colors: { accent: "#00ffff", accentGlow: "rgba(0,255,255,0.8)" }
  },
  matrix: {
    name: "Matrix",
    colors: { accent: "#00ff00", accentGlow: "rgba(0,255,0,0.8)" }
  },
  sunset: {
    name: "Sunset",
    colors: { accent: "#ff6b35", accentGlow: "rgba(255,107,53,0.8)" }
  },
  arctic: {
    name: "Arctic",
    colors: { accent: "#4d9fff", accentGlow: "rgba(77,159,255,0.8)" }
  },
  neon: {
    name: "Neon Purple",
    colors: { accent: "#b967ff", accentGlow: "rgba(185,103,255,0.8)" }
  }
};
```

**UI Components**
- `ThemeSelector`: Grid of theme preview cards
- `ThemePreview`: Miniature radial view with theme applied
- `CustomThemeEditor`: Color picker panel
- `ThemeExportImport`: JSON upload/download

---

#### 2.4.2 Animation Settings
**Priority**: P1 (Post-MVP)

**User Stories**
- As a user, I want to adjust spin speed so I can control pacing
- As a user, I want to choose easing functions so animations feel different
- As a user, I want to disable animations so I can get instant results

**Acceptance Criteria**
- [ ] Spin duration: 1s to 5s (slider)
- [ ] Easing presets: Linear, Ease-out, Bounce, Elastic
- [ ] Sound effects toggle with volume slider
- [ ] Particle effects toggle (confetti on selection)
- [ ] Reduced motion mode (respects prefers-reduced-motion)
- [ ] Preview animation button

**Animation Presets**
```typescript
const easingFunctions = {
  linear: "linear",
  easeOut: "cubic-bezier(0.17, 0.67, 0.3, 0.98)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)"
};

interface AnimationSettings {
  duration: number;        // 1000-5000ms
  easing: keyof typeof easingFunctions;
  enableSound: boolean;
  soundVolume: number;     // 0-1
  enableParticles: boolean;
  particleCount: number;   // 10-100
  respectReducedMotion: boolean;
}
```

**Sound Effects**
- Spin start: Whoosh sound (0.5s)
- Spinning: Ticking sound (looped)
- Selection: Bell/ding sound (0.3s)
- All sounds: royalty-free, < 50KB each

---

#### 2.4.3 Layout Options
**Priority**: P2 (Future)

**User Stories**
- As a user, I want to adjust circle size so it fits my screen better
- As a user, I want to change label positioning so text is more readable
- As a user, I want to toggle UI elements so I can focus on the wheel

**Acceptance Criteria**
- [ ] Circle radius: 80px to 400px (auto-scales based on name count)
- [ ] Label distance: 0px (touching circle) to 100px
- [ ] Font size: 10px to 24px
- [ ] Toggle sidebar visibility
- [ ] Toggle instruction text
- [ ] Fullscreen mode
- [ ] Presentation mode (hides controls, keyboard-only)

---

### 2.5 Categories & Groups

#### 2.5.1 Category Management
**Priority**: P1 (Post-MVP)

**User Stories**
- As a user, I want to organize names into categories so I can manage subgroups
- As a user, I want to color-code categories so I can identify them visually
- As a user, I want to filter by category so I can randomize within subgroups

**Acceptance Criteria**
- [ ] Create categories with name and color
- [ ] Assign names to categories via dropdown or drag-drop
- [ ] Visual indicator: colored dot or border on wheel
- [ ] Filter: "Pick from Category X only"
- [ ] Multi-select: "Pick from Categories X and Y"
- [ ] Default "Uncategorized" category

**Data Structure**
```typescript
interface Category {
  id: string;
  name: string;
  color: string; // Hex color
  icon?: string; // Emoji or icon name
  description?: string;
}
```

**UI Components**
- `CategoryManager`: Panel for creating/editing categories
- `CategoryBadge`: Color-coded label on name items
- `CategoryFilter`: Multi-select dropdown

---

#### 2.5.2 Multi-Selection Mode
**Priority**: P2 (Future)

**User Stories**
- As a user, I want to pick multiple names at once so I can form teams
- As a user, I want to ensure no duplicates in multi-selection
- As a user, I want to see all selected names clearly

**Acceptance Criteria**
- [ ] Input: "Select N names" (1-10)
- [ ] Sequential animation: pick one, pause, pick next
- [ ] All selections highlighted simultaneously
- [ ] Display selected names in results panel
- [ ] Option: "Pick one from each category"
- [ ] Export multi-selection results

**Algorithm**
```typescript
async function selectMultiple(
  count: number, 
  allowDuplicates: boolean = false
): Promise<Name[]> {
  const selected: Name[] = [];
  const pool = allowDuplicates 
    ? [...names] 
    : [...names];
  
  for (let i = 0; i < count && pool.length > 0; i++) {
    const name = await selectRandomWithAnimation(pool);
    selected.push(name);
    
    if (!allowDuplicates) {
      const index = pool.findIndex(n => n.id === name.id);
      pool.splice(index, 1);
    }
    
    await delay(1000); // Pause between selections
  }
  
  return selected;
}
```

---

### 2.6 Persistence & Sync

#### 2.6.1 Local Storage
**Priority**: P0 (MVP)

**User Stories**
- As a user, I want my lists saved automatically so I don't lose work
- As a user, I want to close and reopen the app without losing data
- As a user, I want to clear all data if I need to start fresh

**Acceptance Criteria**
- [ ] Auto-save on every change (debounced 500ms)
- [ ] Save: name lists, presets, history, settings
- [ ] Storage limit check: warn if approaching 5MB
- [ ] Graceful degradation if storage unavailable
- [ ] "Clear all data" button in settings with confirmation
- [ ] Export full state as backup JSON

**Storage Schema**
```typescript
interface LocalStorageSchema {
  version: string; // For migrations
  lists: NameList[];
  activeListId: string;
  presets: Preset[];
  history: SelectionRecord[];
  settings: AppSettings;
  theme: Theme;
  lastUpdated: Date;
}
```

**Storage Keys**
- `radial-randomizer-v1-state`: Main app state
- `radial-randomizer-v1-history`: Selection history (separate for size)
- `radial-randomizer-v1-settings`: User preferences

---

#### 2.6.2 Cloud Sync (Optional)
**Priority**: P3 (Future)

**User Stories**
- As a user, I want to access my lists on multiple devices
- As a user, I want to share lists with others via link
- As a user, I want to collaborate on a list in real-time

**Acceptance Criteria**
- [ ] Firebase/Supabase integration for auth
- [ ] Sync lists and presets across devices
- [ ] Generate shareable links with view/edit permissions
- [ ] Real-time collaboration (operational transforms)
- [ ] Conflict resolution for offline edits
- [ ] Max 50MB storage per user

**Out of Scope for MVP**: This is explicitly a future enhancement.

---

## 3. Technical Architecture

### 3.1 Tech Stack

**Framework & Core**
- React 18.3+ (with concurrent features)
- TypeScript 5.3+ (strict mode)
- Vite 5.0+ (build tool)

**State Management**
- Zustand 4.4+ (global state)
- React Query / TanStack Query 5.0+ (for future API calls)

**UI & Styling**
- Tailwind CSS 3.4+
- Framer Motion 11.0+ (animations)
- Radix UI (accessible components)
- Lucide React (icons)

**Data Visualization**
- Recharts 2.10+ (for analytics charts)

**Testing**
- Vitest (unit tests)
- React Testing Library
- Playwright (e2e tests)

**Code Quality**
- ESLint 8+ with TypeScript rules
- Prettier
- Husky (pre-commit hooks)

---

### 3.2 Project Structure

```
radial-randomizer/
├── src/
│   ├── components/
│   │   ├── wheel/
│   │   │   ├── RadialWheel.tsx
│   │   │   ├── NameLabel.tsx
│   │   │   ├── RadialLine.tsx
│   │   │   └── CenterButton.tsx
│   │   ├── sidebar/
│   │   │   ├── NameListPanel.tsx
│   │   │   ├── NameInput.tsx
│   │   │   ├── NameItem.tsx
│   │   │   └── BulkImportModal.tsx
│   │   ├── history/
│   │   │   ├── HistoryPanel.tsx
│   │   │   ├── HistoryItem.tsx
│   │   │   └── HistoryFilters.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── FrequencyChart.tsx
│   │   │   └── FairnessScore.tsx
│   │   ├── settings/
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── AnimationSettings.tsx
│   │   │   └── FairModeSettings.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Slider.tsx
│   ├── stores/
│   │   ├── useNameStore.ts
│   │   ├── useHistoryStore.ts
│   │   ├── useSettingsStore.ts
│   │   └── useThemeStore.ts
│   ├── hooks/
│   │   ├── useRandomization.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useAnimation.ts
│   │   └── useSound.ts
│   ├── utils/
│   │   ├── randomization.ts
│   │   ├── fairness.ts
│   │   ├── statistics.ts
│   │   ├── storage.ts
│   │   ├── export.ts
│   │   └── validation.ts
│   ├── types/
│   │   ├── name.ts
│   │   ├── history.ts
│   │   ├── settings.ts
│   │   └── theme.ts
│   ├── constants/
│   │   ├── themes.ts
│   │   ├── presets.ts
│   │   └── defaults.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── sounds/
│   │   ├── spin.mp3
│   │   ├── tick.mp3
│   │   └── ding.mp3
│   └── presets/
│       ├── common-names.json
│       ├── countries.json
│       └── colors.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── API.md
    ├── ARCHITECTURE.md
    └── CONTRIBUTING.md
```

---

### 3.3 State Management Strategy

**Zustand Stores**

```typescript
// useNameStore.ts
interface NameStore {
  lists: NameList[];
  activeListId: string;
  
  // Actions
  addName: (listId: string, name: string) => void;
  updateName: (listId: string, nameId: string, updates: Partial<Name>) => void;
  deleteName: (listId: string, nameId: string) => void;
  setActiveList: (listId: string) => void;
  importNames: (listId: string, names: string[]) => void;
  exportList: (listId: string, format: 'json' | 'csv') => string;
}

// useHistoryStore.ts
interface HistoryStore {
  records: SelectionRecord[];
  
  // Actions
  addRecord: (record: Omit<SelectionRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  getRecordsByName: (nameId: string) => SelectionRecord[];
  getRecordsByDateRange: (start: Date, end: Date) => SelectionRecord[];
}

// useSettingsStore.ts
interface SettingsStore {
  animation: AnimationSettings;
  fairMode: FairModeSettings;
  layout: LayoutSettings;
  
  // Actions
  updateAnimationSettings: (settings: Partial<AnimationSettings>) => void;
  updateFairModeSettings: (settings: Partial<FairModeSettings>) => void;
  resetToDefaults: () => void;
}

// useThemeStore.ts
interface ThemeStore {
  currentTheme: Theme;
  customThemes: Theme[];
  
  // Actions
  setTheme: (theme: Theme) => void;
  createCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
}
```

**Store Persistence**
- Use `persist` middleware from Zustand
- Automatically sync to localStorage on state changes
- Debounce writes (500ms) to avoid excessive I/O

---

### 3.4 Key Algorithms

#### 3.4.1 Weighted Random Selection
```typescript
export function weightedRandom<T>(
  items: T[],
  getWeight: (item: T) => number
): T {
  const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= getWeight(item);
    if (random <= 0) return item;
  }
  
  return items[items.length - 1];
}
```

#### 3.4.2 Fair Mode Weight Adjustment
```typescript
export function applyFairnessBoost(
  name: Name,
  settings: FairModeSettings,
  allHistory: SelectionRecord[]
): number {
  if (!settings.enabled) return name.weight;
  
  const nameHistory = allHistory.filter(r => r.nameId === name.id);
  const timeSinceLastPick = name.lastSelectedAt
    ? Date.now() - name.lastSelectedAt.getTime()
    : Infinity;
  
  // Boost weight if not picked in time window
  if (timeSinceLastPick > settings.timeWindow && settings.boostUnpickedWeight) {
    const boostFactor = Math.min(
      settings.boostMultiplier,
      1 + (timeSinceLastPick / settings.timeWindow)
    );
    return name.weight * boostFactor;
  }
  
  return name.weight;
}
```

#### 3.4.3 Spin Animation Calculation
```typescript
export function calculateSpinRotation(
  targetIndex: number,
  totalItems: number,
  minSpins: number = 3
): number {
  const degreesPerItem = 360 / totalItems;
  const targetAngle = targetIndex * degreesPerItem;
  const fullSpins = minSpins + Math.random() * 2; // 3-5 full rotations
  const totalRotation = (fullSpins * 360) + targetAngle;
  
  return totalRotation;
}

export function getSpinDuration(settings: AnimationSettings): number {
  // Add slight randomness to feel more natural
  const variance = settings.duration * 0.1;
  return settings.duration + (Math.random() - 0.5) * variance;
}
```

---

### 3.5 Performance Optimization

**Rendering Strategy**
- Use `React.memo` for wheel components (expensive to re-render)
- Virtualize history list (only render visible items)
- Debounce input handlers (500ms for name input)
- Throttle wheel rotation updates (16ms / 60fps)

**Animation Performance**
- Use CSS transforms (GPU-accelerated)
- Avoid layout thrashing during animations
- Use `will-change` hint for rotating elements
- Disable hover effects during spin for better performance

**Bundle Optimization**
- Code-split analytics dashboard (lazy load)
- Code-split settings modal
- Tree-shake unused Recharts components
- Compress sound files to < 30KB each

**Target Metrics**
- Initial load: < 2s on 3G
- Time to interactive: < 3s
- Bundle size: < 200KB (gzipped)
- 60fps animations on iPhone 8+

---

## 4. User Interface Design

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [☰ Menu]           RADIAL RANDOMIZER         [⚙️ Settings] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────┐     ┌─────────────┐     ┌───────────┐  │
│  │           │     │             │     │           │  │
│  │  History  │     │   Radial    │     │   Names   │  │
│  │  Panel    │     │   Wheel     │     │   Panel   │  │
│  │           │     │             │     │           │  │
│  │  (left)   │     │   (center)  │     │  (right)  │  │
│  │           │     │             │     │           │  │
│  │  • Last   │     │      ○      │     │  [+ Add]  │  │
│  │    picks  │     │             │     │           │  │
│  │  • Stats  │     │   Names     │     │  Alice    │  │
│  │           │     │   around    │     │  Bob      │  │
│  │           │     │   circle    │     │  Charlie  │  │
│  └───────────┘     └─────────────┘     └───────────┘  │
│                                                         │
│         [Selected: ALICE] (if name selected)           │
└─────────────────────────────────────────────────────────┘
```

**Responsive Breakpoints**
- Desktop (> 1024px): Three-column layout
- Tablet (768-1024px): Wheel + collapsible sidebars
- Mobile (< 768px): Stacked layout, full-screen wheel, drawer for panels

---

### 4.2 Component Specifications

#### 4.2.1 Radial Wheel
**Dimensions**: Responsive (300px to 600px diameter)
**Elements**:
- Circle outline: 0.5px stroke, 15% white opacity
- Name labels: Radial distribution, monospace font
- Radial lines: 0.5px stroke, extends 120px from circle
- Center button: 96px diameter, border, hover state

**Interactions**:
- Click center to spin
- Keyboard: Space bar to spin
- Touch: Tap center button
- Accessibility: ARIA labels, focus indicators

---

#### 4.2.2 Names Panel (Right Sidebar)
**Width**: 320px (desktop), 100% (mobile)
**Sections**:
1. **Add Name Input**
   - Text field with placeholder "Enter name..."
   - Add button (Enter key or click)
   - Bulk import link

2. **Name List**
   - Scrollable (max-height: 60vh)
   - Each item shows:
     - Name text
     - Weight indicator (if not 1.0)
     - Category badge (if assigned)
     - Edit/delete buttons (on hover)
   - Empty state: "Add names to get started"

3. **List Actions**
   - Export button (dropdown: JSON, CSV)
   - Clear all button
   - Load preset button

---

#### 4.2.3 History Panel (Left Sidebar)
**Width**: 280px (desktop), drawer (mobile)
**Sections**:
1. **Recent Selections**
   - Timeline view (reverse chronological)
   - Each item shows:
     - Name (highlighted)
     - Timestamp (relative: "2 min ago")
     - Session indicator
   - Load more button (infinite scroll)

2. **Quick Stats**
   - Total selections today
   - Most picked name
   - Fairness score

3. **Actions**
   - Export history
   - Clear history
   - View analytics (opens dashboard)

---

#### 4.2.4 Settings Modal
**Trigger**: Gear icon in top-right
**Tabs**:
1. **Animation**: Duration, easing, sound, particles
2. **Fair Mode**: Enable toggle, exclusion settings, boost multiplier
3. **Theme**: Theme selector, custom theme editor
4. **Layout**: Circle size, font size, panel visibility
5. **Data**: Export/import state, clear data, storage usage

---

### 4.3 Accessibility Requirements

**Keyboard Navigation**
- Tab order: Menu → Settings → Center Button → Name Panel → History Panel
- Space/Enter: Activate buttons
- Escape: Close modals
- Arrow keys: Navigate lists

**Screen Reader Support**
- ARIA labels on all interactive elements
- Live region for selection announcement
- Descriptive alt text for icons
- Role attributes (button, dialog, list, etc.)

**Visual Accessibility**
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Focus indicators: 2px solid ring
- Text size: Minimum 13px, scalable to 200%
- No reliance on color alone (use icons + labels)

**Motion Sensitivity**
- Respect `prefers-reduced-motion`
- Option to disable animations entirely
- Instant selection mode (no spin)

---

## 5. Data & Storage

### 5.1 Data Models

**Complete TypeScript Definitions**

```typescript
// Core entities
interface Name {
  id: string;
  value: string;
  weight: number;
  createdAt: Date;
  lastSelectedAt: Date | null;
  selectionCount: number;
  isExcluded: boolean;
  categoryId: string | null;
  metadata?: Record<string, unknown>;
}

interface NameList {
  id: string;
  title: string;
  description?: string;
  names: Name[];
  categories: Category[];
  createdAt: Date;
  updatedAt: Date;
  settings: ListSettings;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
}

interface SelectionRecord {
  id: string;
  nameId: string;
  nameValue: string;
  listId: string;
  timestamp: Date;
  sessionId: string;
  spinDuration: number;
  categoryId?: string;
}

// Settings
interface AnimationSettings {
  duration: number;
  easing: 'linear' | 'easeOut' | 'bounce' | 'elastic';
  enableSound: boolean;
  soundVolume: number;
  enableParticles: boolean;
  particleCount: number;
  respectReducedMotion: boolean;
}

interface FairModeSettings {
  enabled: boolean;
  excludeLastN: number;
  timeWindow: number;
  boostUnpickedWeight: boolean;
  boostMultiplier: number;
}

interface LayoutSettings {
  circleRadius: number;
  labelDistance: number;
  fontSize: number;
  showSidebar: boolean;
  showInstructions: boolean;
}

interface ListSettings {
  allowDuplicates: boolean;
  defaultWeight: number;
  autoExcludeAfterSelection: boolean;
  categoryFilterEnabled: boolean;
  selectedCategories: string[];
}

// App state
interface AppSettings {
  animation: AnimationSettings;
  fairMode: FairModeSettings;
  layout: LayoutSettings;
}

interface AppState {
  version: string;
  lists: NameList[];
  activeListId: string;
  presets: Preset[];
  history: SelectionRecord[];
  settings: AppSettings;
  theme: Theme;
  lastUpdated: Date;
}
```

---

### 5.2 Storage Strategy

**LocalStorage Keys**
```typescript
const STORAGE_KEYS = {
  APP_STATE: 'radial-randomizer-v1-state',
  HISTORY: 'radial-randomizer-v1-history',
  SETTINGS: 'radial-randomizer-v1-settings',
  THEME: 'radial-randomizer-v1-theme',
} as const;
```

**Storage Limits**
- Total: 5MB recommended (10MB max)
- Per key limits:
  - APP_STATE: 3MB
  - HISTORY: 1.5MB
  - SETTINGS: 50KB
  - THEME: 50KB

**Cleanup Strategy**
- History: Keep last 1000 records (FIFO)
- Auto-prune when approaching 80% of limit
- Warning when > 90% full
- Offer export before pruning

---

### 5.3 Import/Export Formats

**JSON Export (Full State)**
```json
{
  "version": "1.0.0",
  "exportDate": "2024-12-08T10:30:00Z",
  "lists": [
    {
      "id": "list-1",
      "title": "My Team",
      "names": [
        {
          "id": "name-1",
          "value": "Alice",
          "weight": 1.0,
          "selectionCount": 5,
          "lastSelectedAt": "2024-12-08T09:15:00Z"
        }
      ],
      "categories": [
        {
          "id": "cat-1",
          "name": "Team A",
          "color": "#ff6b35"
        }
      ]
    }
  ],
  "history": [
    {
      "id": "record-1",
      "nameId": "name-1",
      "nameValue": "Alice",
      "timestamp": "2024-12-08T09:15:00Z"
    }
  ]
}
```

**CSV Export (Simple List)**
```csv
Name,Weight,Category,Selection Count,Last Selected
Alice,1.0,Team A,5,2024-12-08 09:15
Bob,1.5,Team A,3,2024-12-08 08:30
Charlie,1.0,Team B,7,2024-12-08 10:00
```

**CSV Export (History)**
```csv
Timestamp,Name,List,Session ID,Duration (ms)
2024-12-08 10:30:15,Alice,My Team,session-abc,2500
2024-12-08 10:28:45,Bob,My Team,session-abc,3200
2024-12-08 10:25:30,Charlie,My Team,session-abc,2800
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Coverage Target**: 80%+

**Priority Areas**
1. **Randomization Logic**
   - Test weighted selection distribution
   - Test fair mode bias correction
   - Test exclusion filters
   - Test edge cases (empty list, single item)

2. **State Management**
   - Test store actions and selectors
   - Test persistence middleware
   - Test undo/redo functionality

3. **Utilities**
   - Test CSV/JSON parsing
   - Test validation functions
   - Test statistics calculations

**Example Tests**
```typescript
describe('weightedRandom', () => {
  it('should respect weight distribution', () => {
    const items = [
      { name: 'A', weight: 1 },
      { name: 'B', weight: 3 },
    ];
    
    const results = Array.from({ length: 1000 }, () =>
      weightedRandom(items, i => i.weight)
    );
    
    const countB = results.filter(r => r.name === 'B').length;
    expect(countB).toBeGreaterThan(700); // ~75% expected
    expect(countB).toBeLessThan(800);
  });
});
```

---

### 6.2 Integration Tests

**Focus Areas**
1. **User Flows**
   - Add names → Spin → View result → Check history
   - Import CSV → Assign categories → Filter → Spin
   - Adjust settings → Spin → Verify behavior change

2. **Persistence**
   - Add data → Reload page → Verify data persists
   - Export → Clear data → Import → Verify restoration

**Example Test**
```typescript
describe('Name Management Flow', () => {
  it('should add, edit, delete names', async () => {
    render(<App />);
    
    // Add name
    const input = screen.getByPlaceholderText('Enter name...');
    await userEvent.type(input, 'Alice{enter}');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    
    // Edit name
    const editBtn = screen.getByLabelText('Edit Alice');
    await userEvent.click(editBtn);
    await userEvent.clear(input);
    await userEvent.type(input, 'Alicia{enter}');
    expect(screen.getByText('Alicia')).toBeInTheDocument();
    
    // Delete name
    const deleteBtn = screen.getByLabelText('Delete Alicia');
    await userEvent.click(deleteBtn);
    expect(screen.queryByText('Alicia')).not.toBeInTheDocument();
  });
});
```

---

### 6.3 E2E Tests

**Tools**: Playwright

**Critical Paths**
1. First-time user experience
2. Daily usage pattern (teacher use case)
3. Mobile interaction flow
4. Keyboard-only navigation
5. Error recovery scenarios

**Example E2E Test**
```typescript
test('teacher workflow', async ({ page }) => {
  await page.goto('/');
  
  // Load preset
  await page.click('text=Load Preset');
  await page.click('text=Common Names');
  
  // Conduct 3 randomizations
  for (let i = 0; i < 3; i++) {
    await page.click('[aria-label="Randomize"]');
    await page.waitForSelector('[data-testid="selected-name"]');
    await page.screenshot({ path: `selection-${i}.png` });
  }
  
  // Check history
  await page.click('text=View History');
  const historyItems = await page.$$('[data-testid="history-item"]');
  expect(historyItems).toHaveLength(3);
  
  // Export results
  await page.click('text=Export History');
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/history-\d{4}-\d{2}-\d{2}\.csv/);
});
```

---

### 6.4 Performance Testing

**Benchmarks**
- Spin animation: Must maintain 60fps with 100 names
- History list: Smooth scrolling with 1000 records
- Import: Process 1000-name CSV in < 500ms
- Export: Generate CSV in < 200ms

**Load Testing**
- Test with maximum data (100 lists, 100 names each)
- Verify no memory leaks over 30-minute session
- Test rapid spinning (10 spins in 10 seconds)

---

## 7. Deployment & DevOps

### 7.1 Build Configuration

**Vite Config**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'animation': ['framer-motion'],
          'charts': ['recharts'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  }
});
```

**Environment Variables**
```bash
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_MAX_STORAGE_MB=5
```

---

### 7.2 Hosting Strategy

**Recommended Platform**: Vercel or Netlify

**Requirements**
- Static site hosting (no SSR needed)
- Global CDN for fast loading
- Automatic HTTPS
- Preview deployments for PRs

**Configuration**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### 7.3 CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
  
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

### 7.4 Monitoring & Analytics

**Error Tracking**: Sentry (optional)
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  beforeSend(event) {
    // Strip PII from error reports
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  }
});
```

**Usage Analytics**: Privacy-friendly (Plausible or Fathom)
- Track: Page views, spin count, feature usage
- Do NOT track: Names, personal data, selection results
- Respect DNT header

**Performance Monitoring**
- Core Web Vitals (LCP, FID, CLS)
- Custom metrics: Spin duration, import time
- Lighthouse CI in deployment pipeline

---

## 8. Release Plan

### 8.1 MVP Scope (v1.0.0)

**Included Features**
- ✅ Basic name management (add, edit, delete)
- ✅ Core randomization with animation
- ✅ Selection history (last 50)
- ✅ Local storage persistence
- ✅ Bulk import (paste, CSV)
- ✅ Export (JSON, CSV)
- ✅ Basic theming (3 built-in themes)
- ✅ Responsive layout
- ✅ Keyboard shortcuts (Space to spin)

**Excluded from MVP**
- ❌ Weighted randomization
- ❌ Fair mode
- ❌ Categories
- ❌ Analytics dashboard
- ❌ Sound effects
- ❌ Custom theme editor
- ❌ Multi-selection mode

**Timeline**: 4 weeks
- Week 1: Core architecture, name management
- Week 2: Randomization, wheel UI, animations
- Week 3: History, persistence, import/export
- Week 4: Polish, testing, documentation

---

### 8.2 Post-MVP Roadmap

**v1.1.0 (Month 2)**
- Weighted randomization
- Fair mode (basic)
- 2 additional themes
- Sound effects

**v1.2.0 (Month 3)**
- Categories
- Category filtering
- Enhanced fair mode
- Custom theme editor

**v1.3.0 (Month 4)**
- Analytics dashboard
- Frequency charts
- Fairness statistics
- Multi-selection mode

**v2.0.0 (Month 6)**
- Cloud sync (optional)
- Shareable links
- Collaborative lists
- Mobile app (React Native)

---

## 9. Success Criteria

### 9.1 Launch Goals

**Week 1**
- 100 unique users
- 500 spins performed
- Average 3 lists created per user
- < 1% error rate

**Month 1**
- 1,000 unique users
- 10,000 spins performed
- 50% retention (return within 7 days)
- 4+ star average rating (if app store)

**Month 3**
- 5,000 unique users
- 100,000 spins performed
- 40% weekly active users
- Featured in 3+ education/productivity blogs

---

### 9.2 Quality Metrics

**Performance**
- Lighthouse score: 95+ (all categories)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Zero critical accessibility violations

**Reliability**
- 99.9% uptime
- < 0.1% error rate
- Zero data loss incidents
- < 100ms p95 response time

**User Satisfaction**
- Net Promoter Score: 40+
- User satisfaction: 4.5/5 stars
- Support ticket rate: < 1% of users
- Feature request engagement: 20%+

---

## 10. Open Questions & Decisions Needed

### 10.1 Technical Decisions

**Q1: Should we use Web Workers for randomization?**
- **Pros**: Keeps main thread free, better performance
- **Cons**: Added complexity, overkill for current scale
- **Decision**: Not for MVP, evaluate in v1.2

**Q2: Should we implement undo/redo?**
- **Pros**: Better UX, safer editing
- **Cons**: State management complexity
- **Decision**: Add in v1.1 (low effort, high value)

**Q3: PWA support?**
- **Pros**: Offline functionality, install prompt
- **Cons**: Additional testing, service worker complexity
- **Decision**: Add in v1.2 (good fit for use case)

---

### 10.2 Product Decisions

**Q4: Should we limit free tier features?**
- **Option A**: Fully free, no limits
- **Option B**: Free with upgrade for cloud sync
- **Option C**: Freemium with limits (10 lists, 50 names)
- **Decision**: Option A for now, evaluate Option B in v2.0

**Q5: Should we support multiple languages?**
- **Pros**: Broader reach, accessibility
- **Cons**: Translation costs, maintenance
- **Decision**: Not for MVP, add i18n infrastructure in v1.2

**Q6: Should we add gamification?**
- Ideas: Achievements, streaks, leaderboards
- **Decision**: Not aligned with core use case, skip

---

## 11. Appendix

### 11.1 Glossary

- **Fair Mode**: Algorithm that ensures equitable selection distribution
- **Weight**: Numerical value (0.1-5.0) affecting selection probability
- **Radial Layout**: Circular arrangement with items around perimeter
- **Selection Record**: Historical log entry of a randomization event
- **Preset**: Pre-configured name list template

---

### 11.2 References

**Design Inspiration**
- Behance: Radial infographics, data visualization
- Dribbble: Sci-fi UI, minimal interfaces
- Codepen: SVG animations, circular layouts

**Technical References**
- React documentation: https://react.dev
- Framer Motion: https://www.framer.com/motion
- Zustand: https://github.com/pmndrs/zustand
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

---

### 11.3 Contact & Feedback

**Product Owner**: [Name]
**Tech Lead**: [Name]
**Repository**: github.com/your-org/radial-randomizer
**Feedback**: feedback@radialrandomizer.com

---

**Document Version**: 1.0.0  
**Last Updated**: December 8, 2024  
**Status**: Draft → Ready for Review  
**Next Review**: After MVP Launch
