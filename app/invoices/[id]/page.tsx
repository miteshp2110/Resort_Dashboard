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
import { toast } from "@/components/ui/use-toast"
import { getInvoiceDetails, updateInvoicePayment, emailInvoice } from "@/lib/api"
import { ArrowLeft, Mail, Printer } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type InvoiceDetail = {
  id: number
  invoice_number: string
  invoice_date: string
  guest_id: number
  room_number: string
  guest_name: string
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
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  // Form states
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [emailAddress, setEmailAddress] = useState("")

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
      setEmailAddress(data.guest_email || "")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoice details",
        variant: "destructive",
      })
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

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      })

      setIsPaymentDialogOpen(false)
      fetchInvoiceDetails()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = async () => {
    try {
      await emailInvoice(Number.parseInt(params.id))

      toast({
        title: "Success",
        description: `Invoice sent to ${emailAddress}`,
      })

      setIsEmailDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      })
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
                    <div className="grid gap-4 py-4">
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendEmail}>Send</Button>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Number:</span>
                      <span className="font-medium">{invoice.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="font-medium">{invoice.guest_mobile}</span>
                    </div>
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
                        <TableCell className="text-right">{item.gst_percentage}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.gst_amount)}</TableCell>
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
                        Tax:
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(invoice.tax_amount)}</TableCell>
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
