import { useMemo, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Clock, CheckCircle, XCircle, Mail, FileText, Calendar, Paperclip, X, Upload, Send } from 'lucide-react'
import { format } from 'date-fns'
import type { RecordRequest, Attachment } from '@/types'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PendingApproval() {
  const { user } = useAuth()
  const { requests, approveRequest, rejectRequest } = useRecords()

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<RecordRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Approve dialog state (with attachments)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [approveTarget, setApproveTarget] = useState<RecordRequest | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detail dialog
  const [detailRequest, setDetailRequest] = useState<RecordRequest | null>(null)

  const pending = useMemo(() => {
    return requests
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [requests])

  function openApproveDialog(req: RecordRequest) {
    setApproveTarget(req)
    setAttachments([])
    setApproveDialogOpen(true)
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newAttachments: Attachment[] = Array.from(files).map(f => ({
      id: `ATT-${String(Date.now()).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  function handleApproveAndSend() {
    if (!user || !approveTarget) return
    if (attachments.length === 0) return
    setSending(true)
    // Simulate sending delay
    setTimeout(() => {
      approveRequest(approveTarget.id, user.name, attachments)
      setSending(false)
      setApproveDialogOpen(false)
      setApproveTarget(null)
      setAttachments([])
    }, 1200)
  }

  function openRejectDialog(req: RecordRequest) {
    setRejectTarget(req)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  function handleReject() {
    if (!user || !rejectTarget || !rejectionReason.trim()) return
    rejectRequest(rejectTarget.id, user.name, rejectionReason.trim())
    setRejectDialogOpen(false)
    setRejectTarget(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pending Approval</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review requests, attach record files, and send them to the patient's email.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No pending requests to review.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pending.map(req => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{req.patientName}</CardTitle>
                    <CardDescription className="font-mono text-xs">{req.id}</CardDescription>
                  </div>
                  <Badge variant="warning" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{req.patientEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>{req.recordType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{format(new Date(req.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span>{req.supportingDocs.length} ID doc(s)</span>
                  </div>
                </div>

                {/* Supporting docs from patient */}
                {req.supportingDocs.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5">
                    <p className="text-xs font-medium text-amber-700 mb-1.5">Supporting Documents (Identity Proof)</p>
                    <div className="space-y-1">
                      {req.supportingDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2 text-xs text-amber-800">
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Purpose</p>
                  <p className="text-sm">{req.purpose}</p>
                  {req.notes && (
                    <>
                      <p className="text-xs font-medium text-muted-foreground mb-1 mt-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{req.notes}</p>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => openApproveDialog(req)}
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach & Send
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openRejectDialog(req)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailRequest(req)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Approve & Attach Dialog ── */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve & Send Records</DialogTitle>
            <DialogDescription>
              Attach the requested record files for <strong>{approveTarget?.patientName}</strong>.
              Files will be sent to <strong>{approveTarget?.patientEmail}</strong>.
            </DialogDescription>
          </DialogHeader>

          {approveTarget && (
            <div className="space-y-4">
              {/* Request summary */}
              <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request</span>
                  <span className="font-mono text-xs">{approveTarget.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Record Type</span>
                  <span className="font-medium">{approveTarget.recordType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Send to</span>
                  <span className="font-medium">{approveTarget.patientEmail}</span>
                </div>
              </div>

              {/* File upload area */}
              <div className="space-y-2">
                <Label>Attach Files *</Label>
                <div
                  className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, images, documents - any file type</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.txt"
                />
              </div>

              {/* Attached files list */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>{attachments.length} file(s) attached</Label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{att.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">({formatFileSize(att.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeAttachment(att.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleApproveAndSend} disabled={attachments.length === 0 || sending}>
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Approve & Send to Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectTarget?.patientName}'s request for {rejectTarget?.recordType}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Rejection Reason *</Label>
            <Textarea
              placeholder="Explain why this request is being rejected..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={!!detailRequest} onOpenChange={() => setDetailRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>{detailRequest?.id}</DialogDescription>
          </DialogHeader>
          {detailRequest && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Patient Name</p>
                  <p className="font-medium">{detailRequest.patientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{detailRequest.patientEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Record Type</p>
                  <p className="font-medium">{detailRequest.recordType}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Purpose</p>
                  <p className="font-medium">{detailRequest.purpose}</p>
                </div>
                {detailRequest.notes && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Notes</p>
                    <p>{detailRequest.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">Submitted</p>
                  <p>{format(new Date(detailRequest.createdAt), 'MMM d, yyyy - h:mm a')}</p>
                </div>
              </div>
              {detailRequest.supportingDocs.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-xs font-medium text-amber-700 mb-1.5">Supporting Documents (Identity Proof)</p>
                  <div className="space-y-1">
                    {detailRequest.supportingDocs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 text-xs text-amber-800">
                        <Paperclip className="h-3 w-3 shrink-0" />
                        <span>{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
