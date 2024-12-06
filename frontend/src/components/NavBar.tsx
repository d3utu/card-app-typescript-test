import {NavLink} from 'react-router-dom';
import {useContext, useState} from 'react'
import { EntryContext } from '../utilities/globalContext'
import { EntryContextType, Entry } from '../@types/context'

export default function NavBar(){
    return(
      <nav className="flex justify-center gap-5">
        <NavLink className="m-3 p-4 text-xl dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-500 rounded-md font-medium text-white" to={'/'}>All Entries</NavLink>
        <NavLink className="m-3 p-4 text-xl dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-500 rounded-md font-medium text-white" to={'/create'}>New Entry</NavLink>
        <NavLink className="m-3 p-4 text-xl dark:bg-gray-600 dark:hover:bg-gray-800 bg-gray-400 hover:bg-gray-500 rounded-md font-medium text-white" to={"/settings"}>Settings</NavLink>
      </nav>
    )
}