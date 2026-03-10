import { useMemo, useState } from 'react'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, ShieldCheck, FileText, CheckCircle, XCircle, Send, Clock, X } from 'lucide-react'
import { format } from 'date-fns'
import type { TransactionAction } from '@/types'

const actionConfig: Record<TransactionAction, { label: string; variant: 'info' | 'success' | 'critical' | 'warning' | 'purple'; icon: React.ReactNode }> = {
  request_submitted: { label: 'Submitted',  variant: 'info',    icon: <FileText className="h-3 w-3" /> },
  request_approved:  { label: 'Approved',   variant: 'success', icon: <CheckCircle className="h-3 w-3" /> },
  request_rejected:  { label: 'Rejected',   variant: 'critical', icon: <XCircle className="h-3 w-3" /> },
  record_sent:       { label: 'Sent',       variant: 'purple',  icon: <Send className="h-3 w-3" /> },
  request_cancelled: { label: 'Cancelled',  variant: 'warning', icon: <Clock className="h-3 w-3" /> },
}

export default function TransactionLogs() {
  const { transactions } = useRecords()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const sorted = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter(t => {
        const matchSearch = search === '' ||
          t.details.toLowerCase().includes(search.toLowerCase()) ||
          t.requestId.toLowerCase().includes(search.toLowerCase()) ||
          t.performedBy.toLowerCase().includes(search.toLowerCase())
        const matchAction = actionFilter === 'all' || t.action === actionFilter
        return matchSearch && matchAction
      })
  }, [transactions, search, actionFilter])

  const hasFilters = search !== '' || actionFilter !== 'all'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Transaction Logs</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all record request activities</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {sorted.length} Transaction{sorted.length !== 1 ? 's' : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8 w-48 h-9 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="request_submitted">Submitted</SelectItem>
                  <SelectItem value="request_approved">Approved</SelectItem>
                  <SelectItem value="request_rejected">Rejected</SelectItem>
                  <SelectItem value="record_sent">Sent</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setActionFilter('all') }} className="h-9 text-xs">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Timestamp</th>
                    <th className="pb-3 font-medium text-muted-foreground">Request ID</th>
                    <th className="pb-3 font-medium text-muted-foreground">Action</th>
                    <th className="pb-3 font-medium text-muted-foreground">Performed By</th>
                    <th className="pb-3 font-medium text-muted-foreground">Role</th>
                    <th className="pb-3 font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(txn => {
                    const ac = actionConfig[txn.action]
                    return (
                      <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(txn.timestamp), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="py-3 font-mono text-xs">{txn.requestId}</td>
                        <td className="py-3">
                          <Badge variant={ac.variant} className="gap-1">
                            {ac.icon}
                            {ac.label}
                          </Badge>
                        </td>
                        <td className="py-3">{txn.performedBy}</td>
                        <td className="py-3">
                          <Badge variant={txn.performedByRole === 'Admin' ? 'default' : 'secondary'} className="text-[10px]">
                            {txn.performedByRole}
                          </Badge>
                        </td>
                        <td className="py-3 max-w-[300px] truncate text-muted-foreground">{txn.details}</td>
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
