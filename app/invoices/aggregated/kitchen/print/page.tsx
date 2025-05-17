"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { fetchApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

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

export default function KitchenAggregatedInvoicePrintPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<KitchenAggregatedInvoice | null>(null)

  const fromDate = searchParams.get("from_date")
  const toDate = searchParams.get("to_date")
  const guestName = searchParams.get("guest_name")

  useEffect(() => {
    if (!fromDate || !toDate || !guestName) {
      console.error("Missing parameters")
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

      // Auto print after loading
      setTimeout(() => {
        window.print()
      }, 500)
    } catch (error) {
      console.error("Failed to fetch aggregated invoices:", error)
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

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">No data found</h1>
        <p>No aggregated invoice data available for the selected criteria.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="relative h-20 w-40 mb-2">
            <Image
                src={`https://crresortapp.xyz/api/logo`}
                alt={"Logo"}
                fill
                className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">{data.kitchen_info.resort_name}</h1>
          <p className="whitespace-pre-line">{data.kitchen_info.resort_address}</p>
          <p>Phone: {data.kitchen_info.resort_contact}</p>
          <p>Email: {data.kitchen_info.resort_email}</p>
          <p>GSTIN: {data.kitchen_info.kitchen_gstin}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">KITCHEN AGGREGATED INVOICE</h2>
          <p>
            Date Range: {data.date_range.from_date} to {data.date_range.to_date}
          </p>
          <p className="mt-2">Guest: {data.guest_filter}</p>
        </div>
      </div>

      <div className="border-t border-b border-gray-200 py-4 mb-6">
        <h3 className="font-bold mb-2">Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p>Total Invoices: {data.summary.total_invoices}</p>
            <p>Total Amount: {formatCurrency(data.summary.total_amount)}</p>
          </div>
          <div>
            <p>Room Service: {data.summary.order_type_summary.room || 0}</p>
            <p>Walk-in: {data.summary.order_type_summary.walk_in || 0}</p>
          </div>
          <div>
            <p>Paid: {data.summary.payment_status_summary.paid}</p>
            <p>Pending: {data.summary.payment_status_summary.pending}</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Invoice Details</h3>
      {data.invoices.map((invoice, index) => (
        <div key={invoice.id} className="mb-8 border-b pb-6">
          <div className="flex justify-between mb-2">
            <div>
              <h4 className="font-bold">Invoice #{invoice.invoice_number}</h4>
              <p>Date: {formatDate(invoice.invoice_date)}</p>
              <p>Order #: {invoice.order_number}</p>
              <p>Type: {invoice.order_type.replace("_", " ")}</p>
            </div>
            <div className="text-right">
              <p>Status: {invoice.payment_status.toUpperCase()}</p>
              <p>Method: {invoice.payment_method.toUpperCase()}</p>
              <p className="font-bold">Total: {formatCurrency(invoice.total_amount)}</p>
            </div>
          </div>

          <table className="w-full mb-4">
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
                  <td className="py-2">
                    {item.item_name}
                    {item.item_description && <p className="text-xs text-gray-500">{item.item_description}</p>}
                  </td>
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
              <tr>
                <td colSpan={5} className="text-right font-bold py-2">
                  Total:
                </td>
                <td className="text-right font-bold py-2">{formatCurrency(invoice.total_amount)}</td>
              </tr>
            </tfoot>
          </table>

          {invoice.notes && (
            <div>
              <p className="font-medium">Notes:</p>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>
      ))}

      <div className="border-t border-gray-200 pt-4 mt-8">
        <h3 className="font-bold mb-2">Payment Summary</h3>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="font-medium">Total Subtotal:</td>
              <td className="text-right">{formatCurrency(data.summary.total_subtotal)}</td>
            </tr>
            <tr>
              <td className="font-medium">Total Tax:</td>
              <td className="text-right">{formatCurrency(data.summary.total_tax)}</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="font-bold text-lg py-2">Grand Total:</td>
              <td className="text-right font-bold text-lg py-2">{formatCurrency(data.summary.total_amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center text-sm text-gray-500 mt-12">
        <p>This is a computer-generated document. No signature is required.</p>
      </div>
    </div>
  )
}
