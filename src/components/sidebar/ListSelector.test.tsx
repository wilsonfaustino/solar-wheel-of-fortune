import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { NameList } from '../../types/name';

// Mock Radix DropdownMenu to avoid portal/happy-dom issues
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: (event: Event) => void;
  }) => {
    const handleSelect = () => {
      if (onSelect) {
        const mockEvent = new Event('select');
        onSelect(mockEvent);
      }
    };
    return (
      <div
        role="menuitem"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      >
        {children}
      </div>
    );
  },
  Separator: () => <hr />,
}));

import { ListSelector } from './ListSelector';

const makeNames = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `n${index + 1}`,
    value: `Name ${index + 1}`,
    weight: 1,
    createdAt: new Date(),
    lastSelectedAt: null,
    selectionCount: 0,
    isExcluded: false,
    categoryId: null,
  }));

const mockLists: NameList[] = [
  {
    id: 'list-1',
    title: 'Class 1A',
    names: makeNames(2),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'list-2',
    title: 'Class 1B',
    names: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultProps = {
  lists: mockLists,
  activeListId: 'list-1',
  onSelectList: vi.fn(),
  onCreateList: vi.fn(),
  onDeleteList: vi.fn(),
  onRenameList: vi.fn(),
};

describe('ListSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the active list title in the trigger button', () => {
      render(<ListSelector {...defaultProps} />);

      // "Class 1A" appears in both the trigger button and the list items; verify at least one instance exists
      const instances = screen.getAllByText('Class 1A');
      expect(instances.length).toBeGreaterThanOrEqual(1);
    });

    it('should render "No List" when activeListId is null', () => {
      render(<ListSelector {...defaultProps} activeListId={null} />);

      expect(screen.getByText('No List')).toBeInTheDocument();
    });

    it('should render "No List" when activeListId does not match any list', () => {
      render(<ListSelector {...defaultProps} activeListId="nonexistent-list" />);

      expect(screen.getByText('No List')).toBeInTheDocument();
    });

    it('should render all list titles', () => {
      render(<ListSelector {...defaultProps} />);

      expect(screen.getAllByText('Class 1A').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Class 1B')).toBeInTheDocument();
    });

    it('should render name count for each list', () => {
      render(<ListSelector {...defaultProps} />);

      expect(screen.getByText('2 names')).toBeInTheDocument();
      expect(screen.getByText('0 names')).toBeInTheDocument();
    });

    it('should render a "CREATE NEW LIST" option', () => {
      render(<ListSelector {...defaultProps} />);

      expect(screen.getByText('CREATE NEW LIST')).toBeInTheDocument();
    });

    it('should not show edit/delete buttons for the active list', () => {
      render(<ListSelector {...defaultProps} activeListId="list-1" />);

      expect(screen.queryByRole('button', { name: /edit class 1a/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete class 1a/i })).not.toBeInTheDocument();
    });

    it('should show edit/delete buttons for non-active lists', () => {
      render(<ListSelector {...defaultProps} activeListId="list-1" />);

      expect(screen.getByRole('button', { name: /edit class 1b/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete class 1b/i })).toBeInTheDocument();
    });
  });

  describe('list selection', () => {
    it('should call onSelectList with the correct id when a non-active list button is clicked', async () => {
      const onSelectList = vi.fn();
      const user = userEvent.setup();
      render(<ListSelector {...defaultProps} onSelectList={onSelectList} />);

      // The list item button shows list title and name count as children
      const listItemButton = screen.getByText('Class 1B').closest('button');
      if (!listItemButton) throw new Error('List item button not found');
      await user.click(listItemButton);

      expect(onSelectList).toHaveBeenCalledWith('list-2');
    });
  });

  describe('create list', () => {
    it('should call onCreateList when "CREATE NEW LIST" is clicked', async () => {
      const onCreateList = vi.fn();
      const user = userEvent.setup();
      render(<ListSelector {...defaultProps} onCreateList={onCreateList} />);

      const createItem = screen.getByText('CREATE NEW LIST').closest('[role="menuitem"]');
      if (!createItem) throw new Error('CREATE NEW LIST menu item not found');
      await user.click(createItem);

      expect(onCreateList).toHaveBeenCalled();
    });
  });

  describe('delete list', () => {
    it('should call onDeleteList directly when list has 5 or fewer names and is not the only list', async () => {
      const onDeleteList = vi.fn();
      const user = userEvent.setup();
      // list-2 has 0 names and there are 2 lists total
      render(<ListSelector {...defaultProps} onDeleteList={onDeleteList} />);

      const deleteButton = screen.getByRole('button', { name: /delete class 1b/i });
      await user.click(deleteButton);

      expect(onDeleteList).toHaveBeenCalledWith('list-2');
    });

    it('should disable the delete button when only one list exists', () => {
      const singleList = [mockLists[0]];
      // activeListId=null so delete button is rendered for the single list
      render(<ListSelector {...defaultProps} lists={singleList} activeListId={null} />);

      const deleteButton = screen.getByRole('button', { name: /delete class 1a/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should show confirmation dialog when deleting a list with more than 5 names', async () => {
      const onDeleteList = vi.fn();
      const user = userEvent.setup();
      const listWithManyNames: NameList = {
        id: 'list-2',
        title: 'Class 1B',
        names: makeNames(6),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const listsWithManyNames = [mockLists[0], listWithManyNames];
      render(
        <ListSelector {...defaultProps} lists={listsWithManyNames} onDeleteList={onDeleteList} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete class 1b/i });
      await user.click(deleteButton);

      expect(onDeleteList).not.toHaveBeenCalled();
      expect(screen.getByText('Delete List?')).toBeInTheDocument();
    });

    it('should call onDeleteList when confirming deletion of a list with more than 5 names', async () => {
      const onDeleteList = vi.fn();
      const user = userEvent.setup();
      const listWithManyNames: NameList = {
        id: 'list-2',
        title: 'Class 1B',
        names: makeNames(6),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const listsWithManyNames = [mockLists[0], listWithManyNames];
      render(
        <ListSelector {...defaultProps} lists={listsWithManyNames} onDeleteList={onDeleteList} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete class 1b/i });
      await user.click(deleteButton);

      // Confirm the deletion via the dialog
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(confirmButton);

      expect(onDeleteList).toHaveBeenCalledWith('list-2');
    });

    it('should close the confirmation dialog when cancelled', async () => {
      const user = userEvent.setup();
      const listWithManyNames: NameList = {
        id: 'list-2',
        title: 'Class 1B',
        names: makeNames(6),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const listsWithManyNames = [mockLists[0], listWithManyNames];
      render(<ListSelector {...defaultProps} lists={listsWithManyNames} />);

      const deleteButton = screen.getByRole('button', { name: /delete class 1b/i });
      await user.click(deleteButton);

      expect(screen.getByText('Delete List?')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByText('Delete List?')).not.toBeInTheDocument();
    });
  });

  describe('rename list (edit mode)', () => {
    it('should show a text input when the edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ListSelector {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit class 1b/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Class 1B');
    });

    it('should call onRenameList and exit edit mode when Enter is pressed', async () => {
      const onRenameList = vi.fn();
      const user = userEvent.setup();
      render(<ListSelector {...defaultProps} onRenameList={onRenameList} />);

      const editButton = screen.getByRole('button', { name: /edit class 1b/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'New Name');
      await user.keyboard('{Enter}');

      expect(onRenameList).toHaveBeenCalledWith('list-2', 'New Name');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should exit edit mode without calling onRenameList when Escape is pressed', async () => {
      const onRenameList = vi.fn();
      const user = userEvent.setup();
      render(<ListSelector {...defaultProps} onRenameList={onRenameList} />);

      const editButton = screen.getByRole('button', { name: /edit class 1b/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      // Use fireEvent.keyDown directly on the input to trigger the onKeyDown handler
      // without triggering the onBlur handler (which would call onRenameList)
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onRenameList).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should call onRenameList and exit edit mode when input loses focus', async () => {
      const onRenameList = vi.fn();
      const user = userEvent.setup();
      render(<ListSelector {...defaultProps} onRenameList={onRenameList} />);

      const editButton = screen.getByRole('button', { name: /edit class 1b/i });
      await user.click(editButton);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Blurred Name');
      await user.tab();

      expect(onRenameList).toHaveBeenCalledWith('list-2', 'Blurred Name');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
