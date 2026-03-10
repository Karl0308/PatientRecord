import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, FileText, CheckCircle, XCircle, Send, Clock } from 'lucide-react'
import { format } from 'date-fns'
import type { TransactionAction } from '@/types'

const actionConfig: Record<TransactionAction, { label: string; variant: 'info' | 'success' | 'critical' | 'warning' | 'purple'; icon: React.ReactNode }> = {
  request_submitted: { label: 'Submitted',  variant: 'info',    icon: <FileText className="h-3 w-3" /> },
  request_approved:  { label: 'Approved',   variant: 'success', icon: <CheckCircle className="h-3 w-3" /> },
  request_rejected:  { label: 'Rejected',   variant: 'critical', icon: <XCircle className="h-3 w-3" /> },
  record_sent:       { label: 'Sent',       variant: 'purple',  icon: <Send className="h-3 w-3" /> },
  request_cancelled: { label: 'Cancelled',  variant: 'warning', icon: <Clock className="h-3 w-3" /> },
}

export default function MyHistory() {
  const { user } = useAuth()
  const { getRequestsByName, transactions } = useRecords()

  const myRequests = useMemo(() => {
    if (!user) return []
    return getRequestsByName(user.name)
  }, [user, getRequestsByName])

  const myRequestIds = useMemo(() => new Set(myRequests.map(r => r.id)), [myRequests])

  const myTransactions = useMemo(() => {
    return transactions
      .filter(t => myRequestIds.has(t.requestId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [transactions, myRequestIds])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My History</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete activity log for your record requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No history yet</p>
              <p className="text-sm mt-1">Your activity will appear here once you submit a request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myTransactions.map(txn => {
                const ac = actionConfig[txn.action]
                return (
                  <div key={txn.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {ac.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={ac.variant} className="gap-1 text-[10px]">
                          {ac.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">{txn.requestId}</span>
                      </div>
                      <p className="text-sm text-foreground">{txn.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(txn.timestamp), 'MMM d, yyyy - h:mm a')} | by {txn.performedBy}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
