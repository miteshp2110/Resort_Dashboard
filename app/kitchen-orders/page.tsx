
"use client"

import { useState, useEffect, use } from "react"
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
import {
  getKitchenOrders,
  getKitchenOrderDetails,
  updateKitchenOrderStatus,
  createInvoiceFromKitchenOrder,
  getMenuItems,
  getGuests,
  createKitchenOrder,
} from "@/lib/api"
import { Plus, FileText, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useAuth } from "@/context/auth-context"

type KitchenOrder = {
  id: number
  order_number: string
  guest_id: number
  room_number: string
  guest_name: string
  order_type: string
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
  order_date: string
  created_by: number
  created_by_name: string
  invoice_id: number | null
}

type KitchenOrderDetail = KitchenOrder & {
  items: Array<{
    id: number
    order_id: number
    item_id: number
    quantity: number
    rate: number
    gst_percentage: number
    gst_amount: number
    total: number
    name: string
  }>
}

type MenuItem = {
  id: number
  name: string
  price: number
  gst_percentage: number
  type: string
}

type Guest = {
  id: number
  name: string
  room_number: string
}

type OrderItem = {
  id: number
  name: string
  quantity: number
  rate: number
  gst_percentage: number
}

export default function KitchenOrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrderDetail | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Form states
  const [guestId, setGuestId] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [guestName, setGuestName] = useState("")
  const [orderType, setOrderType] = useState("room_service")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedMenuItem, setSelectedMenuItem] = useState("")
  const [itemQuantity, setItemQuantity] = useState("1")

  const canCreateOrder = user?.role === "admin" || user?.role === "reception"
  const canUpdateStatus = user?.role === "admin" || user?.role === "kitchen"

  useEffect(() => {
    fetchOrders()
  }, [activeTab, startDate, endDate])

  useEffect(() => {
    fetchMenuItems()
    fetchGuests()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const params: any = {}
      if (activeTab !== "all") {
        params.status = activeTab
      }
      if (startDate) {
        params.start_date = format(startDate, "yyyy-MM-dd")
      }
      if (endDate) {
        params.end_date = format(endDate, "yyyy-MM-dd")
      }

      const data = await getKitchenOrders(params)
      setOrders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch kitchen orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const data = await getMenuItems()
      setMenuItems(data.filter((item:any) => item.is_active === 1))
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    }
  }

  const fetchGuests = async () => {
    try {
      const data = await getGuests()
      setGuests(data)
    } catch (error) {
      console.error("Failed to fetch guests:", error)
    }
  }

  const handleViewOrder = async (orderId: number) => {
    try {
      const data = await getKitchenOrderDetails(orderId)
      setSelectedOrder(data)
      setIsViewDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await updateKitchenOrderStatus(orderId, status)

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      })

      fetchOrders()

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleCreateInvoice = async (orderId: number) => {
    try {
      await createInvoiceFromKitchenOrder(orderId, {
        payment_status: "pending",
        payment_method: "cash",
      })

      toast({
        title: "Success",
        description: "Invoice created successfully",
      })

      fetchOrders()
      setIsViewDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      })
    }
  }

  const handleGuestChange = (guestId: string) => {
    setGuestId(guestId)
    const guest = guests.find((g) => g.id.toString() === guestId)
    if (guest) {
      setGuestName(guest.name)
      setRoomNumber(guest.room_number)
    }
  }

  const handleAddItem = () => {
    if (!selectedMenuItem || Number.parseInt(itemQuantity) <= 0) return

    const menuItem = menuItems.find((item) => item.id.toString() === selectedMenuItem)
    if (!menuItem) return

    const newItem: OrderItem = {
      id: menuItem.id,
      name: menuItem.name,
      quantity: Number.parseInt(itemQuantity),
      rate: menuItem.price,
      gst_percentage: menuItem.gst_percentage,
    }

    setOrderItems([...orderItems, newItem])
    setSelectedMenuItem("")
    setItemQuantity("1")
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems]
    updatedItems.splice(index, 1)
    setOrderItems(updatedItems)
  }

  const handleCreateOrder = async () => {
    if (!guestName || orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and add at least one item",
        variant: "destructive",
      })
      return
    }

    try {
      const orderData = {
        guest_id: Number.parseInt(guestId),
        room_number: roomNumber,
        guest_name: guestName,
        order_type: orderType,
        items: orderItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          rate: item.rate,
          gst_percentage: item.gst_percentage,
        })),
      }

      await createKitchenOrder(orderData)

      toast({
        title: "Success",
        description: "Kitchen order created successfully",
      })

      resetForm()
      setIsAddDialogOpen(false)
      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create kitchen order",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setGuestId("")
    setRoomNumber("")
    setGuestName("")
    setOrderType("room_service")
    setOrderItems([])
    setSelectedMenuItem("")
    setItemQuantity("1")
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  }

  const calculateTax = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.rate
      return sum + itemTotal * (item.gst_percentage / 100)
    }, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline"
      case "processing":
        return "secondary"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const canCreateInvoice = () => {
    return user?.role === "admin" || user?.role === "reception"
  }
  const kitchen_admin = user?.role === "admin" || user?.role === 'kitchen'

  return (
    <DashboardLayout title="Kitchen Orders">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kitchen Orders</CardTitle>
            <CardDescription>Manage food and beverage orders from guests</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                {(kitchen_admin) && 
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  New Order
                </Button>}
              </DialogTrigger>
              <DialogContent className="max-w-3xl h-[600px] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Kitchen Order</DialogTitle>
                  <DialogDescription>Create a new food or beverage order for a guest.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="guest">Guest</Label>
                      <Select value={guestId} onValueChange={handleGuestChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest" />
                        </SelectTrigger>
                        <SelectContent>
                          {guests.map((guest) => (
                            <SelectItem key={guest.id} value={guest.id.toString()}>
                              {guest.name} (Room {guest.room_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="roomNumber">Room Number</Label>
                      <Input
                        id="roomNumber"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="Room number"
                        disabled={!!guestId}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="guestName">Guest Name</Label>
                      <Input
                        id="guestName"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Guest name"
                        disabled={!!guestId}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room">Room Service</SelectItem>
                        <SelectItem value="walk_in">Restaurant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border p-4 rounded-md">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="flex-1">
                        <Label htmlFor="menuItem" className="mb-2 block">
                          Menu Item
                        </Label>
                        <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select menu item" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name} ({formatCurrency(item.price)})
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
                          Add Item
                        </Button>
                      </div>
                    </div>
                    <div>
  <h4 className="font-medium mb-2">Order Items</h4>
  {orderItems.length === 0 ? (
    <p className="text-muted-foreground text-sm">No items added yet</p>
  ) : (
    <div className="border rounded-md max-h-64 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">GST</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderItems.map((item, index) => {
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
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )}
  
  {orderItems.length > 0 && (
    <div className="mt-4">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-medium">
              Subtotal:
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(calculateSubtotal())}
            </TableCell>
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
            <TableCell className="text-right font-medium">
              {formatCurrency(calculateTotal())}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )}
</div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrder} disabled={orderItems.length === 0}>
                    Create Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
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
                  <TableHead>Order #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.guest_name}</TableCell>
                      <TableCell>{order.room_number}</TableCell>
                      <TableCell>{formatDate(order.order_date)}</TableCell>
                      <TableCell className="capitalize">{order.order_type.replace("_", " ")}</TableCell>
                      <TableCell>{user?.role === "admin" ? formatCurrency(order.total_amount) : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleViewOrder(order.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.invoice_id === null && order.status === "completed" && canCreateInvoice() && (
                            <Button variant="outline" size="icon" onClick={() => handleCreateInvoice(order.id)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 h-64 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Guest</h4>
                  <p>{selectedOrder.guest_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Room</h4>
                  <p>{selectedOrder.room_number}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                  <p>{formatDate(selectedOrder.order_date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)} className="mt-1">
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">GST</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell className="text-right">{item.gst_percentage}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Subtotal:
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(selectedOrder.subtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Tax:
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(selectedOrder.tax_amount)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(selectedOrder.total_amount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  {(selectedOrder.status === "pending" && kitchen_admin) && (
                    <>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}>
                      Start Processing
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}>
                      Cancel Order
                    </Button>
                  </>
                  )}
                  {selectedOrder.status === "processing" && (
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}>
                      Mark as Completed
                    </Button>
                  )}
                </div>

                <div className="space-x-2">
                  {selectedOrder.invoice_id === null && selectedOrder.status === "completed" && canCreateInvoice() && (
                    <Button onClick={() => handleCreateInvoice(selectedOrder.id)}>Create Invoice</Button>
                  )}
                  {selectedOrder.invoice_id !== null && (
                    <Button variant="outline" onClick={() => router.push(`/invoices/${selectedOrder.invoice_id}`)}>
                      View Invoice
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
