import { useContext } from "react";
import { EntryContext } from "../utilities/globalContext";
import { EntryContextType } from "../@types/context";

export default function SettingsDialog() {
  const { darkMode, toggleDarkMode } = useContext(EntryContext) as EntryContextType;

  return (
    <section className="flex dark:bg-gray-600 justify-center flex-col w-fit ml-auto mr-auto mt-10 gap-5 bg-gray-300 p-8 rounded-md">

          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Settings</h2>
        <button
          onClick={toggleDarkMode}
          className="m-3 p-4 text-xl dark:bg-slate-700 dark:hover:bg-slate-900 bg-blue-400 hover:bg-blue-500 rounded-md font-medium text-white"
        >
          {darkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
        </button>
    </section>
  );
}
