import { Edit2, Eye, EyeOff, Hand, Trash2, UserCheck, UserX } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { getUnavailabilityIcon, type UnavailabilityIconId } from '../../constants/unavailability';
import type { Name } from '../../types/name';
import {
  countRangeDays,
  formatReturnDay,
  isUnavailableToday,
  toLocalISODay,
} from '../../utils/name';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { UnavailabilityDialog } from './UnavailabilityDialog';

interface NameListItemProps {
  name: Name;
  onEdit: (nameId: string, newValue: string) => void;
  onDelete: (nameId: string) => void;
  onToggleExclude: (nameId: string) => void;
  onVolunteer: (nameId: string) => void;
  onSetUnavailability: (
    nameId: string,
    from: string,
    until: string,
    icon?: UnavailabilityIconId
  ) => void;
  onClearUnavailability: (nameId: string) => void;
}

interface UnavailabilityButtonProps {
  nameValue: string;
  isUnavailable: boolean;
  onOpen: () => void;
}

function UnavailabilityButton({
  nameValue,
  isUnavailable,
  onOpen,
}: Readonly<UnavailabilityButtonProps>) {
  return (
    <Button
      type="button"
      onClick={onOpen}
      variant="tech-ghost"
      size="icon-sm"
      className={isUnavailable ? 'opacity-30' : 'text-accent opacity-70'}
      aria-label={`Set availability for ${nameValue}`}
      title="Set availability"
    >
      {isUnavailable ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
    </Button>
  );
}

function ReturnDayLabel({ name }: Readonly<{ name: Name }>) {
  if (!name.unavailableFrom || !name.unavailableUntil || !isUnavailableToday(name)) return null;

  const endsToday = name.unavailableUntil === toLocalISODay(new Date());
  const totalDays = countRangeDays(name.unavailableFrom, name.unavailableUntil);
  const returnDay = endsToday ? 'TOMORROW' : formatReturnDay(name.unavailableUntil);
  const preset = getUnavailabilityIcon(name.unavailableIcon);
  const dayCountSuffix = totalDays > 1 ? ` · ${totalDays} DAYS` : '';
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-text/70">
      {preset && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span role="img" aria-label={preset.text}>
              <preset.Icon className="size-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="px-2 py-1 text-xs tracking-wider text-text">
            {preset.text}
          </TooltipContent>
        </Tooltip>
      )}
      <span>{`BACK ${returnDay}${dayCountSuffix}`}</span>
    </span>
  );
}

function NameListItemComponent({
  name,
  onEdit,
  onDelete,
  onToggleExclude,
  onVolunteer,
  onSetUnavailability,
  onClearUnavailability,
}: Readonly<NameListItemProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [editValue, setEditValue] = useState(name.value);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUnavailable = isUnavailableToday(name);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name.value) {
      onEdit(name.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(name.value);
    setIsEditing(false);
  };

  return (
    <div
      data-testid={`name-item-${name.id}`}
      className={cn(
        'px-4 py-3 last:border-b-0 transition-colors group bg-transparent border-b border-b-white/5 hover:bg-white/5',
        name.isExcluded || isUnavailable ? 'opacity-50' : 'opacity-100'
      )}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="w-full px-2 py-1 font-mono text-sm text-text bg-black/50 border border-accent shadow-none focus:outline-none focus:shadow-accent focus:shadow-xs"
          maxLength={100}
        />
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onDoubleClick={() => setIsEditing(true)}
            className="flex-1 text-left flex flex-col items-start gap-0.5"
          >
            <span className="flex items-center gap-2">
              <span
                className={cn('font-mono text-sm text-text', name.isExcluded && 'line-through')}
              >
                {name.value}
              </span>
              {name.selectionCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-mono rounded text-accent bg-accent-20">
                  {name.selectionCount}x
                </span>
              )}
            </span>
            <ReturnDayLabel name={name} />
          </button>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!name.isExcluded && !isUnavailable && (
              <Button
                type="button"
                onClick={() => onVolunteer(name.id)}
                variant="tech-ghost"
                size="icon-sm"
                className="text-accent opacity-70"
                aria-label={`Volunteer ${name.value}`}
                title="Mark as volunteer (skip wheel)"
              >
                <Hand className="size-4" />
              </Button>
            )}
            <UnavailabilityButton
              nameValue={name.value}
              isUnavailable={isUnavailable}
              onOpen={() => setIsAvailabilityOpen(true)}
            />
            <Button
              type="button"
              onClick={() => onToggleExclude(name.id)}
              variant="tech-ghost"
              size="icon-sm"
              className={name.isExcluded ? 'opacity-30' : 'text-accent opacity-70'}
              aria-label={name.isExcluded ? 'Include name' : 'Exclude name'}
              title={name.isExcluded ? 'Include in spins' : 'Exclude from spins'}
            >
              {name.isExcluded ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              variant="tech-ghost"
              size="icon-sm"
              className="text-accent opacity-70"
              aria-label={`Edit ${name.value}`}
            >
              <Edit2 className="size-4" />
            </Button>
            <Button
              type="button"
              onClick={() => onDelete(name.id)}
              variant="tech-destructive"
              size="icon-sm"
              aria-label={`Delete ${name.value}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {isAvailabilityOpen && (
        <UnavailabilityDialog
          name={name}
          onSave={(from, until, icon) => onSetUnavailability(name.id, from, until, icon)}
          onClear={() => onClearUnavailability(name.id)}
          onClose={() => setIsAvailabilityOpen(false)}
        />
      )}
    </div>
  );
}

export const NameListItem = memo(NameListItemComponent);
