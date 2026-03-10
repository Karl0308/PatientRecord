import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import type { RecordRequest, TransactionLog, RequestStatus, RecordType, Attachment } from '@/types'
import { mockRequests, mockTransactions } from '@/data/mockData'

interface RecordContextValue {
  requests: RecordRequest[]
  transactions: TransactionLog[]
  pendingCount: number
  submitRequest: (data: {
    patientName: string
    patientEmail: string
    recordType: RecordType
    purpose: string
    notes: string
    supportingDocs: Attachment[]
  }) => void
  approveRequest: (requestId: string, adminName: string, attachments: Attachment[]) => void
  rejectRequest: (requestId: string, adminName: string, reason: string) => void
  getRequestsByName: (name: string) => RecordRequest[]
  getTransactionsByRequest: (requestId: string) => TransactionLog[]
}

const RecordContext = createContext<RecordContextValue | null>(null)

export function RecordProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RecordRequest[]>(mockRequests)
  const [transactions, setTransactions] = useState<TransactionLog[]>(mockTransactions)

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const addTransaction = useCallback((
    requestId: string,
    action: TransactionLog['action'],
    performedBy: string,
    performedByRole: 'Patient' | 'Admin',
    details: string,
  ) => {
    const txn: TransactionLog = {
      id: `TXN-${String(Date.now()).slice(-6)}`,
      requestId,
      action,
      performedBy,
      performedByRole,
      timestamp: new Date().toISOString(),
      details,
    }
    setTransactions(prev => [txn, ...prev])
  }, [])

  const submitRequest = useCallback((data: {
    patientName: string
    patientEmail: string
    recordType: RecordType
    purpose: string
    notes: string
    supportingDocs: Attachment[]
  }) => {
    const now = new Date().toISOString()
    const id = `REQ-${String(Date.now()).slice(-6)}`
    const newReq: RecordRequest = {
      id,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      recordType: data.recordType,
      purpose: data.purpose,
      notes: data.notes,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      processedBy: null,
      processedAt: null,
      rejectionReason: null,
      sentAt: null,
      attachments: [],
      supportingDocs: data.supportingDocs,
    }
    setRequests(prev => [newReq, ...prev])
    addTransaction(id, 'request_submitted', data.patientName, 'Patient',
      `Patient submitted a request for ${data.recordType} records with ${data.supportingDocs.length} supporting document(s).`
    )
  }, [addTransaction])

  const approveRequest = useCallback((requestId: string, adminName: string, attachments: Attachment[]) => {
    const now = new Date().toISOString()
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r
      const updated: RecordRequest = {
        ...r,
        status: 'sent' as RequestStatus,
        processedBy: adminName,
        processedAt: now,
        updatedAt: now,
        sentAt: now,
        attachments,
      }
      return updated
    }))
    const req = requests.find(r => r.id === requestId)
    if (req) {
      const fileNames = attachments.map(a => a.name).join(', ')
      addTransaction(requestId, 'request_approved', adminName, 'Admin',
        `Admin approved the request for ${req.recordType}. ${attachments.length} file(s) attached: ${fileNames}. Auto-sending to ${req.patientEmail}.`
      )
      addTransaction(requestId, 'record_sent', 'System', 'Admin',
        `Records with ${attachments.length} attachment(s) auto-sent to ${req.patientEmail}.`
      )
    }
  }, [requests, addTransaction])

  const rejectRequest = useCallback((requestId: string, adminName: string, reason: string) => {
    const now = new Date().toISOString()
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r
      return {
        ...r,
        status: 'rejected' as RequestStatus,
        processedBy: adminName,
        processedAt: now,
        updatedAt: now,
        rejectionReason: reason,
      }
    }))
    const req = requests.find(r => r.id === requestId)
    if (req) {
      addTransaction(requestId, 'request_rejected', adminName, 'Admin',
        `Admin rejected the request. Reason: ${reason}`
      )
    }
  }, [requests, addTransaction])

  const getRequestsByName = useCallback((name: string) => {
    return requests.filter(r => r.patientName.toLowerCase() === name.toLowerCase())
  }, [requests])

  const getTransactionsByRequest = useCallback((requestId: string) => {
    return transactions.filter(t => t.requestId === requestId)
  }, [transactions])

  return (
    <RecordContext.Provider value={{
      requests,
      transactions,
      pendingCount,
      submitRequest,
      approveRequest,
      rejectRequest,
      getRequestsByName,
      getTransactionsByRequest,
    }}>
      {children}
    </RecordContext.Provider>
  )
}

export function useRecords() {
  const ctx = useContext(RecordContext)
  if (!ctx) throw new Error('useRecords must be used inside RecordProvider')
  return ctx
}
