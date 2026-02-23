import { categories } from '@/utils/consitants/consitaint';

interface SidebarProps {
  setCateID: (id: string) => void;
  isSidebarOpen: boolean;
  activeCategory: string;
}

export const AdminSidebar = ({ setCateID, isSidebarOpen, activeCategory }: SidebarProps) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black border-r dark:border-slate-800 transform transition-transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="p-6 border-b dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        <p className="text-blue-100 text-sm">Tool Manager</p>
      </div>

      <nav className="p-4 py-2 space-y-1">
        {categories.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCateID(cat.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer text-sm font-bold
                ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              {cat.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};