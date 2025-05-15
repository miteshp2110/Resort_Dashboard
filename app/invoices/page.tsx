"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { getInvoices } from "@/lib/api"
import { Eye, FileText, Printer } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

type Invoice = {
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
}

export default function InvoicesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetchInvoices()
  }, [activeTab, startDate, endDate])

  const fetchInvoices = async () => {
    try {
      setLoading(true)

      const params: any = {}
      if (activeTab !== "all") {
        params.type = activeTab
      }
      if (startDate) {
        params.start_date = format(startDate, "yyyy-MM-dd")
      }
      if (endDate) {
        params.end_date = format(endDate, "yyyy-MM-dd")
      }

      const data = await getInvoices(params)
      setInvoices(data)
    } catch (error) {
      toast.error("Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }

  const handleViewInvoice = (invoiceId: number) => {
    router.push(`/invoices/${invoiceId}`)
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

  const canCreateInvoice = user?.role === "admin" || user?.role === "reception"

  return (
    <DashboardLayout title="Invoices">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Manage and view all invoices</CardDescription>
          </div>
          <div className="flex gap-2">
            {canCreateInvoice && (
              <Button variant="outline" className="gap-1" onClick={() => router.push("/invoices/new")}>
                <FileText className="h-4 w-4" />
                New Invoice
              </Button>
            )}
            <Button variant="outline" className="gap-1" onClick={() => router.push("/invoices/aggregated")}>
              <FileText className="h-4 w-4" />
              Aggregated Invoices
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Invoices</TabsTrigger>
                <TabsTrigger value="resort">Resort</TabsTrigger>
                <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 ml-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    {startDate ? format(startDate, "PPP") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    {endDate ? format(endDate, "PPP") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

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
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.guest_name}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell className="capitalize">{invoice.type}</TableCell>
                      <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusBadgeVariant(invoice.payment_status)}>
                          {invoice.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{invoice.payment_method}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewInvoice(invoice.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/invoices/${invoice.id}/print`, "_blank")}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
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
