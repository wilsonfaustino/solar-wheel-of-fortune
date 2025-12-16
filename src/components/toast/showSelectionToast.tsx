import { toast } from 'sonner';
import type { Name } from '../../types/name';
import { SelectionToast } from './SelectionToast';

export function showSelectionToast(name: Name) {
  const timestamp = new Date();

  toast.custom(
    (id) => (
      <SelectionToast name={name} timestamp={timestamp} onDismiss={() => toast.dismiss(id)} />
    ),
    {
      duration: 5000,
      id: `selection-${name.id}-${timestamp.getTime()}`,
    }
  );
}
