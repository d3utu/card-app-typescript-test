import {createContext , useState, FC, ReactNode, useEffect} from 'react'
import {Entry, EntryContextType} from '../@types/context'
import axios from 'axios'

export const EntryContext = createContext<EntryContextType | null>(null);

export const EntryProvider: React.FC<{children : ReactNode}> = ({children}) => {
    const [entries, setEntries] = useState<Entry[]>([]);

    const [darkMode, setDarkMode] = useState<boolean>(() => {
      return localStorage.getItem('darkMode') === 'true';
    });

    const initState = async () => {
        const data = await axios.get<Entry[]>('http://localhost:3001/get/')
        const initialStateBody = data.data
        setEntries(initialStateBody)
    }

    const toggleDarkMode = () => {
      setDarkMode((prev) => {
        const newMode = !prev;

        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('darkMode', newMode.toString());
        return newMode;
      });
    };

    useEffect(() => {
      // Apply the stored dark mode preference on initial load
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, [darkMode]);

    useEffect(() => {
        initState()
      }, []);

    const saveEntry = async (entry: Entry) => {
        const requestData = await axios.post<Entry>('http://localhost:3001/create/', entry)
        const newEntry = requestData.data
        setEntries([...entries, newEntry])
      }

    const updateEntry = async (id: string, entry: Entry) => {
        await axios.put<Entry>(`http://localhost:3001/update/${id}`, entry)
        setEntries(entries => {
          const entryIndex = entries.findIndex((obj => obj.id == id))
          entries[entryIndex] = entry
          console.log(entries)
          return entries
        })
    }
    const deleteEntry = async (id: string) => {
        await axios.delete<Entry>(`http://localhost:3001/delete/${id}`)
        setEntries(e => e.filter(entry => entry.id != id))
    }
    return (
        <EntryContext.Provider value={{ entries, saveEntry, updateEntry, deleteEntry, darkMode, toggleDarkMode }}>
          {children}
        </EntryContext.Provider>
      )
}

