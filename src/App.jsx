import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { Layout } from './components/Shared';

import Home from './pages/Home';
import Accommodation from './pages/Accommodation';
import RoomDetails from './pages/RoomDetails';
import Booking from './pages/Booking';
import Dining from './pages/Dining';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import OfferDetails from './pages/OfferDetails';
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Scroll to the top whenever the page changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Main application
export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* --- ISOLATED ADMIN PANEL (Outside public website Layout) --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* --- PUBLIC RESORT WEBSITE (Inside Layout with Header/Footer) --- */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/accommodation" element={<Accommodation />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/dining" element={<Dining />} />
                <Route path="/events" element={<Events />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/offers/:id" element={<OfferDetails />} />
                
                {/* Redirect unknown public routes to the home page */}
                <Route path="*" element={<Home />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </>
  );
}