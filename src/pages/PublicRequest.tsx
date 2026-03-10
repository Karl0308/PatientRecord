import { useState, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, CheckCircle, ArrowRight, Upload, Paperclip, X, ShieldCheck } from 'lucide-react'
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

export default function PublicRequest() {
  const { submitRequest } = useRecords()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [recordType, setRecordType] = useState<RecordType | ''>('')
  const [purpose, setPurpose] = useState('')
  const [notes, setNotes] = useState('')
  const [supportingDocs, setSupportingDocs] = useState<Attachment[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState('')
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
    if (!recordType || !fullName || !email || !purpose || supportingDocs.length === 0) return

    submitRequest({
      patientName: fullName.trim(),
      patientEmail: email.trim(),
      recordType: recordType as RecordType,
      purpose: purpose.trim(),
      notes: notes.trim(),
      supportingDocs,
    })

    setSubmittedId(`REQ-${String(Date.now()).slice(-6)}`)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Request Submitted!</h2>
          <p className="text-muted-foreground">
            Your record request <span className="font-mono font-semibold text-foreground">{submittedId}</span> has been submitted successfully.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left space-y-1">
            <p className="font-medium">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Our admin team will verify your identity using your uploaded documents</li>
              <li>Once verified and approved, records will be sent to <strong>{email}</strong></li>
              <li>You will receive the files as email attachments</li>
              <li>If rejected, you will be notified with a reason</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setFullName('')
                setEmail('')
                setRecordType('')
                setPurpose('')
                setNotes('')
                setSupportingDocs([])
              }}
            >
              Submit Another Request
            </Button>
            <Button onClick={() => navigate('/login')}>
              <ArrowRight className="h-4 w-4" />
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Request Your Records</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the form below to request your medical records. No account needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identification */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Your Information</CardTitle>
              <CardDescription>Tell us who you are so we can find your records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Juan Dela Cruz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Must match the name in our clinic records</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. juan@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Records will be sent to this email upon approval.</p>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Identity Verification
              </CardTitle>
              <CardDescription>
                Upload a valid ID or any document to prove your identity. This helps us ensure records go to the right person.
              </CardDescription>
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

          {/* Request Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Request Details</CardTitle>
              <CardDescription>Specify what records you need and why.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="recordType">Record Type *</Label>
                <Select value={recordType} onValueChange={(v) => setRecordType(v as RecordType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select what records you need..." />
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
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={!fullName || !email || !recordType || !purpose || supportingDocs.length === 0}
          >
            Submit Request
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Already have an account? <a href="/PatientRecord/login" className="text-primary font-medium hover:underline">Sign in here</a></p>
        </div>
      </div>
    </div>
  )
}
