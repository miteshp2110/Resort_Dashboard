"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { fetchApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

type ResortAggregatedInvoice = {
  resort_info: {
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
    company_name: string | null
    gst_number: string | null
    guest_mobile: string
    subtotal: string
    tax_amount: string
    total_amount: string
    payment_status: string
    payment_method: string
    notes: string | null
    created_at: string
    created_by_username: string
    created_by_name: string
    check_in_time: string | null
    check_out_time: string | null
    items: Array<{
      id: number
      invoice_id: number
      item_id: number | null
      service_id: number | null
      item_name: string
      quantity: number
      rate: string
      gst_percentage: string
      gst_amount: string
      total: string
      booking_date: string | null
      item_type: string
    }>
  }>
  summary: {
    total_invoices: number
    total_subtotal: number
    total_tax: number
    total_amount: number
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

export default function ResortAggregatedInvoicePrintPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ResortAggregatedInvoice | null>(null)

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
        `/invoices/aggregated/resort?from_date=${fromDate}&to_date=${toDate}&guest_name=${guestName}`,
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
                alt={data.resort_info.resort_name}
                fill
                className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">{data.resort_info.resort_name}</h1>
          <p className="whitespace-pre-line">{data.resort_info.resort_address}</p>
          <p>Phone: {data.resort_info.resort_contact}</p>
          <p>Email: {data.resort_info.resort_email}</p>
          <p>GSTIN: {data.resort_info.resort_gstin}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">AGGREGATED INVOICE</h2>
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
            <p>Paid: {data.summary.payment_status_summary.paid}</p>
            <p>Pending: {data.summary.payment_status_summary.pending}</p>
            <p>Cancelled: {data.summary.payment_status_summary.cancelled}</p>
          </div>
          <div>
            <p>Cash: {data.summary.payment_method_summary.cash}</p>
            <p>Card: {data.summary.payment_method_summary.card}</p>
            <p>UPI: {data.summary.payment_method_summary.upi}</p>
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
              <p>Created by: {invoice.created_by_name}</p>
              {invoice.check_in_time && <p>Check-in Time: {invoice.check_in_time}</p>}
              {invoice.check_out_time && <p>Check-out Time: {invoice.check_out_time}</p>}
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
                  <td className="py-2">{item.item_name}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.rate)}</td>
                  <td className="text-right py-2">
                    CGST: {Number(item.gst_percentage)/2}% + SGST: {Number(item.gst_percentage)/2}%
                  </td>
                  <td className="text-right py-2">
                    {formatCurrency(Number(item.gst_amount)/2)} + {formatCurrency(Number(item.gst_amount)/2)}
                  </td>
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
                <td colSpan={5} className="text-right font-medium">
                  CGST ({Number(invoice.items[0]?.gst_percentage)/2}%):
                </td>
                <td className="text-right font-medium">{formatCurrency(Number(invoice.tax_amount) / 2)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right font-medium">
                  SGST ({Number(invoice.items[0]?.gst_percentage)/2}%):
                </td>
                <td className="text-right font-medium">{formatCurrency(Number(invoice.tax_amount) / 2)}</td>
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
              <td className="font-medium">Total CGST (9%):</td>
              <td className="text-right">{formatCurrency(data.summary.total_tax / 2)}</td>
            </tr>
            <tr>
              <td className="font-medium">Total SGST (9%):</td>
              <td className="text-right">{formatCurrency(data.summary.total_tax / 2)}</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="font-bold text-lg py-2">Grand Total:</td>
              <td className="text-right font-bold text-lg py-2">{formatCurrency(data.summary.total_amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* <div className="text-center text-sm text-gray-500 mt-12">
        <p>This is a computer-generated document. No signature is required.</p>
      </div> */}

      {/* Signature section at the bottom */}
      <div style={{ flex: 1 }} />
      <div className="mt-12 flex justify-between print-signatures">
        <div className="text-center print-signature-box">
          <div className="border-t-2 border-gray-400 w-48 pt-2 mx-auto">
            <p className="font-bold">Manager Signature</p>
          </div>
        </div>
        <div className="text-center print-signature-box">
          <div className="border-t-2 border-gray-400 w-48 pt-2 mx-auto">
            <p className="font-bold">Customer Signature</p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body { zoom: 0.75; }
          .print-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 48px;
            page-break-inside: avoid;
            align-items: flex-end;
            min-height: 80px;
          }
          .print-signature-box {
            width: 40%;
            text-align: center;
            border-top: none;
            padding-top: 0;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
