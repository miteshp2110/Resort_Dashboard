"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getSettings, updateSettings } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

type Settings = {
  id: number
  resort_name: string
  resort_gstin: string
  kitchen_gstin: string
  resort_address: string
  resort_contact: string
  resort_email: string
  tax_rate: number
  logo_path: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [resortName, setResortName] = useState("")
  const [resortGstin, setResortGstin] = useState("")
  const [kitchenGstin, setKitchenGstin] = useState("")
  const [resortAddress, setResortAddress] = useState("")
  const [resortContact, setResortContact] = useState("")
  const [resortEmail, setResortEmail] = useState("")
  const [taxRate, setTaxRate] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await getSettings()
      setSettings(data)

      // Initialize form states
      setResortName(data.resort_name || "")
      setResortGstin(data.resort_gstin || "")
      setKitchenGstin(data.kitchen_gstin || "")
      setResortAddress(data.resort_address || "")
      setResortContact(data.resort_contact || "")
      setResortEmail(data.resort_email || "")
      setTaxRate(data.tax_rate?.toString() || "")
      setLogoPreview(data.logo_path ? `http://localhost:3001/${data.logo_path}` : null)
    } catch (error) {
      toast.error("Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      const formData = new FormData()
      formData.append("resort_name", resortName)
      formData.append("resort_gstin", resortGstin)
      formData.append("kitchen_gstin", kitchenGstin)
      formData.append("resort_address", resortAddress)
      formData.append("resort_contact", resortContact)
      formData.append("resort_email", resortEmail)
      formData.append("tax_rate", taxRate)

      if (logoFile) {
        formData.append("logo", logoFile)
      }

      await updateSettings(formData)

      toast.success("Settings updated successfully")

      fetchSettings()
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Settings">
      <Card>
        <CardHeader>
          <CardTitle>Resort Settings</CardTitle>
          <CardDescription>Configure your resort information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resortName">Resort Name</Label>
                    <Input
                      id="resortName"
                      value={resortName}
                      onChange={(e) => setResortName(e.target.value)}
                      placeholder="Enter resort name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resortGstin">Resort GSTIN</Label>
                    <Input
                      id="resortGstin"
                      value={resortGstin}
                      onChange={(e) => setResortGstin(e.target.value)}
                      placeholder="Enter resort GSTIN"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kitchenGstin">Kitchen GSTIN</Label>
                    <Input
                      id="kitchenGstin"
                      value={kitchenGstin}
                      onChange={(e) => setKitchenGstin(e.target.value)}
                      placeholder="Enter kitchen GSTIN"
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="Enter default tax rate"
                    />
                  </div> */}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resortAddress">Resort Address</Label>
                    <Textarea
                      id="resortAddress"
                      value={resortAddress}
                      onChange={(e) => setResortAddress(e.target.value)}
                      placeholder="Enter resort address"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resortContact">Contact Number</Label>
                    <Input
                      id="resortContact"
                      value={resortContact}
                      onChange={(e) => setResortContact(e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resortEmail">Email Address</Label>
                    <Input
                      id="resortEmail"
                      type="email"
                      value={resortEmail}
                      onChange={(e) => setResortEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="logo">Resort Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative h-20 w-40 overflow-hidden rounded border">
                      <Image
                        src={logoPreview || "/placeholder.svg"}
                        alt="Resort Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                </div>
                <p className="text-sm text-muted-foreground">Recommended size: 300x150 pixels</p>
              </div> */}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
