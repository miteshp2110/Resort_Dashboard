// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { DashboardLayout } from "@/components/layout/dashboard-layout"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Textarea } from "@/components/ui/textarea"
// import { toast } from "@/components/ui/use-toast"
// import { getGuests, getServices, createInvoice } from "@/lib/api"
// import { ArrowLeft, Plus, Trash2 } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// type Guest = {
//   id: number
//   name: string
//   mobile: string
//   room_number: string
// }

// type Service = {
//   id: number
//   name: string
//   price: number
//   gst_percentage: number
// }

// type InvoiceItem = {
//   service_id: number
//   name: string
//   quantity: number
//   rate: number
//   gst_percentage: number
// }

// export default function NewInvoicePage() {
//   const router = useRouter()
//   const [guests, setGuests] = useState<Guest[]>([])
//   const [services, setServices] = useState<Service[]>([])
//   const [loading, setLoading] = useState(false)

//   // Form states
//   const [guestId, setGuestId] = useState("")
//   const [roomNumber, setRoomNumber] = useState("")
//   const [guestName, setGuestName] = useState("")
//   const [guestMobile, setGuestMobile] = useState("")
//   const [paymentStatus, setPaymentStatus] = useState("pending")
//   const [paymentMethod, setPaymentMethod] = useState("cash")
//   const [notes, setNotes] = useState("")
//   const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
//   const [selectedService, setSelectedService] = useState("")
//   const [itemQuantity, setItemQuantity] = useState("1")

//   useEffect(() => {
//     fetchGuests()
//     fetchServices()
//   }, [])

//   const fetchGuests = async () => {
//     try {
//       const data = await getGuests()
//       setGuests(data)
//     } catch (error) {
//       console.error("Failed to fetch guests:", error)
//     }
//   }

//   const fetchServices = async () => {
//     try {
//       const data = await getServices()
//       setServices(data.filter((service) => service.is_active === 1))
//     } catch (error) {
//       console.error("Failed to fetch services:", error)
//     }
//   }

//   const handleGuestChange = (guestId: string) => {
//     setGuestId(guestId)
//     const guest = guests.find((g) => g.id.toString() === guestId)
//     if (guest) {
//       setGuestName(guest.name)
//       setRoomNumber(guest.room_number)
//       setGuestMobile(guest.mobile)
//     }
//   }

//   const handleAddItem = () => {
//     if (!selectedService || Number.parseInt(itemQuantity) <= 0) return

//     const service = services.find((s) => s.id.toString() === selectedService)
//     if (!service) return

//     const newItem: InvoiceItem = {
//       service_id: service.id,
//       name: service.name,
//       quantity: Number.parseInt(itemQuantity),
//       rate: service.price,
//       gst_percentage: service.gst_percentage,
//     }

//     setInvoiceItems([...invoiceItems, newItem])
//     setSelectedService("")
//     setItemQuantity("1")
//   }

//   const handleRemoveItem = (index: number) => {
//     const updatedItems = [...invoiceItems]
//     updatedItems.splice(index, 1)
//     setInvoiceItems(updatedItems)
//   }

//   const handleCreateInvoice = async () => {
//     if (!guestId || !roomNumber || !guestName || invoiceItems.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please fill all required fields and add at least one item",
//         variant: "destructive",
//       })
//       return
//     }

//     try {
//       setLoading(true)

//       const invoiceData = {
//         guest_id: Number.parseInt(guestId),
//         room_number: roomNumber,
//         guest_name: guestName,
//         guest_mobile: guestMobile,
//         type: "resort",
//         items: invoiceItems.map((item) => ({
//           service_id: item.service_id,
//           name: item.name,
//           quantity: item.quantity,
//           rate: item.rate,
//           gst_percentage: item.gst_percentage,
//         })),
//         payment_status: paymentStatus,
//         payment_method: paymentMethod,
//         notes,
//       }

//       const response = await createInvoice(invoiceData)

//       toast({
//         title: "Success",
//         description: "Invoice created successfully",
//       })

//       router.push(`/invoices/${response.invoice.id}`)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create invoice",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const calculateSubtotal = () => {
//     return invoiceItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
//   }

//   const calculateTax = () => {
//     return invoiceItems.reduce((sum, item) => {
//       const itemTotal = item.quantity * item.rate
//       return sum + itemTotal * (item.gst_percentage / 100)
//     }, 0)
//   }

//   const calculateTotal = () => {
//     return calculateSubtotal() + calculateTax()
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount)
//   }

