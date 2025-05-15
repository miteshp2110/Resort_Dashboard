type FetchOptions = {
  method?: string
  body?: any
  headers?: Record<string, string>
  isFormData?: boolean
}
// const baseUrl = "http://localhost:3001/api"
const baseUrl = "https://playlist-backend.tech/resort/api"


export const imageHeaderPath = `${baseUrl}/logo`
export const imageHeaderPath2 = `${baseUrl}/logo/footer`


export async function   fetchApi(endpoint: string, options: FetchOptions = {}) {
  const token = localStorage.getItem("token")
  // const baseUrl = "http://localhost:3001/api"
  const baseUrl = "https://playlist-backend.tech/resort/api"
  const url = `${baseUrl}${endpoint}`

  const headers: Record<string, string> = {
    ...options.headers,
  }

  if (!options.isFormData) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  }

  if (options.body) {
    fetchOptions.body = options.isFormData ? options.body : JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)

  // For non-JSON responses (like file downloads)
  if (response.headers.get("content-type")?.includes("application/pdf")) {
    return response.blob()
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "API request failed")
  }

  return data
}

// Auth
export const login = (username: string, password: string) =>
  fetchApi("/auth/login", { method: "POST", body: { username, password } })

// Users
export const getUsers = () => fetchApi("/users")
export const createUser = (userData: any) => fetchApi("/users", { method: "POST", body: userData })
export const updateUser = (id: number, userData: any) => fetchApi(`/users/${id}`, { method: "PUT", body: userData })
export const updateUserPassword = (id: number, password: string) =>
  fetchApi(`/users/${id}/password`, { method: "PUT", body: { password } })
export const deleteUser = (id: number) => fetchApi(`/users/${id}`, { method: "DELETE" })

// Settings
export const getSettings = () => fetchApi("/settings")
export const updateSettings = (formData: FormData) =>
  fetchApi("/settings", { method: "PUT", body: formData, isFormData: true })

// Menu Items
export const getMenuItems = (type?: string) => fetchApi(type ? `/menu-items?type=${type}` : "/menu-items")
export const createMenuItem = (itemData: any) => fetchApi("/menu-items", { method: "POST", body: itemData })
export const updateMenuItem = (id: number, itemData: any) =>
  fetchApi(`/menu-items/${id}`, { method: "PUT", body: itemData })
export const deleteMenuItem = (id: number) => fetchApi(`/menu-items/${id}`, { method: "DELETE" })

// Services
export const getServices = () => fetchApi("/services")
export const createService = (serviceData: any) => fetchApi("/services", { method: "POST", body: serviceData })
export const updateService = (id: number, serviceData: any) =>
  fetchApi(`/services/${id}`, { method: "PUT", body: serviceData })
export const deleteService = (id: number) => fetchApi(`/services/${id}`, { method: "DELETE" })

// Guests
export const getGuests = (search?: string) => fetchApi(search ? `/guests?search=${search}` : "/guests")
export const createGuest = (guestData: any) => fetchApi("/guests", { method: "POST", body: guestData })

// Kitchen Orders
export const getKitchenOrders = (params?: {
  start_date?: string
  end_date?: string
  status?: string
}) => {
  const queryParams = new URLSearchParams()
  if (params?.start_date) queryParams.append("start_date", params.start_date)
  if (params?.end_date) queryParams.append("end_date", params.end_date)
  if (params?.status) queryParams.append("status", params.status)

  const query = queryParams.toString()
  return fetchApi(query ? `/kitchen-orders?${query}` : "/kitchen-orders")
}
export const getKitchenOrderDetails = (id: number) => fetchApi(`/kitchen-orders/${id}`)
export const createKitchenOrder = (orderData: any) => fetchApi("/kitchen-orders", { method: "POST", body: orderData })
export const updateKitchenOrderStatus = (id: number, status: string) =>
  fetchApi(`/kitchen-orders/${id}/status`, { method: "PUT", body: { status } })
export const createInvoiceFromKitchenOrder = (id: number, paymentData: any) =>
  fetchApi(`/kitchen-orders/${id}/create-invoice`, { method: "POST", body: paymentData })

// Invoices
export const getInvoices = (params?: {
  start_date?: string
  end_date?: string
  type?: string
}) => {
  const queryParams = new URLSearchParams()
  if (params?.start_date) queryParams.append("start_date", params.start_date)
  if (params?.end_date) queryParams.append("end_date", params.end_date)
  if (params?.type) queryParams.append("type", params.type)

  const query = queryParams.toString()
  return fetchApi(query ? `/invoices?${query}` : "/invoices")
}

