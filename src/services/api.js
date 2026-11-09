const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function for API requests including credentials (cookies)
async function fetchApi(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        credentials: "include", // Essential for sending/receiving the HTTP-only JWT admin cookie
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
}

export const api = {
    // Admin Auth
    adminLogin: (credentials) => fetchApi("/admin/login", { method: "POST", body: JSON.stringify(credentials) }),
    
    // Admin Dashboard Stats & Bookings
    getAdminDashboard: () => fetchApi("/admin/dashboard"),
    getAllAdminBookings: () => fetchApi("/admin/bookings"),
    updateRoomStatus: (roomId, roomStatus) => fetchApi(`/admin/rooms/${roomId}/status`, { method: "PUT", body: JSON.stringify({ roomStatus }) }),
    
    // Monthly Financial Reports & CMS
    getMonthlyReport: (year, month) => fetchApi(`/admin/reports/monthly?year=${year}&month=${month}`),
    addMenuItem: (itemData) => fetchApi("/admin/menu", { method: "POST", body: JSON.stringify(itemData) }),
    addOffer: (offerData) => fetchApi("/admin/offers", { method: "POST", body: JSON.stringify(offerData) }),
    getCustomers: () => fetchApi("/admin/customers"),
};