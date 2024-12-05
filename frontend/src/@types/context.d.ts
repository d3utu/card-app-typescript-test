export interface Entry {
  id?: string;
  title: string;
  description: string;
  created_at: Date | string;
  scheduled_date: Date | string;
}

export type EntryContextType = {
  entries: Entry[];
  darkMode:   boolean;
  saveEntry: (entry: Entry) => void;
  updateEntry: (id: string, entryData: Entry) => void;
  deleteEntry: (id: string) => void;
  toggleDarkMode: () => void;
};
