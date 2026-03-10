import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, FilePlus, Search, Clock, CheckCircle, XCircle, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import type { RequestStatus } from '@/types'

const statusConfig: Record<RequestStatus, { label: string; variant: 'warning' | 'success' | 'critical' | 'info'; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  variant: 'warning', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', variant: 'info',    icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'critical', icon: <XCircle className="h-3 w-3" /> },
  sent:     { label: 'Sent',     variant: 'success', icon: <Send className="h-3 w-3" /> },
}

export default function MyRequests() {
  const { user } = useAuth()
  const { getRequestsByName } = useRecords()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const myRequests = useMemo(() => {
    if (!user) return []
    return getRequestsByName(user.name)
  }, [user, getRequestsByName])

  const filtered = useMemo(() => {
    return myRequests.filter(r => {
      const matchSearch = search === '' ||
        r.recordType.toLowerCase().includes(search.toLowerCase()) ||
        r.purpose.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [myRequests, search, statusFilter])

  const stats = useMemo(() => ({
    total: myRequests.length,
    pending: myRequests.filter(r => r.status === 'pending').length,
    sent: myRequests.filter(r => r.status === 'sent').length,
    rejected: myRequests.filter(r => r.status === 'rejected').length,
  }), [myRequests])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Record Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">View and track your medical record requests</p>
        </div>
        <Button onClick={() => navigate('/new-request')}>
          <FilePlus className="h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent to Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Request History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-8 w-48 h-9 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm mt-1">Submit a new request to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Request ID</th>
                    <th className="pb-3 font-medium text-muted-foreground">Record Type</th>
                    <th className="pb-3 font-medium text-muted-foreground">Purpose</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Submitted</th>
                    <th className="pb-3 font-medium text-muted-foreground">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => {
                    const sc = statusConfig[req.status]
                    return (
                      <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-mono text-xs">{req.id}</td>
                        <td className="py-3">{req.recordType}</td>
                        <td className="py-3 max-w-[200px] truncate">{req.purpose}</td>
                        <td className="py-3">
                          <Badge variant={sc.variant} className="gap-1">
                            {sc.icon}
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{format(new Date(req.createdAt), 'MMM d, yyyy')}</td>
                        <td className="py-3 text-muted-foreground">{format(new Date(req.updatedAt), 'MMM d, yyyy')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
