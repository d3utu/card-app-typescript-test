import {useState, useContext, ChangeEvent, MouseEvent} from 'react'
import {EntryContext} from '../utilities/globalContext'
import {Entry, EntryContextType} from '../@types/context'

export default function NewEntry(){
    const emptyEntry: Entry = {title: "", description: "",created_at: new Date(), scheduled_date: new Date()}
    const { saveEntry } = useContext(EntryContext) as EntryContextType
    const [newEntry,setNewEntry] = useState<Entry>(emptyEntry)
    const handleInputChange = (event: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        setNewEntry({
            ...newEntry,
            [event.target.name] : event.target.value
        })
    }
    const handleSend = (e: MouseEvent<HTMLButtonElement>) => {
        saveEntry(newEntry)
        setNewEntry(emptyEntry)
    }
    return(
        <section className="flex dark:bg-gray-600 justify-center flex-col w-fit ml-auto mr-auto mt-10 gap-5 bg-gray-300 p-8 rounded-md">
            <input className="p-3 dark:text-black rounded-md" type="text" placeholder="Title" name="title" value={newEntry.title} onChange={handleInputChange}/>
            <textarea className="p-3 dark:text-black rounded-md" placeholder="Description" name="description" value={newEntry.description} onChange={handleInputChange}/>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
                Created At:
                <input className="p-3 dark:text-black rounded-md mt-1 block" type="date" name="created_at" value={(new Date(newEntry.created_at)).toISOString().split('T')[0]} onChange={handleInputChange}/>
            </label>
            <label className="font-semibold text-gray-700 dark:text-gray-300">
                Scheduled Date:
            <input className="p-3 dark:text-black rounded-md mt-1 block" type="date" name="scheduled_date" value={(new Date(newEntry.scheduled_date)).toISOString().split('T')[0]} onChange={handleInputChange}/>
            </label>
            <button onClick={(e) => {handleSend(e)}} className="dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-600 font-semibold text-white p-3 rounded-md">Create</button>
        </section>
    )
}