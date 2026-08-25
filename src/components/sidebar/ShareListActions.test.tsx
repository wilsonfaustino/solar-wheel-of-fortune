import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useNameStore } from '../../stores/useNameStore';
import type { NameList } from '../../types/name';
import { exportListToJSON } from '../../utils/shareList';
import { ShareListActions } from './ShareListActions';

vi.mock('../../utils/shareList', async () => {
  const actual =
    await vi.importActual<typeof import('../../utils/shareList')>('../../utils/shareList');
  return { ...actual, exportListToJSON: vi.fn() };
});

const list: NameList = {
  id: 'list-1',
  title: 'Squad A',
  names: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const sharedFile = JSON.stringify({
  metadata: { exportDate: '2026-01-01T00:00:00.000Z', format: 'name-list-v2' },
  list: {
    title: 'Shared Squad',
    names: [
      { value: 'ALICE', weight: 1, isExcluded: true, selectionCount: 2, lastSelectedAt: null },
    ],
    cycles: [],
    events: [],
    history: [
      { nameValue: 'ALICE', timestamp: '2026-02-01T00:00:00.000Z', sessionId: '', spinDuration: 0 },
    ],
  },
});

function uploadFile(content: string) {
  const file = new File([content], 'list.json', { type: 'application/json' });
  file.text = () => Promise.resolve(content);
  fireEvent.change(screen.getByLabelText('Import list file'), { target: { files: [file] } });
}

describe('ShareListActions', () => {
  beforeEach(() => {
    vi.mocked(exportListToJSON).mockClear();
  });

  it('exports the active list', () => {
    render(<ShareListActions activeList={list} />);

    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(exportListToJSON).toHaveBeenCalledWith(
      list,
      expect.objectContaining({ includeState: true })
    );
  });

  it('disables share when there is no active list', () => {
    render(<ShareListActions activeList={undefined} />);

    expect(screen.getByRole('button', { name: /share/i })).toBeDisabled();
  });

  it('imports a shared list and makes it active', async () => {
    render(<ShareListActions activeList={list} />);

    uploadFile(sharedFile);

    await waitFor(() => {
      const state = useNameStore.getState();
      const active = state.lists.find((item) => item.id === state.activeListId);
      expect(active?.title).toBe('Shared Squad');
      expect(active?.names.map((name) => name.value)).toEqual(['ALICE']);
      expect(active?.names[0].selectionCount).toBe(2);
      expect(state.history.at(-1)).toMatchObject({ nameValue: 'ALICE', listId: active?.id });
    });
  });

  it('excludes selection state when the toggle is off', () => {
    render(<ShareListActions activeList={list} />);

    fireEvent.click(screen.getByLabelText('Include selection state and history'));
    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    expect(exportListToJSON).toHaveBeenCalledWith(
      list,
      expect.objectContaining({ includeState: false })
    );
  });

  it('shows an error for an unrecognized file', async () => {
    render(<ShareListActions activeList={list} />);

    uploadFile('{"foo":1}');

    expect(await screen.findByText('Could not read that list file')).toBeInTheDocument();
  });
});
