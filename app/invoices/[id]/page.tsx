"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {toast, useToast} from "@/components/ui/use-toast"
import {getInvoiceDetails, updateInvoicePayment, emailInvoice, deleteInvoice} from "@/lib/api"
import {ArrowLeft, DeleteIcon, Mail, Printer, TrashIcon} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type InvoiceDetail = {
  id: number
  invoice_number: string
  invoice_date: string
  guest_id: number
  room_number: string
  guest_name: string
  company_name: string | null
  gst_number: string | null
  guest_mobile: string
  type: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_status: string
  payment_method: string
  notes: string | null
  created_by: number
  created_by_name: string
  booking_date: string
  check_in_time: string | null
  check_out_time: string | null
  items: Array<{
    id: number
    invoice_id: number
    item_id: number | null
    service_id: number | null
    item_name: string
    quantity: number
    rate: number
    gst_percentage: number
    gst_amount: number
    total: number
  }>
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  // const {toast} = useToast()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const [checkoutTime, setCheckoutTime] = useState("")

  // Form states
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")

  useEffect(() => {
    fetchInvoiceDetails()
  }, [params.id])

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true)
      const data = await getInvoiceDetails(Number.parseInt(params.id))
      setInvoice(data)
      setPaymentStatus(data.payment_status)
      setPaymentMethod(data.payment_method)
    } catch (error) {
      toast.error("Failed to fetch invoice details. Please try again")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePayment = async () => {
    try {
      await updateInvoicePayment(Number.parseInt(params.id), {
        payment_status: paymentStatus,
        payment_method: paymentMethod,
      })

      // toast({
      //   title: "Success",
      //   description: "Payment status updated successfully",
      // })
      toast.success("Payment Updated Successfully")

      setIsPaymentDialogOpen(false)
      fetchInvoiceDetails()
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to update payment status",
      //   variant: "destructive",
      // })
      toast.error("Failed to udpate status")
    }
  }

  const handleSendEmail = async () => {
    try {
      await emailInvoice(Number.parseInt(params.id))
      toast.success("Invoice Sent")
      setIsEmailDialogOpen(false)
    } catch (error) {
      toast.error("Failed to send invoice email")
    }
  }

  const handleDeleteInvoice = async () => {
    try {
      await deleteInvoice(Number.parseInt(params.id))
      toast.success("Invoice Deleted Successfully")
      setIsDeleteDialogOpen(false)
      router.back()
    } catch (error) {
      toast.error("Failed to delete invoice")
    }
  }

  const handleUpdateCheckoutTime = async () => {
    try {
      await updateInvoicePayment(Number.parseInt(params.id), {
        check_out_time: checkoutTime
      })

      toast.success("Checkout time updated successfully")
      setIsCheckoutDialogOpen(false)
      fetchInvoiceDetails()
    } catch (error) {
      toast.error("Failed to update checkout time")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <DashboardLayout title="Invoice Details">
      <div className="mb-6">
        <Button variant="outline" className="gap-1" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : invoice ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoice #{invoice.invoice_number}</CardTitle>
                <CardDescription>{formatDate(invoice.invoice_date)}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Update Payment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Payment Status</DialogTitle>
                      <DialogDescription>Update the payment status and method for this invoice.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="paymentStatus">Payment Status</Label>
                        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
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
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdatePayment}>Update</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Mail className="h-4 w-4" />
                      Email Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Email Invoice</DialogTitle>
                      <DialogDescription>Send this invoice to the guest via email.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendEmail}>Send</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Update Checkout Time</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Checkout Time</DialogTitle>
                      <DialogDescription>Update the checkout time for this invoice.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="checkoutTime">Checkout Time</Label>
                        <Input
                          id="checkoutTime"
                          type="time"
                          value={checkoutTime}
                          onChange={(e) => setCheckoutTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateCheckoutTime}>Update</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="gap-1"
                  onClick={() => window.open(`/invoices/${invoice.id}/print`, "_blank")}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>


                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="gap-1">
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Invoice</DialogTitle>
                      <DialogDescription>Once Deleted cannot be recovered.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleDeleteInvoice}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>


              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Invoice Details</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice Type:</span>
                      <span className="font-medium capitalize">{invoice.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge variant={getPaymentStatusBadgeVariant(invoice.payment_status)}>
                        {invoice.payment_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium capitalize">{invoice.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By:</span>
                      <span className="font-medium">{invoice.created_by_name}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Guest Information</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{invoice.guest_name}</span>
                    </div>
                    {invoice.company_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{invoice.company_name}</span>
                      </div>
                    )}
                    {invoice.gst_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST Number:</span>
                        <span className="font-medium">{invoice.gst_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Number:</span>
                      <span className="font-medium">{invoice.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="font-medium">{invoice.guest_mobile}</span>
                    </div>
                    {invoice.check_in_time && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-in Time:</span>
                        <span className="font-medium">{invoice.check_in_time}</span>
                      </div>
                    )}
                    {invoice.check_out_time && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Check-out Time:</span>
                        <span className="font-medium">{invoice.check_out_time}</span>
                      </div>
                    )}
                    {invoice.type === "resort"?<div className="flex justify-between">
                      <span className="text-muted-foreground">Booking Date:</span>
                      <span className="font-medium">{formatDate(invoice.booking_date)}</span>
                </div>:<></>}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Invoice Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">GST %</TableHead>
                      <TableHead className="text-right">GST Amt</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right">
                          CGST: {item.gst_percentage/2}% + SGST: {item.gst_percentage/2}%
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.gst_amount/2)} + {formatCurrency(item.gst_amount/2)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">
                        Subtotal:
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.subtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">
                        CGST ({invoice.items[0]?.gst_percentage/2}%):
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.tax_amount / 2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">
                        SGST ({invoice.items[0]?.gst_percentage/2}%):
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.tax_amount / 2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {invoice.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Invoice not found</h2>
          <p className="text-muted-foreground mt-2">The requested invoice could not be found.</p>
        </div>
      )}
    </DashboardLayout>
  )
}
