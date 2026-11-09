import React from "react";

export default function ProtectedRoute({ children }) {
    // Check if the admin is authenticated (you can check localStorage or your auth state)
    // For single-server setups using HTTP-only cookies, you can also let the backend block unauthorized API requests,
    // but here is a lightweight client-side check if you store a user token/flag:
    
    // If you saved user data in localStorage on login:
    const adminUser = localStorage.getItem("adminUser") || true; // Set to true temporarily or tie to your login state

    if (!adminUser) {
        window.location.href = "/admin/login";
        return null;
    }

    return children;
}