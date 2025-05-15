"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {fetchApi, sendInvoiceEmail, sendKitchenEmail} from "@/lib/api"
import {ArrowLeft, Mail, Printer} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";

type KitchenAggregatedInvoice = {
  kitchen_info: {
    id: number
    resort_name: string
    resort_gstin: string
    kitchen_gstin: string
    resort_address: string
    resort_contact: string
    resort_email: string
    tax_rate: string
    logo_path: string
    created_at: string
    updated_at: string
  }
  date_range: {
    from_date: string
    to_date: string
  }
  guest_filter: string
  invoices: Array<{
    id: number
    invoice_number: string
    invoice_date: string
    guest_id: number
    room_number: string
    guest_name: string
    guest_mobile: string | null
    subtotal: string
    tax_amount: string
    total_amount: string
    payment_status: string
    payment_method: string
    notes: string | null
    created_at: string
    created_by_username: string
    created_by_name: string
    order_number: string
    order_type: string
    items: Array<{
      id: number
      invoice_id: number
      item_id: number
      item_name: string
      quantity: number
      rate: string
      gst_percentage: string
      gst_amount: string
      total: string
      booking_date: string | null
      item_type: string
      item_description: string
    }>
  }>
  summary: {
    total_invoices: number
    total_subtotal: number
    total_tax: number
    total_amount: number
    order_type_summary: {
      room: number
      walk_in: number
    }
    payment_status_summary: {
      paid: number
      pending: number
      cancelled: number
    }
    payment_method_summary: {
      cash: number
      card: number
      upi: number
      other: number
    }
  }
}

export default function KitchenAggregatedInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<KitchenAggregatedInvoice | null>(null)

  const fromDate = searchParams.get("from_date")
  const toDate = searchParams.get("to_date")
  const guestName = searchParams.get("guest_name")
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [email,setEmail] = useState('')

  useEffect(() => {
    if (!fromDate || !toDate || !guestName) {
     toast.error("All Fields Required")
      router.push("/invoices/aggregated")
      return
    }

    fetchAggregatedInvoices()
  }, [fromDate, toDate, guestName])

  const fetchAggregatedInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetchApi(
        `/invoices/aggregated/kitchen?from_date=${fromDate}&to_date=${toDate}&guest_name=${guestName}`,
      )
      setData(response.data)
    } catch (error) {
      toast.error("Failed to Fetch Invoice")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(numAmount)
  }

  const handlePrint = () => {
    window.open(
      `/invoices/aggregated/kitchen/print?from_date=${fromDate}&to_date=${toDate}&guest_name=${guestName}`,
      "_blank",
    )
  }

  const handleSendEmail = async () => {
    try {
      if(email === ''){
        alert("Please enter a valid email")
        return
      }
      const params = new URLSearchParams(window.location.search);

      const fromDate = params.get('from_date');
      const toDate = params.get('to_date');
      const guestName = params.get('guest_name');
      sendKitchenEmail(fromDate!!, toDate!!, guestName!!, email!!)
      setIsEmailDialogOpen(false)
    } catch (error) {
      // toast.error("Failed to send invoice email")
      alert("Failed to send invoice email")
    }
  }

  return (
    <DashboardLayout title="Kitchen Aggregated Invoice">
      <div className="mb-6 flex justify-between">
        <Button variant="outline" className="gap-1" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4"/>
          Back
        </Button>
        <div>
          <Button variant="outline" className="gap-1" onClick={handlePrint}>
            <Printer className="h-4 w-4"/>
            Print
          </Button>
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Mail className="h-4 w-4"/>
                Email Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Invoice</DialogTitle>
                <DialogDescription>Send this invoice to the guest via email.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Input
                    placeholder="Enter email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required={true}

                />
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>Send</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/3"/>
            <Skeleton className="h-32 w-full"/>
            <Skeleton className="h-64 w-full"/>
          </div>
      ) : data ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{data.kitchen_info.resort_name}</CardTitle>
                    <CardDescription className="mt-2">
                      <p>{data.kitchen_info.resort_address}</p>
                      <p>Phone: {data.kitchen_info.resort_contact}</p>
                      <p>Email: {data.kitchen_info.resort_email}</p>
                      <p>GSTIN: {data.kitchen_info.kitchen_gstin}</p>
                    </CardDescription>
                  </div>
                  {data.kitchen_info.logo_path && (
                      <div className="relative h-20 w-40">
                        <Image
                            src={`http://localhost:3001/${data.kitchen_info.logo_path}`}
                            alt={data.kitchen_info.resort_name}
                            fill
                            className="object-contain"
                        />
                      </div>
                  )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Guest Information</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{data.guest_filter}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Date Range</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">{data.date_range.from_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{data.date_range.to_date}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Invoices:</span>
                      <span className="font-medium">{data.summary.total_invoices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(data.summary.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-medium mb-4">Invoices</h3>
              {data.invoices.map((invoice, index) => (
                <Card key={invoice.id} className="mb-6">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg">Invoice #{invoice.invoice_number}</CardTitle>
                        <CardDescription>
                          {formatDate(invoice.invoice_date)} | Order #{invoice.order_number} | Type:{" "}
                          {invoice.order_type.replace("_", " ")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={invoice.payment_status === "paid" ? "default" : "outline"}>
                          {invoice.payment_status}
                        </Badge>
                        <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                            <TableCell>
                              {item.item_name}
                              {item.item_description && (
                                <p className="text-xs text-muted-foreground">{item.item_description}</p>
                              )}
                            </TableCell>
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
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.total_amount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    {invoice.notes && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-1">Notes:</h4>
                        <p className="text-muted-foreground">{invoice.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Order Type</h4>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Room Service</TableCell>
                            <TableCell className="text-right">{data.summary.order_type_summary.room || 0}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Walk-in</TableCell>
                            <TableCell className="text-right">{data.summary.order_type_summary.walk_in || 0}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Payment Status</h4>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Paid</TableCell>
                            <TableCell className="text-right">{data.summary.payment_status_summary.paid}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Pending</TableCell>
                            <TableCell className="text-right">{data.summary.payment_status_summary.pending}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cancelled</TableCell>
                            <TableCell className="text-right">
                              {data.summary.payment_status_summary.cancelled}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Payment Method</h4>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Cash</TableCell>
                            <TableCell className="text-right">{data.summary.payment_method_summary.cash}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Card</TableCell>
                            <TableCell className="text-right">{data.summary.payment_method_summary.card}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>UPI</TableCell>
                            <TableCell className="text-right">{data.summary.payment_method_summary.upi}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Other</TableCell>
                            <TableCell className="text-right">{data.summary.payment_method_summary.other}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Total Subtotal:</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.summary.total_subtotal)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Total Tax:</TableCell>
                          <TableCell className="text-right">{formatCurrency(data.summary.total_tax)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-lg">Grand Total:</TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            {formatCurrency(data.summary.total_amount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No data found</h2>
          <p className="text-muted-foreground mt-2">No aggregated invoice data available for the selected criteria.</p>
        </div>
      )}
    </DashboardLayout>
  )
}
