export type UserRole = 'Patient' | 'Admin'

export interface AuthUser {
  id: string
  username: string
  name: string
  role: UserRole
  initials: string
  email: string
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'sent'

export type RecordType =
  | 'Medical History'
  | 'Lab Results'
  | 'Prescription Records'
  | 'Imaging / X-Ray'
  | 'Vaccination Records'
  | 'Surgical Records'
  | 'Dental Records'
  | 'Billing Summary'
  | 'Referral Letter'
  | 'Other'

export interface Attachment {
  id: string
  name: string
  size: number
  type: string
}

export interface RecordRequest {
  id: string
  patientName: string
  patientEmail: string
  recordType: RecordType
  purpose: string
  notes: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  processedBy: string | null
  processedAt: string | null
  rejectionReason: string | null
  sentAt: string | null
  attachments: Attachment[]
  supportingDocs: Attachment[]
}

export interface TransactionLog {
  id: string
  requestId: string
  action: TransactionAction
  performedBy: string
  performedByRole: UserRole
  timestamp: string
  details: string
}

export type TransactionAction =
  | 'request_submitted'
  | 'request_approved'
  | 'request_rejected'
  | 'record_sent'
  | 'request_cancelled'

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  gender: 'Male' | 'Female' | 'Other'
}

export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  approvedToday: number
  sentToday: number
}
