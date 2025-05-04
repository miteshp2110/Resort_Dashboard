"use client"

import { useState, useEffect } from "react"
import { getInvoiceDetails, getSettings } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

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

export default function PrintInvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [invoiceData, settingsData] = await Promise.all([
          getInvoiceDetails(Number.parseInt(params.id)),
          getSettings(),
        ])
        setInvoice(invoiceData)
        setSettings(settingsData)

        // Auto print after loading
        setTimeout(() => {
          window.print()
        }, 500)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!invoice || !settings) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Invoice not found</h1>
        <p>The requested invoice could not be found.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          {settings.logo_path && (
            <div className="relative h-20 w-40 mb-2">
              <Image
                src={`http://localhost:3001/${settings.logo_path}`}
                alt={settings.resort_name}
                fill
                className="object-contain"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold">{settings.resort_name}</h1>
          <p className="whitespace-pre-line">{settings.resort_address}</p>
          <p>Phone: {settings.resort_contact}</p>
          <p>Email: {settings.resort_email}</p>
          {invoice.type === "resort" && settings.resort_gstin && <p>GSTIN: {settings.resort_gstin}</p>}
          {invoice.type === "kitchen" && settings.kitchen_gstin && <p>GSTIN: {settings.kitchen_gstin}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">INVOICE</h2>
          <p className="font-medium">#{invoice.invoice_number}</p>
          <p>Date: {formatDate(invoice.invoice_date)}</p>
          <p className="mt-2">Status: {invoice.payment_status.toUpperCase()}</p>
        </div>
      </div>

      <div className="border-t border-b border-gray-200 py-4 mb-6">
        <h3 className="font-bold mb-2">Bill To:</h3>
        <p className="font-medium">{invoice.guest_name}</p>
        <p>Room: {invoice.room_number}</p>
        {invoice.guest_mobile && <p>Phone: {invoice.guest_mobile}</p>}
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2">Item</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Rate</th>
            <th className="text-right py-2">GST %</th>
            <th className="text-right py-2">GST Amt</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">{item.item_name}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">{formatCurrency(item.rate)}</td>
              <td className="text-right py-2">{item.gst_percentage}%</td>
              <td className="text-right py-2">{formatCurrency(item.gst_amount)}</td>
              <td className="text-right py-2">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="text-right font-medium py-2">
              Subtotal:
            </td>
            <td className="text-right font-medium py-2">{formatCurrency(invoice.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan={5} className="text-right font-medium py-2">
              Tax:
            </td>
            <td className="text-right font-medium py-2">{formatCurrency(invoice.tax_amount)}</td>
          </tr>
          <tr className="border-t border-gray-200">
            <td colSpan={5} className="text-right font-bold py-2">
              Total:
            </td>
            <td className="text-right font-bold py-2">{formatCurrency(invoice.total_amount)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="mb-6">
        <h3 className="font-bold mb-2">Payment Information:</h3>
        <p>Method: {invoice.payment_method.replace("_", " ").toUpperCase()}</p>
        <p>Status: {invoice.payment_status.toUpperCase()}</p>
      </div>

      {invoice.notes && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Notes:</h3>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-12">
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}
