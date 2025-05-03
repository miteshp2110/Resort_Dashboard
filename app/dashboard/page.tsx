"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDashboardData } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight, DollarSign, ShoppingCart, Utensils } from "lucide-react"
import { useAuth } from "@/context/auth-context"

type DashboardData = {
  today: {
    date: string
    resort: { count: number; total: number }
    kitchen: { count: number; total: number }
    total: number
  }
  month: {
    start_date: string
    end_date: string
    resort: { count: number; total: number }
    kitchen: { count: number; total: number }
    total: number
  }
  recent_invoices: Array<{
    id: number
    invoice_number: string
    invoice_date: string
    guest_name: string
    type: string
    total_amount: number
    payment_status: string
  }>
  pending_orders: Array<{
    id: number
    order_number: string
    order_date: string
    guest_name: string
    room_number: string
    total_amount: number
    status: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await getDashboardData()
        setData(dashboardData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {user?.role === "admin" && (
          <Tabs defaultValue="today" className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      
                      <div className="text-2xl font-bold">{formatCurrency(parseInt(data?.today.resort.total.toString() || "0")+parseInt(data?.today.kitchen.total.toString() || "0"))}</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resort Revenue</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {formatCurrency(data?.today.resort.total || 0)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({data?.today.resort.count || 0} invoices)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kitchen Revenue</CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {formatCurrency(data?.today.kitchen.total || 0)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({data?.today.kitchen.count || 0} invoices)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="month" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <div className="text-2xl font-bold">{formatCurrency(parseInt(data?.month.resort.total.toString() || "0")+parseInt(data?.month.kitchen.total.toString() || "0"))}</div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resort Revenue</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {formatCurrency(data?.month.resort.total || 0)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({data?.month.resort.count || 0} invoices)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kitchen Revenue</CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <div className="text-2xl font-bold">
                        {formatCurrency(data?.month.kitchen.total || 0)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({data?.month.kitchen.count || 0} invoices)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices generated in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.recent_invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{invoice.guest_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.invoice_number} ({formatDate(invoice.invoice_date)})
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={invoice.payment_status === "paid" ? "default" : "secondary"}>
                          {invoice.payment_status}
                        </Badge>
                        {isAdmin && <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>}
                      </div>
                    </div>
                  ))}
                  {data?.recent_invoices.length === 0 && (
                    <p className="text-center text-muted-foreground">No recent invoices found</p>
                  )}
                </div>
              )}
            </CardContent>
            {!loading && (data?.recent_invoices?.length ?? 0) > 0 && (user?.role === "admin" || user?.role === "reception") && (
              <div className="flex items-center justify-center p-4">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push("/invoices")}>
                  View All Invoices
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Pending Kitchen Orders</CardTitle>
              <CardDescription>Orders that need to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.pending_orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between space-x-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {order.guest_name} (Room {order.room_number})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_number} ({formatDate(order.order_date)})
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            order.status === "pending"
                              ? "outline"
                              : order.status === "processing"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {order.status}
                        </Badge>
                        {isAdmin && <div className="font-medium">{formatCurrency(order.total_amount)}</div>}
                      </div>
                    </div>
                  ))}
                  {data?.pending_orders.length === 0 && (
                    <p className="text-center text-muted-foreground">No pending orders found</p>
                  )}
                </div>
              )}
            </CardContent>
            {!loading && (data?.pending_orders?.length ?? 0) > 0 && (
              <div className="flex items-center justify-center p-4">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push("/kitchen-orders")}>
                  View All Orders
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
