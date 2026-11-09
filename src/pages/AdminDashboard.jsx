import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    // Form states for adding content
    const [menuForm, setMenuForm] = useState({ name: "", category: "Breakfast", description: "", price: "", imageUrl: "" });
    const [offerForm, setOfferForm] = useState({ title: "", description: "", discountPercentage: "", validUntil: "", imageUrl: "" });
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const statsRes = await api.getAdminDashboard();
            const bookingsRes = await api.getAllAdminBookings();
            const customersRes = await api.getCustomers();

            setDashboardData(statsRes.data);
            setBookings(bookingsRes.data || []);
            setCustomers(customersRes.data || []);
        } catch (err) {
            setError(err.message || "Failed to load admin dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.addMenuItem(menuForm);
            setSuccessMsg("Menu item added successfully!");
            setMenuForm({ name: "", category: "Breakfast", description: "", price: "", imageUrl: "" });
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.addOffer(offerForm);
            setSuccessMsg("Offer published successfully!");
            setOfferForm({ title: "", description: "", discountPercentage: "", validUntil: "", imageUrl: "" });
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-amber-400 flex items-center justify-center text-xl">Loading Admin Portal...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center text-xl">{error}</div>;

    const stats = dashboardData?.stats || {};

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-amber-400">Island Taste - Admin Portal</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage resort operations, content, and track performance.</p>
                </div>
                <button 
                    onClick={() => { localStorage.clear(); window.location.href = "/admin/login"; }}
                    className="mt-4 md:mt-0 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                    Logout Admin
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
                {['overview', 'bookings', 'menu', 'offers', 'customers'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition ${
                            activeTab === tab 
                                ? 'bg-amber-500 text-gray-950 font-semibold shadow-lg shadow-amber-500/20' 
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-900/50 border border-emerald-700 text-emerald-300 rounded-lg">
                    {successMsg}
                </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-sm">Total Bookings</p>
                            <p className="text-3xl font-bold mt-2 text-white">{stats.totalBookings}</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <p className="text-3xl font-bold mt-2 text-emerald-400">${Number(stats.totalRevenue).toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-sm">Available Rooms</p>
                            <p className="text-3xl font-bold mt-2 text-white">{stats.availableRooms} / {stats.totalRooms}</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                            <p className="text-gray-400 text-sm">Occupancy Rate</p>
                            <p className="text-3xl font-bold mt-2 text-amber-300">{stats.occupancyRate}%</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-4 text-amber-400">Recent Reservations</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-700/50 text-gray-300">
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Check-In</th>
                                        <th className="p-3">Check-Out</th>
                                        <th className="p-3">Guests</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {dashboardData?.recentBookings?.map((b) => (
                                        <tr key={b.booking_id} className="hover:bg-gray-700/30">
                                            <td className="p-3 font-mono">#{b.booking_id}</td>
                                            <td className="p-3">{b.check_in?.split("T")[0]}</td>
                                            <td className="p-3">{b.check_out?.split("T")[0]}</td>
                                            <td className="p-3">{b.guests}</td>
                                            <td className="p-3 text-emerald-400 font-semibold">${b.total_amount}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-1 rounded text-xs uppercase bg-emerald-900/50 text-emerald-300 border border-emerald-700">
                                                    {b.booking_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BOOKINGS */}
            {activeTab === 'bookings' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4 text-amber-400">All Resort Reservations</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-700/50 text-gray-300">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Dates</th>
                                    <th className="p-3">Rooms / Numbers</th>
                                    <th className="p-3">Guests</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {bookings.map((b) => (
                                    <tr key={b.booking_id} className="hover:bg-gray-700/30">
                                        <td className="p-3 font-mono">#{b.booking_id}</td>
                                        <td className="p-3">{b.check_in?.split("T")[0]} to {b.check_out?.split("T")[0]}</td>
                                        <td className="p-3">{b.room_types || "Standard"} ({b.room_numbers || "N/A"})</td>
                                        <td className="p-3">{b.guests}</td>
                                        <td className="p-3 text-emerald-400 font-semibold">${b.total_amount}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 rounded text-xs uppercase bg-amber-900/50 text-amber-300 border border-amber-700">
                                                {b.booking_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: ADD MENU ITEM */}
            {activeTab === 'menu' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-amber-400">Add Restaurant Menu Item</h2>
                    <form onSubmit={handleMenuSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Dish Name</label>
                            <input 
                                type="text" 
                                value={menuForm.name} 
                                onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select 
                                value={menuForm.category} 
                                onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Beverages">Beverages</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea 
                                value={menuForm.description} 
                                onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={menuForm.price} 
                                onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                            <input 
                                type="text" 
                                value={menuForm.imageUrl} 
                                onChange={(e) => setMenuForm({...menuForm, imageUrl: e.target.value})}
                                placeholder="https://..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg transition">
                            Publish Menu Item
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 4: ADD OFFERS */}
            {activeTab === 'offers' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-amber-400">Publish Resort Offer</h2>
                    <form onSubmit={handleOfferSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Offer Title</label>
                            <input 
                                type="text" 
                                value={offerForm.title} 
                                onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea 
                                value={offerForm.description} 
                                onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                                rows="3"
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Discount Percentage (%)</label>
                                <input 
                                    type="number" 
                                    value={offerForm.discountPercentage} 
                                    onChange={(e) => setOfferForm({...offerForm, discountPercentage: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Valid Until</label>
                                <input 
                                    type="date" 
                                    value={offerForm.validUntil} 
                                    onChange={(e) => setOfferForm({...offerForm, validUntil: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                            <input 
                                type="text" 
                                value={offerForm.imageUrl} 
                                onChange={(e) => setOfferForm({...offerForm, imageUrl: e.target.value})}
                                placeholder="https://..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-amber-400 outline-none"
                            />
                        </div>
                        <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold py-3 rounded-lg transition">
                            Publish Offer
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 5: CUSTOMERS */}
            {activeTab === 'customers' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-4 text-amber-400">Customer Directory (CRM)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-700/50 text-gray-300">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3">Total Bookings</th>
                                    <th className="p-3">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {customers.map((c) => (
                                    <tr key={c.customer_id} className="hover:bg-gray-700/30">
                                        <td className="p-3 font-mono">#{c.customer_id}</td>
                                        <td className="p-3 font-medium">{c.name}</td>
                                        <td className="p-3 text-gray-300">{c.email}</td>
                                        <td className="p-3 text-gray-300">{c.phone || "N/A"}</td>
                                        <td className="p-3">{c.total_bookings}</td>
                                        <td className="p-3 text-emerald-400 font-semibold">${c.total_spent || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}