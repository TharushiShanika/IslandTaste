import React, { useState } from "react";
import { api } from "../services/api";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.adminLogin({ email, password });
            if (response.success) {
                // Redirect to the admin dashboard on successful login
                window.location.href = "/admin/dashboard";
            }
        } catch (err) {
            setError(err.message || "Invalid admin credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-amber-400">Island Taste</h1>
                    <p className="text-gray-400 text-sm mt-2">Hotel Administrator Portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-900/50 border border-rose-700 text-rose-300 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Admin Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@islandtaste.com"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none transition"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg transition duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login to Dashboard"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-xs text-gray-400 hover:text-amber-400 transition">
                        ← Back to Public Website
                    </a>
                </div>
            </div>
        </div>
    );
}