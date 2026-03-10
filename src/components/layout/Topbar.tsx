import { Bell, Search, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useRecords } from '@/context/RecordContext'
import { useLocation, useNavigate } from 'react-router-dom'

const adminPageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/requests': 'All Requests',
  '/pending': 'Pending Approval',
  '/patients': 'Patients',
  '/transactions': 'Transaction Logs',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

const patientPageTitles: Record<string, string> = {
  '/': 'My Requests',
  '/new-request': 'New Request',
  '/my-history': 'My History',
  '/settings': 'Settings',
}

interface TopbarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Topbar({ onToggle }: TopbarProps) {
  const { pendingCount } = useRecords()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'Admin'
  const pageTitles = isAdmin ? adminPageTitles : patientPageTitles

  const title = Object.entries(pageTitles).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] ?? 'PatientRecord'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." className="pl-8 w-56 h-9 text-sm" />
        </div>

        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/pending')}
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </Button>
        )}

        <div
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs cursor-default"
          title={`${user?.name} - ${user?.role}`}
        >
          {user?.initials ?? '?'}
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </header>
  )
}
