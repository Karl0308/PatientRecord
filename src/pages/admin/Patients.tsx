import { useState, useMemo } from 'react'
import { mockPatients } from '@/data/mockData'
import { useRecords } from '@/context/RecordContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users, Mail, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default function Patients() {
  const { requests } = useRecords()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return mockPatients.filter(p => {
      return search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    })
  }, [search])

  const requestCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    requests.forEach(r => {
      counts[r.patientName] = (counts[r.patientName] || 0) + 1
    })
    return counts
  }, [requests])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Patients</h2>
        <p className="text-sm text-muted-foreground mt-1">Registered patients directory</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No patients found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(patient => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{patient.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{patient.id}</p>
                  </div>
                  <Badge variant="info">{patient.gender}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{patient.address}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t mt-2">
                  <span className="text-xs text-muted-foreground">
                    DOB: {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {requestCounts[patient.name] || 0} request{(requestCounts[patient.name] || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
