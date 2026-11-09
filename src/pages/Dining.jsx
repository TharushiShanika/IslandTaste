import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Dining() {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        // Fetch dynamic menu from backend database
        fetch("http://localhost:5000/api/menu")
            .then(res => res.json())
            .then(data => setMenuItems(data.data || []))
            .catch(err => console.error("Error loading menu:", err));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Resort Dining Menu</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {menuItems.map(item => (
                    <div key={item.item_id} className="bg-white p-4 rounded-lg shadow">
                        <img src={item.image_url} alt={item.name} className="h-48 w-full object-cover rounded" />
                        <h3 className="text-xl font-semibold mt-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                        <p className="text-emerald-600 font-bold mt-2">${item.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}