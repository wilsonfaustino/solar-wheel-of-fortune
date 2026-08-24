import { Plus, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { useNameStore } from '../../stores/useNameStore';
import { formatShortDay } from '../../utils/cycle';
import { Button } from '../ui/button';

const INPUT_CLASS =
  'w-full px-3 py-2 h-10 font-mono text-sm text-text bg-black/50 border border-border-light focus:shadow-xs focus:shadow-accent focus:outline-none placeholder:text-white/30';

function EventsPanelComponent() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );
  const addEvent = useNameStore((state) => state.addEvent);
  const deleteEvent = useNameStore((state) => state.deleteEvent);

  const events = useMemo(
    () => lists.find((list) => list.id === activeListId)?.events ?? [],
    [lists, activeListId]
  );

  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (submitEvent: React.FormEvent) => {
      submitEvent.preventDefault();
      if (!start) {
        setError('Start date is required');
        return;
      }
      const resolvedEnd = end || start;
      if (resolvedEnd < start) {
        setError('End date must be after start date');
        return;
      }
      addEvent({ name: name.trim() || `Event ${events.length + 1}`, start, end: resolvedEnd });
      setName('');
      setStart('');
      setEnd('');
      setError('');
    },
    [addEvent, end, events.length, name, start]
  );

  return (
    <div className="flex flex-col border-t border-t-border-light">
      <h3 className="px-4 pt-4 font-mono text-xs tracking-[0.2em] text-white/50">SPECIAL EVENTS</h3>
      <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event name..."
          className={INPUT_CLASS}
          maxLength={50}
          aria-label="Event name"
        />
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          <span>FROM</span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={cn(INPUT_CLASS, 'w-40 shrink-0')}
            aria-label="Event start date"
          />
        </label>
        <label className="flex items-center justify-between gap-3 whitespace-nowrap font-mono text-xs tracking-wider text-white/60">
          <span>TO</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={cn(INPUT_CLASS, 'w-40 shrink-0')}
            aria-label="Event end date"
          />
        </label>
        {error && <div className="text-xs text-red-400 font-mono">{error}</div>}
        <Button type="submit" variant="tech" size="tech-default" className="w-full text-sm">
          <Plus className="size-4" />
          ADD EVENT
        </Button>
      </form>

      <div className="px-4 pb-3 space-y-2">
        {events.length === 0 && (
          <p className="font-mono text-xs text-white/40 tracking-wider">NO EVENTS YET</p>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start justify-between gap-2 border border-dashed border-accent/40 px-3 py-2"
          >
            <div className="font-mono text-xs text-text/80">
              <div className="text-accent tracking-wider">{event.name}</div>
              <div className="text-white/50">
                {event.start === event.end
                  ? formatShortDay(event.start)
                  : `${formatShortDay(event.start)} → ${formatShortDay(event.end)}`}
              </div>
            </div>
            <Button
              variant="tech-ghost"
              size="icon-sm"
              aria-label={`Delete ${event.name}`}
              onClick={() => deleteEvent(event.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const EventsPanel = memo(EventsPanelComponent);