//   return (
//     <DashboardLayout title="Create New Invoice">
//       <div className="mb-6">
//         <Button variant="outline" className="gap-1" onClick={() => router.back()}>
//           <ArrowLeft className="h-4 w-4" />
//           Back to Invoices
//         </Button>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>New Resort Invoice</CardTitle>
//           <CardDescription>Create a new invoice for resort services</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="guest">Guest</Label>
//                   <Select value={guestId} onValueChange={handleGuestChange}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select guest" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {guests.map((guest) => (
//                         <SelectItem key={guest.id} value={guest.id.toString()}>
//                           {guest.name} (Room {guest.room_number})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="roomNumber">Room Number</Label>
//                     <Input
//                       id="roomNumber"
//                       value={roomNumber}
//                       onChange={(e) => setRoomNumber(e.target.value)}
//                       placeholder="Room number"
//                       disabled={!!guestId}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="guestMobile">Mobile</Label>
//                     <Input
//                       id="guestMobile"
//                       value={guestMobile}
//                       onChange={(e) => setGuestMobile(e.target.value)}
//                       placeholder="Mobile number"
//                       disabled={!!guestId}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="guestName">Guest Name</Label>
//                   <Input
//                     id="guestName"
//                     value={guestName}
//                     onChange={(e) => setGuestName(e.target.value)}
//                     placeholder="Guest name"
//                     disabled={!!guestId}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="paymentStatus">Payment Status</Label>
//                     <Select value={paymentStatus} onValueChange={setPaymentStatus}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="pending">Pending</SelectItem>
//                         <SelectItem value="paid">Paid</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="paymentMethod">Payment Method</Label>
//                     <Select value={paymentMethod} onValueChange={setPaymentMethod}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select method" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="cash">Cash</SelectItem>
//                         <SelectItem value="card">Card</SelectItem>
//                         <SelectItem value="upi">UPI</SelectItem>
//                         <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="notes">Notes</Label>
//                   <Textarea
//                     id="notes"
//                     value={notes}
//                     onChange={(e) => setNotes(e.target.value)}
//                     placeholder="Additional notes"
//                     rows={3}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="border p-4 rounded-md">
//               <div className="flex flex-col md:flex-row gap-4 mb-4">
//                 <div className="flex-1">
//                   <Label htmlFor="service" className="mb-2 block">
//                     Service
//                   </Label>
//                   <Select value={selectedService} onValueChange={setSelectedService}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select service" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {services.map((service) => (
//                         <SelectItem key={service.id} value={service.id.toString()}>
//                           {service.name} ({formatCurrency(service.price)})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="w-24">
//                   <Label htmlFor="quantity" className="mb-2 block">
//                     Quantity
//                   </Label>
//                   <Input
//                     id="quantity"
//                     type="number"
//                     min="1"
//                     value={itemQuantity}
//                     onChange={(e) => setItemQuantity(e.target.value)}
//                   />
//                 </div>
//                 <div className="flex items-end">
//                   <Button type="button" onClick={handleAddItem}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Item
//                   </Button>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium mb-2">Invoice Items</h4>
//                 {invoiceItems.length === 0 ? (
//                   <p className="text-muted-foreground text-sm">No items added yet</p>
//                 ) : (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Service</TableHead>
//                         <TableHead className="text-right">Qty</TableHead>
//                         <TableHead className="text-right">Rate</TableHead>
//                         <TableHead className="text-right">GST</TableHead>
//                         <TableHead className="text-right">Total</TableHead>
//                         <TableHead></TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {invoiceItems.map((item, index) => {
//                         const itemTotal = item.quantity * item.rate
//                         const gstAmount = itemTotal * (item.gst_percentage / 100)
//                         const total = itemTotal + gstAmount

//                         return (
//                           <TableRow key={index}>
//                             <TableCell>{item.name}</TableCell>
//                             <TableCell className="text-right">{item.quantity}</TableCell>
//                             <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
//                             <TableCell className="text-right">{item.gst_percentage}%</TableCell>
//                             <TableCell className="text-right">{formatCurrency(total)}</TableCell>
//                             <TableCell className="text-right">
//                               <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         )
//                       })}
//                       <TableRow>
//                         <TableCell colSpan={4} className="text-right font-medium">
//                           Subtotal:
//                         </TableCell>
//                         <TableCell className="text-right font-medium">{formatCurrency(calculateSubtotal())}</TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell colSpan={4} className="text-right font-medium">
//                           Tax:
//                         </TableCell>
//                         <TableCell className="text-right font-medium">{formatCurrency(calculateTax())}</TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell colSpan={4} className="text-right font-medium">
//                           Total:
//                         </TableCell>
//                         <TableCell className="text-right font-medium">{formatCurrency(calculateTotal())}</TableCell>
//                         <TableCell></TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>
//                 )}
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <Button onClick={handleCreateInvoice} disabled={loading || invoiceItems.length === 0}>
//                 {loading ? "Creating..." : "Create Invoice"}
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </DashboardLayout>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getGuests, getServices, createInvoice } from "@/lib/api"
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/context/auth-context"

type Guest = {
  id: number
  name: string
  mobile: string
  room_number: string
}

type Service = {
  id: number
  name: string
  price: number
  gst_percentage: number
}

