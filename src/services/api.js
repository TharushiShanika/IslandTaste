const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
  return data
}

// Adjust these paths to match the routes in your Node.js / Express backend.
export const api = {
  checkAvailability: (payload) => request('/bookings/availability', { method: 'POST', body: JSON.stringify(payload) }),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  submitReview: (payload) => request('/reviews', { method: 'POST', body: JSON.stringify(payload) })
}

export const isApiConfigured = Boolean(import.meta.env.VITE_API_BASE_URL)