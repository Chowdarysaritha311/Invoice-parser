import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:8000', timeout: 120000 })

API.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export const checkHealth     = ()            => API.get('/health')
export const extractInvoice  = (formData)    => API.post('/invoice/extract', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 })
export const saveInvoice     = (data)        => API.post('/invoice/save', data)
export const batchUpload     = (formData)    => API.post('/invoice/batch', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600000 })
export const getAllInvoices   = ()            => API.get('/invoice/all')
export const searchInvoices  = (q, field)    => API.get('/invoice/search', { params: { q, field } })
export const updateInvoice   = (data)        => API.put('/invoice/update', data)
export const deleteInvoice   = (row)         => API.delete(`/invoice/delete/${row}`)
export const getMonthlySummary = (month, yr) => API.get(`/invoice/summary/${month}/${yr}`)
export const getVendorHistory  = (vendor)    => API.get(`/invoice/vendor/${encodeURIComponent(vendor)}`)
export const downloadExcel   = ()            => window.open('http://localhost:8000/invoice/download')

export default API
