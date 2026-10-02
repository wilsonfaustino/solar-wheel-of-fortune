import { Link, Radio } from 'lucide-react';
import { memo, useState } from 'react';
import { isRoomSyncConfigured, loadRoomSync } from '../../lib/roomSyncLoader';
import { useNameStore } from '../../stores/useNameStore';
import { ActionButtons } from './names-list/ActionButtons';

type LiveRoomStatus = 'idle' | 'sharing' | 'copied' | 'share-failed' | 'copy-failed';

// Long enough to read the confirmation, short enough to copy again soon
const COPIED_FEEDBACK_MS = 2000;

const ERROR_MESSAGES: Partial<Record<LiveRoomStatus, string>> = {
  'share-failed': 'Could not start the live room',
  'copy-failed': 'Could not copy the link. Copy it from the address bar.',
};

function LiveRoomActionsComponent() {
  const roomId = useNameStore((state) => state.lists.find((list) => list.roomId)?.roomId);
  const [status, setStatus] = useState<LiveRoomStatus>('idle');

  const copyRoomLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#${id}`
      );
      setStatus('copied');
      setTimeout(() => setStatus('idle'), COPIED_FEEDBACK_MS);
    } catch {
      setStatus('copy-failed');
    }
  };

  const handleShare = async () => {
    setStatus('sharing');
    let sharedRoomId: string;
    try {
      const { shareRoom } = await loadRoomSync();
      sharedRoomId = await shareRoom();
    } catch {
      setStatus('share-failed');
      return;
    }
    await copyRoomLink(sharedRoomId);
  };

  if (!isRoomSyncConfigured) return null;

  return (
    <div className="px-4 pb-4">
      {roomId ? (
        <>
          <p className="text-xs font-mono text-accent mb-2">
            LIVE ROOM: edits sync with everyone who has the link
          </p>
          <ActionButtons
            hasTargetContent
            onClick={() => copyRoomLink(roomId)}
            title="Copy the live room link"
            className="w-full"
          >
            <Link className="size-4" />
            {status === 'copied' ? 'COPIED' : 'COPY LINK'}
          </ActionButtons>
        </>
      ) : (
        <ActionButtons
          hasTargetContent={status !== 'sharing'}
          onClick={handleShare}
          title="Move every list into a live room. Anyone with the link can edit."
          className="w-full"
        >
          <Radio className="size-4" />
          SHARE LIVE
        </ActionButtons>
      )}

      {ERROR_MESSAGES[status] && (
        <p className="text-xs font-mono mt-2 text-red-400">{ERROR_MESSAGES[status]}</p>
      )}
    </div>
  );
}

export const LiveRoomActions = memo(LiveRoomActionsComponent);
