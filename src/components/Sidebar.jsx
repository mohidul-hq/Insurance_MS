export default function Sidebar({ open, setView, current }) {
  const link = (key, label) => (
    <button
      key={key}
      onClick={() => setView(key)}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${current === key ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-500 text-white shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
    >
      {label}
    </button>
  )

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64 p-3 space-y-1 fixed inset-y-14 left-0 z-30 transform transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      {link('dashboard', 'Dashboard')}
      {link('list', 'All Policies')}
      {link('lookup', 'Find Policy')}
      {link('create', 'Add New Policy')}
    </aside>
  )
}
