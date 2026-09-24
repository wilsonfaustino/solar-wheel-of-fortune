import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { memo, useState } from 'react';
import type { Name } from '../../types/name';
import { toLocalISODay, validateUnavailabilityRange } from '../../utils/name';
import { Button } from '../ui/button';

const INPUT_CLASS =
  'w-40 px-3 py-2 h-10 font-mono text-sm text-text bg-black/50 border border-border-light focus:shadow-xs focus:shadow-accent focus:outline-none';

const LABEL_CLASS =
  'flex items-center justify-between gap-3 font-mono text-xs tracking-wider text-white/60';

interface UnavailabilityDialogProps {
  name: Name;
  onSave: (from: string, until: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function UnavailabilityDialogComponent({
  name,
  onSave,
  onClear,
  onClose,
}: Readonly<UnavailabilityDialogProps>) {
  const today = toLocalISODay(new Date());
  // An ended range has no effect, so the form starts fresh instead of prefilling it
  const { unavailableFrom, unavailableUntil } = name;
  const hasCurrentRange = !!unavailableFrom && !!unavailableUntil && unavailableUntil >= today;
  const [from, setFrom] = useState(hasCurrentRange ? unavailableFrom : today);
  const [until, setUntil] = useState(hasCurrentRange ? unavailableUntil : today);
  const validationError = validateUnavailabilityRange(from, until, today);

  const saveAndClose = (rangeFrom: string, rangeUntil: string) => {
    onSave(rangeFrom, rangeUntil);
    onClose();
  };

  const clearAndClose = () => {
    onClear();
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm z-50 bg-black/80" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-sm w-full bg-black border border-border-light z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-mono text-lg tracking-wider text-accent">
              {name.value} AVAILABILITY
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="tech-ghost"
                size="icon-sm"
                className="text-accent/50 hover:text-accent"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Mark {name.value} unavailable for today or for a date range
          </Dialog.Description>

          <Button
            type="button"
            onClick={() => saveAndClose(today, today)}
            variant="tech-outline"
            size="tech-sm"
            className="w-full mb-4 text-sm"
          >
            TODAY ONLY
          </Button>

          <div className="flex flex-col gap-2 mb-2">
            <label className={LABEL_CLASS}>
              <span>FROM</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={INPUT_CLASS}
                aria-label="Unavailable from"
              />
            </label>
            <label className={LABEL_CLASS}>
              <span>TO</span>
              <input
                type="date"
                value={until}
                min={from > today ? from : today}
                onChange={(e) => setUntil(e.target.value)}
                className={INPUT_CLASS}
                aria-label="Unavailable until"
              />
            </label>
          </div>

          <p className="min-h-5 mb-4 font-mono text-xs tracking-wider text-red-400">
            {validationError}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => saveAndClose(from, until)}
              disabled={validationError !== null}
              variant="tech"
              size="tech-sm"
              className="flex-1 text-sm"
            >
              SAVE
            </Button>
            {hasCurrentRange && (
              <Button
                type="button"
                onClick={clearAndClose}
                variant="tech-outline"
                size="tech-sm"
                className="text-sm"
              >
                MARK AVAILABLE
              </Button>
            )}
            <Button
              type="button"
              onClick={onClose}
              variant="tech-outline"
              size="tech-sm"
              className="text-sm"
            >
              CANCEL
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const UnavailabilityDialog = memo(UnavailabilityDialogComponent);
