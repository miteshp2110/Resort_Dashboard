"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  getSalesReport,
  getGstReport,
  getKitchenItemsReport,
  downloadSalesReportExcel,
  downloadGSTReportExcel, downloadKitchenReportExcel, downloadResortReportExcel
} from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, set, sub, subDays } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { da } from "date-fns/locale"

type SalesReportData = {
  summary: {
    invoice_count: number
    subtotal: number
    tax_amount: number
    total_amount: number
  }
  daily: Array<{
    date: string
    type: string
    invoice_count: number
    subtotal: number
    tax_amount: number
    total_amount: number
  }>
}

type GstReportData = {
  period: {
    start_date: string
    end_date: string
  }
  resort: {
    gstin: string
    taxable_amount: number
    tax_amount: number
    total_amount: number
  }
  kitchen: {
    gstin: string
    taxable_amount: number
    tax_amount: number
    total_amount: number
  }
}

type KitchenItemsReportData = Array<{
  id: number
  name: string
  total_quantity: number
  total_amount: number
}>

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales")
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [reportType, setReportType] = useState("all")
  const [loading, setLoading] = useState(false)

  const [salesData, setSalesData] = useState<SalesReportData | null>(null)
  const [gstData, setGstData] = useState<GstReportData | null>(null)
  const [kitchenItemsData, setKitchenItemsData] = useState<KitchenItemsReportData | null>(null)

  useEffect(() => {
    if (activeTab === "sales") {
      fetchSalesReport()
    } else if (activeTab === "gst") {
      fetchGstReport()
    } else if (activeTab === "kitchen-items") {
      fetchKitchenItemsReport()
    }
  }, [activeTab, startDate, endDate, reportType])

  const fetchSalesReport = async () => {
    try {
      setLoading(true)

      const params = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        type: reportType !== "all" ? reportType : undefined,
      }

      const data = await getSalesReport(params)
      setSalesData(data)
    } catch (error) {
      toast.error("Failed to fetch sales report")
    } finally {
      setLoading(false)
    }
  }

  const downloadGSTReport = async () => {
    try {

      const params = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        type: reportType !== "all" ? reportType : undefined,
      }
      downloadGSTReportExcel(params)

    } catch (error) {
      toast.error("Failed to fetch sales report")
    } finally {
    }
  }

  const downloadKitchenReport = async () => {
    try {

      const params = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        type: reportType !== "all" ? reportType : undefined,
      }
      downloadKitchenReportExcel(params)

    } catch (error) {
      toast.error("Failed to fetch sales report")
    } finally {
    }
  }

  const downloadSalesReport = async () => {
    try {

      const params = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        type: reportType !== "all" ? reportType : undefined,
      }
      downloadSalesReportExcel(params)

    } catch (error) {
      toast.error("Failed to fetch sales report")
    } finally {
    }
  }

  const fetchGstReport = async () => {
    try {
      setLoading(true)

      const params = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      }

      const data = await getGstReport(params)
      setGstData(data)
    } catch (error) {
      toast.error("Failed to fetch GST report")
    } finally {
      setLoading(false)
    }
  }

  const fetchKitchenItemsReport = async () => {
    try {
      setLoading(true)

      const params = {
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      }

      const data = await getKitchenItemsReport(params)
      setKitchenItemsData(data)
    } catch (error) {
      toast.error("Failed to fetch kitchen items report")
    } finally {
      setLoading(false)
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

  let subTCount:number = 0

  return (
    <DashboardLayout title="Reports">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>View and analyze resort performance data</CardDescription>
          <Button variant={"default"} onClick={()=>{downloadResortReportExcel()}} >Resort Report Download</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="sales">Sales Report</TabsTrigger>
                <TabsTrigger value="gst">GST Report</TabsTrigger>
                <TabsTrigger value="kitchen-items">Kitchen Items</TabsTrigger>
              </TabsList>

              <div className="flex gap-2 md:ml-auto md:justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {activeTab === "sales" && (
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="resort">Resort</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <>
                  {/* Sales Report */}
                  <TabsContent value="sales" className="mt-4">
                    {salesData ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card>
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="text-2xl font-bold">{salesData.summary.invoice_count}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm font-medium">Subtotal</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.subtotal)}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm font-medium">Tax Amount</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.tax_amount)}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="text-2xl font-bold">{formatCurrency(salesData.summary.total_amount)}</div>
                            </CardContent>
                          </Card>
                        </div>

                        <Button variant={"default"}  onClick={async()=>{
                          downloadSalesReport()
                        }}>Download Report</Button>

                        <div>
                          <h3 className="text-lg font-medium mb-4">Daily Sales</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Invoices</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                                <TableHead className="text-right">Tax</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {salesData.daily.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center">
                                    No data available for the selected period
                                  </TableCell>
                                </TableRow>
                                
                              ) : (
                                salesData.daily.map((day, index) => (
                                  subTCount = subTCount+50,
                                  console.log(subTCount),
                                  <TableRow key={index}>
                                    <TableCell>{formatDate(day.date)}</TableCell>
                                    <TableCell className="capitalize">{day.type}</TableCell>
                                    <TableCell>{day.invoice_count}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(day.subtotal)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(day.tax_amount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(day.total_amount)}</TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* GST Report */}
                  <TabsContent value="gst" className="mt-4">
                    {gstData ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Resort GST</CardTitle>
                              <CardDescription>GSTIN: {gstData.resort.gstin}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">Taxable Amount</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(gstData.resort.taxable_amount)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Tax Amount</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(gstData.resort.tax_amount)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Total Amount</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(gstData.resort.total_amount)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>


                          <Card>
                            <CardHeader>
                              <CardTitle>Kitchen GST</CardTitle>
                              <CardDescription>GSTIN: {gstData.kitchen.gstin}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">Taxable Amount</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(gstData.kitchen.taxable_amount)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Tax Amount</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(gstData.kitchen.tax_amount)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Total Amount</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(gstData.kitchen.total_amount)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </div>

                        <Button variant={"default"}  onClick={async()=>{
                          downloadGSTReport()
                        }}>Download Report</Button>
                        <Card>
                          <CardHeader>
                            <CardTitle>Summary</CardTitle>
                            <CardDescription>
                              Period: {formatDate(gstData.period.start_date)} to {formatDate(gstData.period.end_date)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Entity</TableHead>
                                  <TableHead className="text-right">Taxable Amount</TableHead>
                                  <TableHead className="text-right">Tax Amount</TableHead>
                                  <TableHead className="text-right">Total Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">Resort</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.resort.taxable_amount)}
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(gstData.resort.tax_amount)}</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.resort.total_amount)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Kitchen</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.kitchen.taxable_amount)}
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(gstData.kitchen.tax_amount)}</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.kitchen.total_amount)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-medium">Total</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.resort.taxable_amount + gstData.kitchen.taxable_amount)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.resort.tax_amount + gstData.kitchen.tax_amount)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(gstData.resort.total_amount + gstData.kitchen.total_amount)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Kitchen Items Report */}
                  <TabsContent value="kitchen-items" className="mt-4">
                    {kitchenItemsData ? (
                      <div>
                        <Button variant={"default"}  onClick={async()=>{
                          downloadKitchenReport()
                        }}>Download Report</Button>
                        <h3 className="text-lg font-medium mb-4">Kitchen Items Sales</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Name</TableHead>
                              <TableHead className="text-right">Quantity Sold</TableHead>
                              <TableHead className="text-right">Total Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {kitchenItemsData.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                  No data available for the selected period
                                </TableCell>
                              </TableRow>
                            ) : (
                              kitchenItemsData.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.total_quantity}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.total_amount)}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}