type InvoiceItem = {
  service_id: number
  name: string
  quantity: number
  rate: number
  gst_percentage: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  // Form states
  const [guestId, setGuestId] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestMobile, setGuestMobile] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [itemQuantity, setItemQuantity] = useState("1")
  const [isNewGuest, setIsNewGuest] = useState(false)
  const [guestSearchTerm, setGuestSearchTerm] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (user && user.role === "kitchen") {
      router.push("/dashboard")
      return
    }

    fetchGuests()
    fetchServices()
  }, [user, router])

  useEffect(() => {
    // Filter guests based on search term
    if (guestSearchTerm.trim() === "") {
      setFilteredGuests(guests)
    } else {
      const lowercasedFilter = guestSearchTerm.toLowerCase()
      const filtered = guests.filter(
        (guest) =>
          guest.name.toLowerCase().includes(lowercasedFilter) ||
          guest.room_number.toLowerCase().includes(lowercasedFilter) ||
          guest.mobile.toLowerCase().includes(lowercasedFilter),
      )
      setFilteredGuests(filtered)
    }
  }, [guestSearchTerm, guests])

  const fetchGuests = async (search?: string) => {
    try {
      const data = await getGuests(search)
      setGuests(data)
    } catch (error) {
      console.error("Failed to fetch guests:", error)
    }
  }

  const fetchServices = async () => {
    try {
      const data = await getServices()
      setServices(data.filter((service:any) => service.is_active === 1))
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const handleGuestChange = (guestId: string) => {
    setGuestId(guestId)
    if (guestId) {
      const guest = guests.find((g) => g.id.toString() === guestId)
      if (guest) {
        setGuestName(guest.name)
        setRoomNumber(guest.room_number)
        setGuestMobile(guest.mobile)
      }
    } else {
      // Clear fields for manual entry
      setGuestName("")
      setRoomNumber("")
      setGuestMobile("")
    }
  }

  const handleAddItem = () => {
    if (!selectedService || Number.parseInt(itemQuantity) <= 0) return

    const service = services.find((s) => s.id.toString() === selectedService)
    if (!service) return

    const newItem: InvoiceItem = {
      service_id: service.id,
      name: service.name,
      quantity: Number.parseInt(itemQuantity),
      rate: service.price,
      gst_percentage: service.gst_percentage,
    }

    setInvoiceItems([...invoiceItems, newItem])
    setSelectedService("")
    setItemQuantity("1")
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...invoiceItems]
    updatedItems.splice(index, 1)
    setInvoiceItems(updatedItems)
  }

  const handleCreateInvoice = async () => {
    if (!guestName  || invoiceItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and add at least one item",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const invoiceData = {
        guest_id: guestId ? Number.parseInt(guestId) : null,
        room_number: roomNumber,
        guest_name: guestName,
        guest_mobile: guestMobile,
        type: "resort",
        items: invoiceItems.map((item) => ({
          service_id: item.service_id,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          gst_percentage: item.gst_percentage,
        })),
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes,
      }

      const response = await createInvoice(invoiceData)

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      router.push(`/invoices/${response.invoice.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  }

  const calculateTax = () => {
    return invoiceItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate
      return sum + itemTotal * (item.gst_percentage / 100)
    }, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <DashboardLayout title="Create New Invoice">
      <div className="mb-6">
        <Button variant="outline" className="gap-1" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Resort Invoice</CardTitle>
          <CardDescription>Create a new invoice for resort services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="grid gap-2">
                    <Label htmlFor="guest">Guest</Label>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search guests..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                            if (e.target.value.length > 2) {
                              fetchGuests(e.target.value)
                            }
                          }}
                        />
                      </div>
                      <Select value={guestId} onValueChange={handleGuestChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest or enter details below" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Enter guest details manually</SelectItem>
                          {guests.map((guest) => (
                            <SelectItem key={guest.id} value={guest.id.toString()}>
                              {guest.name} (Room {guest.room_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Room number"
                      disabled={!isNewGuest && !!guestId}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestMobile">Mobile</Label>
                    <Input
                      id="guestMobile"
                      value={guestMobile}
                      onChange={(e) => setGuestMobile(e.target.value)}
                      placeholder="Mobile number"
                      disabled={!isNewGuest && !!guestId}
                    />
                  </div>
                </div>

                {!isNewGuest && (
                  <div className="space-y-2">
                    <Label htmlFor="guestName">Guest Name</Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Guest name"
                      disabled={!!guestId}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="border p-4 rounded-md">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="service" className="mb-2 block">
                    Service
                  </Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} ({formatCurrency(service.price)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label htmlFor="quantity" className="mb-2 block">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Invoice Items</h4>
                {invoiceItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No items added yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">GST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.map((item, index) => {
                        const itemTotal = item.quantity * item.rate
                        const gstAmount = itemTotal * (item.gst_percentage / 100)
                        const total = itemTotal + gstAmount

                        return (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                            <TableCell className="text-right">{item.gst_percentage}%</TableCell>
                            <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Subtotal:
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(calculateSubtotal())}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Tax:
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(calculateTax())}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(calculateTotal())}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateInvoice} disabled={loading || invoiceItems.length === 0}>
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
