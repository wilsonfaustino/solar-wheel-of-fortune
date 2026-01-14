import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface SwitchSettingsProps {
  autoExcludeEnabled: boolean;
  setAutoExclude: (value: boolean) => void;
  name: string;
  a11yLabel: string;
  title: string;
  description: string;
}

function SwitchSettings({
  autoExcludeEnabled,
  setAutoExclude,
  name,
  a11yLabel,
  title,
  description,
}: SwitchSettingsProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group" htmlFor={name}>
      <Switch
        checked={autoExcludeEnabled}
        onCheckedChange={setAutoExclude}
        aria-label={a11yLabel}
        id={name}
      />
      <div className="flex-1">
        <div className="text-sm font-mono text-text group-hover:text-accent transition-colors">
          {title}
        </div>
        <div className="text-xs text-text/50 mt-0.5">{description}</div>
      </div>
    </label>
  );
}

function SettingsPanelComponent() {
  const {
    autoExcludeEnabled,
    clearSelectionAfterExclude,
    setAutoExclude,
    setClearSelectionAfterExclude,
  } = useSettingsStore(
    useShallow((state) => ({
      autoExcludeEnabled: state.autoExcludeEnabled,
      clearSelectionAfterExclude: state.clearSelectionAfterExclude,
      setAutoExclude: state.setAutoExclude,
      setClearSelectionAfterExclude: state.setClearSelectionAfterExclude,
    }))
  );

  return (
    <div className="px-4 py-4 border-b border-b-white/10">
      <div className="text-xs font-mono tracking-wider mb-4 text-text/70">WHEEL BEHAVIOR</div>

      <div className="space-y-4">
        {/* Auto-exclude toggle */}
        <SwitchSettings
          autoExcludeEnabled={autoExcludeEnabled}
          setAutoExclude={setAutoExclude}
          name="auto-exclude"
          a11yLabel="Auto-exclude after selection"
          title="Auto-exclude after selection"
          description="Automatically exclude selected names from future spins"
        />

        {/* Clear selection toggle - only visible when auto-exclude is enabled */}
        {autoExcludeEnabled && (
          <SwitchSettings
            autoExcludeEnabled={clearSelectionAfterExclude}
            setAutoExclude={setClearSelectionAfterExclude}
            name="clear-selection-after-exclude"
            a11yLabel="Clear selection after exclusion"
            title="Clear selection after exclusion"
            description="Deselect names automatically after they are excluded"
          />
        )}
      </div>
    </div>
  );
}

export const SettingsPanel = memo(SettingsPanelComponent);
