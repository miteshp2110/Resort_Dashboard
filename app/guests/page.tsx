"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getGuests, createGuest } from "@/lib/api"
import { Plus, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Guest = {
  id: number
  name: string
  mobile: string
  email: string
  room_number: string
  check_in_date: string
  check_out_date: string
  created_at: string
  company_name: string | null
  gst_number: string | null
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Form states
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [gstNumber, setGstNumber] = useState("")

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async (search?: string) => {
    try {
      setLoading(true)
      const data = await getGuests(search)
      setGuests(data)
    } catch (error) {
      toast.error("Failed to fetch Guests")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchGuests(searchTerm)
  }

  const handleAddGuest = async () => {
    try {
      await createGuest({
        name,
        mobile,
        email,
        room_number: roomNumber,
        check_in_date: new Date(checkInDate).toISOString(),
        check_out_date: new Date(checkOutDate).toISOString(),
        company_name: companyName,
        gst_number: gstNumber
      })

      toast.success("Guests added successfully.")

      resetForm()
      setIsAddDialogOpen(false)
      fetchGuests()
    } catch (error) {
      toast.error("Failed to add guest")
    }
  }

  const resetForm = () => {
    setName("")
    setMobile("")
    setEmail("")
    setRoomNumber("")
    setCheckInDate("")
    setCheckOutDate("")
    setCompanyName("")
    setGstNumber("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <DashboardLayout title="Guests">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Guests</CardTitle>
            <CardDescription>Manage guest information and bookings</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guests..."
                className="w-[200px] pl-8 md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Guest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Guest</DialogTitle>
                  <DialogDescription>Register a new guest in the system.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Enter room number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="checkInDate">Check-in Date</Label>
                      <Input
                        id="checkInDate"
                        type="datetime-local"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="checkOutDate">Check-out Date</Label>
                      <Input
                        id="checkOutDate"
                        type="datetime-local"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter company name (optional)"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="Enter GST number (optional)"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGuest}>Register Guest</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.room_number}</TableCell>
                      <TableCell>{guest.mobile}</TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.company_name || '-'}</TableCell>
                      <TableCell>{guest.gst_number || '-'}</TableCell>
                      <TableCell>{formatDate(guest.check_in_date)}</TableCell>
                      <TableCell>{formatDate(guest.check_out_date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
