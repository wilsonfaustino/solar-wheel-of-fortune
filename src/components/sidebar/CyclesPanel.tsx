import { Edit2, Plus, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { selectActiveList, useNameStore } from '../../stores/useNameStore';
import type { Cycle } from '../../types/name';
import { formatShortDay, getCooldownRange, weekdaysBetween } from '../../utils/cycle';
import { Button } from '../ui/button';

const INPUT_CLASS =
  'w-full px-3 py-2 h-10 font-mono text-sm text-text bg-black/50 border border-border-light focus:shadow-xs focus:shadow-accent focus:outline-none placeholder:text-white/30';

function CyclesPanelComponent() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );
  const addCycle = useNameStore((state) => state.addCycle);
  const updateCycle = useNameStore((state) => state.updateCycle);
  const deleteCycle = useNameStore((state) => state.deleteCycle);

  const cycles = useMemo(
    () => selectActiveList({ lists, activeListId })?.cycles ?? [],
    [lists, activeListId]
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [cooldownWeeks, setCooldownWeeks] = useState('1');
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName('');
    setStart('');
    setEnd('');
    setCooldownWeeks('1');
    setError('');
  }, []);

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
      if (weekdaysBetween(start, end) === 0) {
        setError('Cycle must include at least one weekday');
        return;
      }
      const totalDays = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
      const weeks = Number(cooldownWeeks) || 0;
      if (weeks * 7 >= totalDays) {
        setError('Cooldown must fit inside the cycle');
        return;
      }
      const values = {
        name: name.trim() || `Cycle ${cycles.length + 1}`,
        start,
        end,
        cooldownWeeks: weeks,
      };
      if (editingId) {
        updateCycle(editingId, values);
      } else {
        addCycle(values);
      }
      resetForm();
    },
    [addCycle, cooldownWeeks, cycles.length, editingId, end, name, resetForm, start, updateCycle]
  );

  const handleEdit = useCallback((cycle: Cycle) => {
    setEditingId(cycle.id);
    setName(cycle.name);
    setStart(cycle.start);
    setEnd(cycle.end);
    setCooldownWeeks(String(cycle.cooldownWeeks));
    setError('');
  }, []);

  const handleDelete = useCallback(
    (cycleId: string) => {
      deleteCycle(cycleId);
      if (cycleId === editingId) resetForm();
    },
    [deleteCycle, editingId, resetForm]
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
          <span>FROM</span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={cn(INPUT_CLASS, 'w-40 shrink-0')}
            aria-label="Cycle start date"
          />
        </label>
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          <span>TO</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={cn(INPUT_CLASS, 'w-40 shrink-0')}
            aria-label="Cycle end date"
          />
        </label>
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          <span>COOLDOWN WEEKS</span>
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
        <div className="flex gap-2">
          <Button type="submit" variant="tech" size="tech-default" className="flex-1 text-sm">
            {editingId ? (
              'SAVE CYCLE'
            ) : (
              <>
                <Plus className="size-4" />
                ADD CYCLE
              </>
            )}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="tech-outline"
              size="tech-default"
              className="text-sm"
              onClick={resetForm}
            >
              CANCEL
            </Button>
          )}
        </div>
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
              className={cn(
                'flex items-start justify-between gap-2 border px-3 py-2',
                cycle.id === editingId ? 'border-accent' : 'border-border-light'
              )}
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
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="tech-ghost"
                  size="icon-sm"
                  aria-label={`Edit ${cycle.name}`}
                  onClick={() => handleEdit(cycle)}
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="tech-ghost"
                  size="icon-sm"
                  aria-label={`Delete ${cycle.name}`}
                  onClick={() => handleDelete(cycle.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CyclesPanel = memo(CyclesPanelComponent);