export const getInvoiceDetails = (id: number) => fetchApi(`/invoices/${id}`)
export const createInvoice = (invoiceData: any) => fetchApi("/invoices", { method: "POST", body: invoiceData })
export const updateInvoicePayment = (id: number, paymentData: any) =>
  fetchApi(`/invoices/${id}/payment`, { method: "PUT", body: paymentData })
export const emailInvoice = (id: number) =>
  fetchApi(`/invoices/${id}/email`, { method: "POST" })

export const deleteInvoice = (id: number) =>
    fetchApi(`/invoices/${id}`, { method: "DELETE" })

// Reports
export const getSalesReport = (params: {
  start_date: string
  end_date: string
  type?: string
}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("start_date", params.start_date)
  queryParams.append("end_date", params.end_date)
  if (params.type) queryParams.append("type", params.type)

  return fetchApi(`/reports/sales?${queryParams.toString()}`)
}

export const downloadSalesReportExcel = (params: {
  start_date: string
  end_date: string
  type?: string
}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("start_date", params.start_date)
  queryParams.append("end_date", params.end_date)
  if (params.type) queryParams.append("type", params.type)

  fetch(`${baseUrl}/reports/sales/excel?${queryParams.toString()}`)  // Replace with your actual Excel file URL
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();  // Get file as binary data
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);   // Create a downloadable link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reportSales.xlsx';  // Set filename for download
        document.body.appendChild(a);
        a.click();                   // Trigger download
        a.remove();                  // Cleanup
        URL.revokeObjectURL(url);   // Free memory
      })
      .catch(error => {
        console.error('Download failed:', error);
      });

}

export const downloadGSTReportExcel = (params: {
  start_date: string
  end_date: string
  type?: string
}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("start_date", params.start_date)
  queryParams.append("end_date", params.end_date)
  if (params.type) queryParams.append("type", params.type)

  fetch(`${baseUrl}/reports/gst/excel?${queryParams.toString()}`)  // Replace with your actual Excel file URL
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();  // Get file as binary data
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);   // Create a downloadable link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reportGST.xlsx';  // Set filename for download
        document.body.appendChild(a);
        a.click();                   // Trigger download
        a.remove();                  // Cleanup
        URL.revokeObjectURL(url);   // Free memory
      })
      .catch(error => {
        console.error('Download failed:', error);
      });

}

export const downloadKitchenReportExcel = (params: {
  start_date: string
  end_date: string
  type?: string
}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("start_date", params.start_date)
  queryParams.append("end_date", params.end_date)
  if (params.type) queryParams.append("type", params.type)

  fetch(`${baseUrl}/reports/kitchen-items/excel?${queryParams.toString()}`)  // Replace with your actual Excel file URL
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();  // Get file as binary data
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);   // Create a downloadable link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reportKitchen.xlsx';  // Set filename for download
        document.body.appendChild(a);
        a.click();                   // Trigger download
        a.remove();                  // Cleanup
        URL.revokeObjectURL(url);   // Free memory
      })
      .catch(error => {
        console.error('Download failed:', error);
      });

}

export const downloadResortReportExcel = () => {


  fetch(`${baseUrl}/reports/resort-details`)  // Replace with your actual Excel file URL
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();  // Get file as binary data
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);   // Create a downloadable link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reportResort.xlsx';  // Set filename for download
        document.body.appendChild(a);
        a.click();                   // Trigger download
        a.remove();                  // Cleanup
        URL.revokeObjectURL(url);   // Free memory
      })
      .catch(error => {
        console.error('Download failed:', error);
      });

}


export async function sendInvoiceEmail( fromDate:string, toDate:string, guestName:string, emailTo:string ) {
  const queryParams = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate,
    guest_name: guestName,
    email_to: emailTo
  });

  const url = `${baseUrl}/invoices/aggregated/resort/email?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    alert("Email sent")
    return data;
  } catch (error) {
    alert("Failed to send Email")
    throw error;
  }
}


export async function sendKitchenEmail( fromDate:string, toDate:string, guestName:string, emailTo:string ) {
  const queryParams = new URLSearchParams({
    from_date: fromDate,
    to_date: toDate,
    guest_name: guestName,
    email_to: emailTo
  });

  const url = `${baseUrl}/invoices/aggregated/kitchen/email?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    alert("Email sent")
    return data;
  } catch (error) {
    alert("Failed to send Email")
    throw error;
  }
}

export const getGstReport = (params: {
  start_date: string
  end_date: string
}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("start_date", params.start_date)
  queryParams.append("end_date", params.end_date)

  return fetchApi(`/reports/gst?${queryParams.toString()}`)
}

export const getKitchenItemsReport = (params: {
  start_date: string
  end_date: string
}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("start_date", params.start_date)
  queryParams.append("end_date", params.end_date)

  return fetchApi(`/reports/kitchen-items?${queryParams.toString()}`)
}

export const getDashboardData = () => fetchApi("/reports/dashboard")
