import { Share2, Upload } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useNameStore } from '../../stores/useNameStore';
import type { NameList } from '../../types/name';
import { exportListToJSON, parseSharedList } from '../../utils/shareList';
import { ActionButtons } from './names-list/ActionButtons';

interface ShareListActionsProps {
  activeList: NameList | undefined;
}

function ShareListActionsComponent({ activeList }: ShareListActionsProps) {
  const importList = useNameStore((state) => state.importList);
  const history = useNameStore((state) => state.history);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [includeState, setIncludeState] = useState(true);

  const handleExport = useCallback(() => {
    if (activeList) exportListToJSON(activeList, { history, includeState });
  }, [activeList, history, includeState]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      try {
        importList(parseSharedList(await file.text()));
        setImportError(null);
      } catch {
        setImportError('Could not read that list file');
      }
    },
    [importList]
  );

  return (
    <div className="px-4 pb-4 border-t border-t-white/10 pt-4">
      <div className="flex gap-2">
        <ActionButtons
          hasTargetContent={!!activeList}
          onClick={handleExport}
          title={activeList ? 'Export list, cycles, events and history' : 'No list to export'}
        >
          <Share2 className="size-4" />
          SHARE
        </ActionButtons>

        <ActionButtons
          hasTargetContent
          onClick={() => fileInputRef.current?.click()}
          title="Import a shared list file, merging into a list with the same name"
        >
          <Upload className="size-4" />
          IMPORT
        </ActionButtons>
      </div>

      <label
        className="flex items-center gap-2 mt-3 cursor-pointer group"
        htmlFor="include-list-state"
      >
        <Switch
          id="include-list-state"
          checked={includeState}
          onCheckedChange={setIncludeState}
          aria-label="Include selection state and history"
        />
        <span className="text-xs font-mono text-text/60 group-hover:text-accent transition-colors">
          Include selection state and history
        </span>
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import list file"
        onChange={handleFileChange}
      />

      {importError && <p className="text-xs font-mono mt-2 text-red-400">{importError}</p>}
    </div>
  );
}

export const ShareListActions = memo(ShareListActionsComponent);
