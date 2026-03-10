import { useState, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, CheckCircle, Upload, Paperclip, X, ShieldCheck } from 'lucide-react'
import type { RecordType, Attachment } from '@/types'

const RECORD_TYPES: RecordType[] = [
  'Medical History',
  'Lab Results',
  'Prescription Records',
  'Imaging / X-Ray',
  'Vaccination Records',
  'Surgical Records',
  'Dental Records',
  'Billing Summary',
  'Referral Letter',
  'Other',
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NewRequest() {
  const { user } = useAuth()
  const { submitRequest } = useRecords()
  const navigate = useNavigate()

  const [recordType, setRecordType] = useState<RecordType | ''>('')
  const [purpose, setPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [supportingDocs, setSupportingDocs] = useState<Attachment[]>([])
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newDocs: Attachment[] = Array.from(files).map(f => ({
      id: `SD-${String(Date.now()).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
    }))
    setSupportingDocs(prev => [...prev, ...newDocs])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeDoc(id: string) {
    setSupportingDocs(prev => prev.filter(d => d.id !== id))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !recordType || supportingDocs.length === 0) return

    submitRequest({
      patientName: user.name,
      patientEmail: user.email,
      recordType: recordType as RecordType,
      purpose,
      notes,
      supportingDocs,
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Request Submitted!</h2>
        <p className="text-muted-foreground">
          Your record request has been submitted successfully. The admin will review your identity documents and process your request.
          You will receive the records via email once approved.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <Button variant="outline" onClick={() => navigate('/')}>
            View My Requests
          </Button>
          <Button onClick={() => { setSubmitted(false); setRecordType(''); setPurpose(''); setNotes(''); setSupportingDocs([]) }}>
            Submit Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">New Record Request</h2>
          <p className="text-sm text-muted-foreground mt-1">Fill in the details to request your medical records</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Information</CardTitle>
          <CardDescription>Your details from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={user?.name ?? ''} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={user?.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground">Records will be sent to this email upon approval.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Identity Verification
          </CardTitle>
          <CardDescription>Upload a valid ID to verify your identity before records are released.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="border-2 border-dashed border-input rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to upload supporting documents</p>
            <p className="text-xs text-muted-foreground mt-1">
              Valid ID, passport, driver's license, PhilHealth card, etc.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />

          {supportingDocs.length > 0 && (
            <div className="space-y-1.5">
              {supportingDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{doc.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({formatFileSize(doc.size)})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeDoc(doc.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {supportingDocs.length === 0 && (
            <p className="text-xs text-amber-600 font-medium">
              * At least one supporting document is required
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request Details</CardTitle>
          <CardDescription>Specify what records you need</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recordType">Record Type *</Label>
              <Select value={recordType} onValueChange={(v) => setRecordType(v as RecordType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select record type..." />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_TYPES.map(rt => (
                    <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                placeholder="e.g. For employment health requirement"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Provide any specific details about the records you need..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" disabled={!recordType || !purpose || supportingDocs.length === 0}>
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
