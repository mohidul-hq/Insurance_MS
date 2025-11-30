import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import PolicyTable from './components/PolicyTable'
import PolicyForm from './components/PolicyForm'
import PolicyDetailsModal from './components/PolicyDetailsModal'
import PolicyLookup from './components/PolicyLookup'
import Dashboard from './components/Dashboard'
import { config } from './lib/appwriteClient'
import Login from './components/Login'
import { useAuth } from './components/AuthProvider'

function App() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState('list') // 'dashboard' | 'list' | 'lookup' | 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const bucketIds = useMemo(() => ({ policyBucketId: config.POLICY_BUCKET_ID }), [])

  const openView = (key) => {
    setView(key)
    setSelected(null)
    setSidebarOpen(false)
  }

  const onEdit = (item) => { setSelected(item); setView('edit') }
  const onView = (item) => { setSelected(item); setView('list'); setDetailsOpen(true) }
  const [detailsOpen, setDetailsOpen] = useState(false)

  // After login, land on dashboard by default
  useEffect(() => {
    if (user) setView('dashboard')
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading…</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-full theme-container">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex">
          <Sidebar open={sidebarOpen} setView={openView} current={view} />
          <main className="flex-1 lg:pl-64 w-full">
            <div className="pb-8 space-y-4">
              {view === 'dashboard' && (
                <Dashboard
                  onOpenList={() => openView('list')}
                  onOpenCreate={() => openView('create')}
                  onOpenLookup={() => openView('lookup')}
                />
              )}

              {view === 'list' && (
                <PolicyTable onView={(it) => { onView(it) }} onEdit={(it) => onEdit(it)} />
              )}

              {view === 'lookup' && (
                <PolicyLookup />
              )}

              {view === 'create' && (
                <PolicyForm initial={null} onCancel={() => openView('list')} onSaved={() => openView('list')} />
              )}

              {view === 'edit' && (
                <PolicyForm initial={selected} onCancel={() => openView('list')} onSaved={() => openView('list')} />
              )}
            </div>
          </main>
        </div>
      </div>

      <PolicyDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        policy={selected}
        policyBucketId={bucketIds.policyBucketId}
      />
    </div>
  )
}

export default App
