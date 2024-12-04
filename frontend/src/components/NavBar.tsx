import {NavLink} from 'react-router-dom';
import {useContext, useState} from 'react'
import { EntryContext } from '../utilities/globalContext'
import { EntryContextType, Entry } from '../@types/context'

export default function NavBar(){
  const {darkMode, toggleDarkMode} = useContext(EntryContext) as EntryContextType
  const [isDialogOpen, setIsDialogOpen] = useState(false);

    return(
      <>
      <nav className="flex justify-center gap-5">
        <NavLink className="m-3 p-4 text-xl dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-500 rounded-md font-medium text-white" to={'/'}>All Entries</NavLink>
        <NavLink className="m-3 p-4 text-xl dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-500 rounded-md font-medium text-white" to={'/create'}>New Entry</NavLink>
        <button onClick={() => setIsDialogOpen(true)} className="m-3 p-4 text-xl dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-400 hover:bg-gray-500 rounded-md font-medium text-white">Settings</button>
      </nav>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-600 rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Settings</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                Close
              </button>
            </div>
              <button onClick={toggleDarkMode} className="m-3 p-4 text-xl dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-500 rounded-md font-medium text-white">
                {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
              </button>
          </div>
        </div>
      )}
      </>
    )
}