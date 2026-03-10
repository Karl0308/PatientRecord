import { useMemo, useState } from 'react'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, FileText, Clock, CheckCircle, XCircle, Send, X } from 'lucide-react'
import { format } from 'date-fns'
import type { RequestStatus } from '@/types'

const statusConfig: Record<RequestStatus, { label: string; variant: 'warning' | 'success' | 'critical' | 'info'; icon: React.ReactNode }> = {
  pending:  { label: 'Pending',  variant: 'warning', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', variant: 'info',    icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: 'Rejected', variant: 'critical', icon: <XCircle className="h-3 w-3" /> },
  sent:     { label: 'Sent',     variant: 'success', icon: <Send className="h-3 w-3" /> },
}

export default function AllRequests() {
  const { requests } = useRecords()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const recordTypes = useMemo(() => {
    const types = new Set(requests.map(r => r.recordType))
    return Array.from(types).sort()
  }, [requests])

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = search === '' ||
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.patientEmail.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      const matchType = typeFilter === 'all' || r.recordType === typeFilter
      return matchSearch && matchStatus && matchType
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [requests, search, statusFilter, typeFilter])

  const hasFilters = search !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  function clearFilters() {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">All Requests</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage all patient record requests</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base">{filtered.length} Request{filtered.length !== 1 ? 's' : ''}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient..."
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 h-9 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {recordTypes.map(rt => (
                    <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Request ID</th>
                    <th className="pb-3 font-medium text-muted-foreground">Patient</th>
                    <th className="pb-3 font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 font-medium text-muted-foreground">Record Type</th>
                    <th className="pb-3 font-medium text-muted-foreground">Purpose</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Submitted</th>
                    <th className="pb-3 font-medium text-muted-foreground">Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => {
                    const sc = statusConfig[req.status]
                    return (
                      <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-mono text-xs">{req.id}</td>
                        <td className="py-3 font-medium">{req.patientName}</td>
                        <td className="py-3 text-muted-foreground">{req.patientEmail}</td>
                        <td className="py-3">{req.recordType}</td>
                        <td className="py-3 max-w-[180px] truncate">{req.purpose}</td>
                        <td className="py-3">
                          <Badge variant={sc.variant} className="gap-1">
                            {sc.icon}
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{format(new Date(req.createdAt), 'MMM d, yyyy')}</td>
                        <td className="py-3 text-muted-foreground">{req.processedBy ?? '-'}</td>
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
