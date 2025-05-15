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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getServices, createService, updateService, deleteService } from "@/lib/api"
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
import { useAuth } from "@/context/auth-context"

type Service = {
  id: number
  name: string
  description: string
  price: number
  gst_percentage: number
  is_active: number
}

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const canManageServices = user?.role === "admin" || user?.role === "reception"

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [gstPercentage, setGstPercentage] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await getServices()
      setServices(data)
    } catch (error) {
      toast.error("Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    try {
      await createService({
        name,
        description,
        price: Number.parseFloat(price),
        gst_percentage: Number.parseInt(gstPercentage),
      })

      toast.success("Service created successfully")

      resetForm()
      setIsAddDialogOpen(false)
      fetchServices()
    } catch (error) {
      toast.error("Failed to create service")
    }
  }

  const handleEditService = async () => {
    if (!selectedService) return

    try {
      await updateService(selectedService.id, {
        name,
        description,
        price: Number.parseFloat(price),
        gst_percentage: Number.parseInt(gstPercentage),
        is_active: isActive ? 1 : 0,
      })

      toast.success("Service updated successfully")

      resetForm()
      setIsEditDialogOpen(false)
      fetchServices()
    } catch (error) {
      toast.error("Failed to update service")
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    try {
      await deleteService(serviceId)

      toast.success("Service deleted successfully")

      fetchServices()
    } catch (error) {
      alert("Service cannot be deleted")
      toast.error("Failed to delete service")
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setGstPercentage("")
    setIsActive(true)
  }

  const openEditDialog = (service: Service) => {
    setSelectedService(service)
    setName(service.name)
    setDescription(service.description)
    setPrice(service.price.toString())
    setGstPercentage(service.gst_percentage.toString())
    setIsActive(service.is_active === 1)
    setIsEditDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <DashboardLayout title="Services">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription>Manage resort services offered to guests</CardDescription>
          </div>
          {canManageServices && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>Create a new service offering for resort guests.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter service name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter service description"
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddService}>Create Service</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{service.description}</TableCell>
                      <TableCell>{formatCurrency(service.price)}</TableCell>
                      <TableCell>{service.gst_percentage}%</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {canManageServices && (
                            <>
                              <Button variant="outline" size="icon" onClick={() => openEditDialog(service)}>
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
                                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this service? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteService(service.id)}>
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

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service details and availability.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Service Name</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter service name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter service description"
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
            <div className="flex items-center space-x-2">
              <Switch id="editIsActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="editIsActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>Update Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
