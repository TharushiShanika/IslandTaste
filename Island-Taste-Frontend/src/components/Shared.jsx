import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Menu, X, ChevronDown, Star, Wifi, Waves, Car, Coffee } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MessageCircle, Gift } from 'lucide-react'
import { navItems, photos } from '../data/siteData'

export function ButtonLink({ to, children, outline = false, className = '' }) {
  return <Link className={`btn ${outline ? 'btn-outline' : ''} ${className}`} to={to}>{children}</Link>
}
export function SectionHeading({ eyebrow, title, text, light = false }) {
  return <div className={`section-heading ${light ? 'light' : ''}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>
}
export function PageHero({ eyebrow, title, text, image = photos.hero, compact = false }) {
  return <section className={`page-hero ${compact ? 'compact' : ''}`} style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.12)),url("${image}")` }}><div className="container hero-copy"><span>{eyebrow}</span><h1>{title}</h1>{text && <p>{text}</p>}</div></section>
}
export function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><div className="container nav-wrap">
    <Link to="/" className="brand" aria-label="Island Taste home"><img src={`${import.meta.env.BASE_URL}assets/island-taste-logo.png`} alt="Island Taste" /><span>ISLAND<br/>TASTE</span></Link>
    <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
    <nav className={open ? 'nav-links open' : 'nav-links'}>{navItems.map(([label, path]) => <Link key={path} to={path} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
    <div className="nav-actions"><a className="phone-link" href="tel:+94312210670"><Phone size={16}/> +94 31 2210670</a><ButtonLink to="/booking">Book Now</ButtonLink></div>
  </div></header>
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        <div className="footer-brand">
          <div className="footer-logo">
            <img
              src={`${import.meta.env.BASE_URL}assets/footer_image.png`}
              alt="Island Taste by Mahameruwa"
            />
          </div>

          <p>
            A complete resort experience blending comfortable accommodation,
            delicious dining, sports, leisure and adventure.
          </p>

          <a
            href="https://maps.google.com/?q=Island+Taste+Sri+Lanka"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={16} />
            Find us on Google Map
            <ArrowRight size={15} />
          </a>
        </div>

        <div>
          <h3>Quick Links</h3>
          {navItems.map(([n, p]) => (
            <Link key={p} to={p}>
              {n === 'About' ? 'About Us' : n}
            </Link>
          ))}
        </div>

        <div>
          <h3>Our Services</h3>
          <Link to="/booking">Online Booking</Link>
          <Link to="/booking">Reservations</Link>
          <Link to="/dining">Dine In</Link>
          <Link to="/dining">Take Away</Link>
          <Link to="/dining">Delivery</Link>
          <Link to="/events">Sports & Leisure</Link>
          <Link to="/events">Adventure Experiences</Link>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p><Phone size={15} /> +94 31 2210670</p>
          <p><Mail size={15} /> islandtastemahameruwa@gmail.com</p>
          <p>
            <MapPin size={15} />
            No:100/15, Wonderland Park,
            <br />Palagathure, Kochchikade
          </p>

          <h3 className="follow-title">Follow Us</h3>
          <div className="socials">
            <a href="#facebook" aria-label="Facebook"><Facebook /></a>
            <a href="#instagram" aria-label="Instagram"><Instagram /></a>
            <a href="#youtube" aria-label="YouTube"><Youtube /></a>
          </div>
        </div>

      </div>

      <div className="container footer-bottom">
        <span>© 2026 Island Taste Resort & Restaurant. All Rights Reserved.</span>
        <span>
          <Link to="/contact">Privacy Policy</Link> |
          <Link to="/contact">Terms & Conditions</Link> |
          <Link to="/contact">Cancellation Policy</Link>
        </span>
      </div>
    </footer>
  );
}
function FloatingOfferAndWhatsApp() {
  const { pathname } = useLocation()
  const [showOffer, setShowOffer] = useState(false)
  const [offerMinimized, setOfferMinimized] = useState(false)

  useEffect(() => {
    // Show the offer once per browser session, only after the home page has settled.
    const alreadySeen = sessionStorage.getItem('island-deal-seen') === '1'
    const wasMinimized = sessionStorage.getItem('island-deal-minimized') === '1'

    if (wasMinimized || alreadySeen) {
      setOfferMinimized(true)
      return
    }
    if (pathname !== '/') return

    const timer = window.setTimeout(() => {
      setShowOffer(true)
      sessionStorage.setItem('island-deal-seen', '1')
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [pathname])

  const minimizeOffer = () => {
    setShowOffer(false)
    setOfferMinimized(true)
    sessionStorage.setItem('island-deal-minimized', '1')
  }

  const reopenOffer = () => {
    setOfferMinimized(false)
    setShowOffer(true)
  }

  return <>
    {showOffer && (
      <div className="modal-backdrop promo-backdrop" role="presentation" onMouseDown={(event) => {
        if (event.target === event.currentTarget) minimizeOffer()
      }}>
        <section className="deal-modal" role="dialog" aria-modal="true" aria-labelledby="floating-deal-title">
          <button className="modal-close" onClick={minimizeOffer} aria-label="Minimize offer">×</button>
          <img src="https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=1000&q=85" alt="Resort swimming pool" />
          <div className="deal-modal-content">
            <span className="eyebrow">A LITTLE SOMETHING FOR YOU</span>
            <h2 id="floating-deal-title">Your Summer Escape Awaits</h2>
            <p>Enjoy a special offer on your next Island Taste stay.</p>
            <div className="voucher"><span>SUMMER15</span><span className="voucher-hint">Promo Code</span></div>
            <Link className="btn" to="/offers/summer-escape" onClick={() => setShowOffer(false)}>Claim Deal</Link>
            <button className="text-button" onClick={minimizeOffer}>Maybe later</button>
          </div>
        </section>
      </div>
    )}

    {offerMinimized && !showOffer && (
      <button className="floating-offer-tab" onClick={reopenOffer} aria-label="Open special offer">
        <Gift size={18} /> <span>Special Offer</span>
      </button>
    )}

    <a className="floating-whatsapp" href="https://wa.me/94312210670?text=Hello%20Island%20Taste%2C%20I%20would%20like%20to%20make%20an%20inquiry." target="_blank" rel="noreferrer" aria-label="Chat with Island Taste on WhatsApp">
      <MessageCircle size={25} /> <span>Chat with us</span>
    </a>
  </>
}

export function Layout({ children }) {
  return <><Header/><main>{children}</main><Footer/><FloatingOfferAndWhatsApp/></>
}
export function BookingBar({ onSearch }) {
  const [form, setForm] = useState({ checkIn: '', checkOut: '', adults: '2', children: '0', currency: 'LKR' })
  const change = e => setForm({ ...form, [e.target.name]: e.target.value })
  return <form className="booking-bar" onSubmit={e => { e.preventDefault(); onSearch?.(form) }}>
    <label><span>Check-in</span><input type="date" name="checkIn" value={form.checkIn} onChange={change} required /></label>
    <label><span>Check-out</span><input type="date" name="checkOut" value={form.checkOut} onChange={change} required /></label>
    <label><span>Adults</span><select name="adults" value={form.adults} onChange={change}>{[1,2,3,4,5,6].map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>Children</span><select name="children" value={form.children} onChange={change}>{[0,1,2,3,4].map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>Currency</span><select name="currency" value={form.currency} onChange={change}><option>LKR</option><option>USD</option><option>EUR</option><option>GBP</option></select></label>
    <button className="btn" type="submit">Check Availability</button>
  </form>
}
export function RoomCard({ room }) {
  return <article className="room-card"><Link to={`/rooms/${room.id}`}><img src={room.image} alt={room.name}/></Link><div className="room-card-body"><h3>{room.name}</h3><p>{room.description}</p><div className="room-meta">{room.guests} Guests&nbsp; | &nbsp;{room.beds}&nbsp; | &nbsp;{room.view}</div><div className="room-price">From LKR {room.price.toLocaleString('en-US')} <small>/ night</small></div><div className="card-actions"><ButtonLink to={`/rooms/${room.id}`} outline>View Details</ButtonLink><ButtonLink to="/booking">Book Now</ButtonLink></div></div></article>
}
export function FeatureStrip() {
  const items = [[<Star/>, 'Exclusive Offer', 'Special deals for our guests'], [<Coffee/>, 'Flexible Booking', 'Modify with ease'], [<Waves/>, 'Direct Support', 'Real people, real help'], [<Wifi/>, 'Local Experience', 'Discover the real Sri Lanka']]
  return <div className="feature-strip">{items.map(([icon,title,desc])=><div key={title}>{icon}<strong>{title}</strong><span>{desc}</span></div>)}</div>
}
export function FAQ({ items }) {
  const [active,setActive] = useState(0)
  return <div className="faq-list">{items.map((item,i)=><div className="faq-item" key={item.q}><button onClick={()=>setActive(active===i?-1:i)}>{item.q}<ChevronDown className={active===i?'rotated':''}/></button>{active===i&&<p>{item.a}</p>}</div>)}</div>
}
export function Notice({ children, type='success' }) { return children ? <div className={`notice ${type}`} role="status">{children}</div> : null }