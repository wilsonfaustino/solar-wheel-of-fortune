import { Plus, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { useNameStore } from '../../stores/useNameStore';
import { formatShortDay, getCooldownRange } from '../../utils/cycle';
import { Button } from '../ui/button';

const INPUT_CLASS =
  'w-full px-3 py-2 h-10 font-mono text-sm text-text bg-black/50 border border-border-light focus:shadow-xs focus:shadow-accent focus:outline-none placeholder:text-white/30';

function CyclesPanelComponent() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );
  const addCycle = useNameStore((state) => state.addCycle);
  const deleteCycle = useNameStore((state) => state.deleteCycle);

  const cycles = useMemo(
    () => lists.find((list) => list.id === activeListId)?.cycles ?? [],
    [lists, activeListId]
  );

  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [cooldownWeeks, setCooldownWeeks] = useState('1');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!start || !end) {
        setError('Start and end dates are required');
        return;
      }
      if (end < start) {
        setError('End date must be after start date');
        return;
      }
      const totalDays = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
      const weeks = Number(cooldownWeeks) || 0;
      if (weeks * 7 >= totalDays) {
        setError('Cooldown must fit inside the cycle');
        return;
      }
      addCycle({
        name: name.trim() || `Cycle ${cycles.length + 1}`,
        start,
        end,
        cooldownWeeks: weeks,
      });
      setName('');
      setStart('');
      setEnd('');
      setError('');
    },
    [addCycle, cooldownWeeks, cycles.length, end, name, start]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <form onSubmit={handleSubmit} className="px-4 py-4 border-b border-b-border-light space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Cycle name..."
          className={INPUT_CLASS}
          maxLength={50}
          aria-label="Cycle name"
        />
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          FROM
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={cn(INPUT_CLASS, 'w-40 shrink-0')}
            aria-label="Cycle start date"
          />
        </label>
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          TO
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={cn(INPUT_CLASS, 'w-40 shrink-0')}
            aria-label="Cycle end date"
          />
        </label>
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          COOLDOWN WEEKS
          <input
            type="number"
            min={0}
            max={12}
            value={cooldownWeeks}
            onChange={(e) => setCooldownWeeks(e.target.value)}
            className={cn(INPUT_CLASS, 'w-20 shrink-0')}
          />
        </label>
        {error && <div className="text-xs text-red-400 font-mono">{error}</div>}
        <Button type="submit" variant="tech" size="tech-default" className="w-full text-sm">
          <Plus className="size-4" />
          ADD CYCLE
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {cycles.length === 0 && (
          <p className="font-mono text-xs text-white/40 tracking-wider">NO CYCLES YET</p>
        )}
        {cycles.map((cycle) => {
          const cooldown = getCooldownRange(cycle);
          return (
            <div
              key={cycle.id}
              className="flex items-start justify-between gap-2 border border-border-light px-3 py-2"
            >
              <div className="font-mono text-xs text-text/80">
                <div className="text-text tracking-wider">{cycle.name}</div>
                <div className="text-white/50">
                  {formatShortDay(cycle.start)} → {formatShortDay(cycle.end)}
                </div>
                <div className="text-white/40">
                  {cycle.cooldownWeeks > 0
                    ? `${cycle.cooldownWeeks}W · ${formatShortDay(cooldown.start)} → ${formatShortDay(cooldown.end)}`
                    : 'NO COOLDOWN'}
                </div>
              </div>
              <Button
                variant="tech-ghost"
                size="icon-sm"
                aria-label={`Delete ${cycle.name}`}
                onClick={() => deleteCycle(cycle.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CyclesPanel = memo(CyclesPanelComponent);
