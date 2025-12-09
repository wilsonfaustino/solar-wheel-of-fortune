export interface Name {
  id: string;
  value: string;
  weight: number;
  createdAt: Date;
  lastSelectedAt: Date | null;
  selectionCount: number;
  isExcluded: boolean;
  categoryId: string | null;
}

export interface NameList {
  id: string;
  title: string;
  description?: string;
  names: Name[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SelectionRecord {
  id: string;
  nameId: string;
  nameValue: string;
  listId: string;
  timestamp: Date;
  sessionId: string;
  spinDuration: number;
}
