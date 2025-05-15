
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  gst_percentage: number
  type: string
  is_active: number
}

export default function MenuItemsPage() {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [gstPercentage, setGstPercentage] = useState("")
  const [type, setType] = useState("kitchen")
  const [isActive, setIsActive] = useState(true)

  const canManageItems = user?.role === "admin"

  useEffect(() => {
    fetchMenuItems()
  }, [activeTab])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const data = await getMenuItems(activeTab !== "all" ? activeTab : undefined)
      setMenuItems(data)
    } catch (error) {
      toast.error("Failed to fetch menu items")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMenuItem = async () => {
    try {
      await createMenuItem({
        name,
        description,
        price: Number.parseFloat(price),
        gst_percentage: Number.parseInt(gstPercentage),
        type,
      })

      toast.success("Menu item created successfully")

      resetForm()
      setIsAddDialogOpen(false)
      fetchMenuItems()
    } catch (error) {
      toast.error("Failed to create menu item")
    }
  }

  const handleEditMenuItem = async () => {
    if (!selectedItem) return

    try {
      await updateMenuItem(selectedItem.id, {
        name,
        description,
        price: Number.parseFloat(price),
        gst_percentage: Number.parseInt(gstPercentage),
        type,
        is_active: isActive ? 1 : 0,
      })

      toast.success("Menu item updated successfully")

      resetForm()
      setIsEditDialogOpen(false)
      fetchMenuItems()
    } catch (error) {
      toast.error("Failed to update menu item")
    }
  }

  const handleDeleteMenuItem = async (itemId: number) => {
    try {
      await deleteMenuItem(itemId)

      toast.error("Menu item deleted successfully")

      fetchMenuItems()
    } catch (error) {
      toast.error("Failed to delete menu item")
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setGstPercentage("")
    setType("kitchen")
    setIsActive(true)
  }

  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item)
    setName(item.name)
    setDescription(item.description)
    setPrice(item.price.toString())
    setGstPercentage(item.gst_percentage.toString())
    setType(item.type)
    setIsActive(item.is_active === 1)
    setIsEditDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <DashboardLayout title="Menu Items">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Manage food and beverage items for the kitchen</CardDescription>
          </div>
          {canManageItems && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                  <DialogDescription>Create a new food or beverage item for the menu.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter item description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gstPercentage">GST Percentage</Label>
                      <Input
                        id="gstPercentage"
                        type="number"
                        value={gstPercentage}
                        onChange={(e) => setGstPercentage(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Item Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMenuItem}>Create Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="kitchen">Kitchen</TabsTrigger>
              <TabsTrigger value="resort">Resort</TabsTrigger>
            </TabsList>
          </Tabs>

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
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No menu items found
                    </TableCell>
                  </TableRow>
                ) : (
                  menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{item.gst_percentage}%</TableCell>
                      <TableCell className="capitalize">{item.type}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canManageItems && (
                            <>
                              <Button variant="outline" size="icon" onClick={() => openEditDialog(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this menu item? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMenuItem(item.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
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

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update menu item details and availability.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Item Name</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter item description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editPrice">Price</Label>
                <Input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editGstPercentage">GST Percentage</Label>
                <Input
                  id="editGstPercentage"
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editType">Item Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="editIsActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="editIsActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMenuItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

