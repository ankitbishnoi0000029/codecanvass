import { LogOutIcon, Menu, Plus } from 'lucide-react';

interface AdminHeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onAdd: () => void;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export const AdminHeader = ({
  theme,
  toggleTheme,
  onAdd,
  onLogout,
  onMenuToggle,
}: AdminHeaderProps) => {
  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-black border-b dark:border-slate-800 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden">
          <Menu />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Add Tool
        </button>

        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <LogOutIcon size={18} /> Logout
        </button>
      </div>
    </div>
  );
};