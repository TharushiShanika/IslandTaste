
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { photos, rooms, offers } from '../data/siteData';

import {
  BookingBar,
  ButtonLink,
  RoomCard,
  SectionHeading,
  Notice,
} from '../components/Shared';

// Reusable scroll animation
const FadeIn = ({
  children,
  delay = 0,
  className = '',
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{
      duration: 0.7,
      delay,
      ease: 'easeOut',
    }}
  >
    {children}
  </motion.div>
);

// Staggered animation for cards
const StaggerContainer = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.15 }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.15,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children }) => (
  <motion.div
    variants={{
      hidden: {
        opacity: 0,
        y: 30,
      },
      visible: {
        opacity: 1,
        y: 0,
      },
    }}
    transition={{
      duration: 0.6,
      ease: 'easeOut',
    }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [showDeal, setShowDeal] = useState(
    !sessionStorage.getItem('island-deal-dismissed')
  );

  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  // Copy promotional code
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText('SUMMER15');
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  // Booking search
  const search = (data) => {
    sessionStorage.setItem(
      'booking-search',
      JSON.stringify(data)
    );

    window.location.href = '/booking';
  };

  // Close promotional popup
  const closeDeal = () => {
    setShowDeal(false);
    sessionStorage.setItem('island-deal-dismissed', '1');
  };

  return (
    <>
      {/* HERO SECTION */}
      <section
        className="home-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.18)),url("${photos.hero}")`,
        }}
      >
        <motion.div
          className="container home-hero-copy"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: 'easeOut',
          }}
        >
          <span>ISLAND TASTE</span>

          <h1>A Taste of Sri Lanka</h1>

          <p>
            Experience authentic flavors, serene stays and warm
            island hospitality at Island Taste.
          </p>

          <ButtonLink to="/accommodation">
            Explore Our Suites
          </ButtonLink>
        </motion.div>
      </section>

      {/* BOOKING BAR */}
      <FadeIn>
        <div className="container booking-overlap">
          <BookingBar onSearch={search} />
        </div>
      </FadeIn>

      {/* WELCOME SECTION */}
      <FadeIn>
        <section className="container welcome-section">
          <div className="welcome-images">
            <img
              src={photos.hotel}
              alt="Island Taste resort"
            />

            <img
              src={photos.garden}
              alt="Tropical garden"
            />
          </div>

          <div className="welcome-copy">
            <span className="eyebrow">
              WELCOME TO ISLAND TASTE
            </span>

            <h2>
              A Place of Comfort, Luxury and Warm Hospitality
            </h2>

            <p>
              Nestled by the ocean, our hotel offers a perfect
              blend of modern comfort and natural beauty.
              Whether you're here for a relaxing getaway or a
              memorable holiday, we promise an experience like
              no other.
            </p>

            <ul className="check-list">
              {[
                'Ocean View Rooms & Suites',
                'Fine Dining Restaurant',
                'Swimming Pool',
                'Spa & Wellness',
              ].map((x) => (
                <li key={x}>
                  <Check />
                  {x}
                </li>
              ))}
            </ul>

            <ButtonLink to="/about">
              Discover Our Hotel
            </ButtonLink>
          </div>
        </section>
      </FadeIn>

      {/* FEATURED SUITES */}
      <section className="container section-space">
        <FadeIn>
          <SectionHeading
            eyebrow="FEATURED SUITES"
            title="Discover Our Suites"
          />
        </FadeIn>

        <StaggerContainer className="room-grid">
          {rooms.map((r) => (
            <StaggerItem key={r.id}>
              <RoomCard room={r} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn>
          <div className="center">
            <ButtonLink to="/accommodation">
              View All Rooms
              <ArrowRight size={16} />
            </ButtonLink>
          </div>
        </FadeIn>
      </section>

      {/* GUEST REVIEWS */}
      <section className="reviews-section">
        <div className="container">
          <FadeIn>
            <SectionHeading
              eyebrow="GUEST REVIEWS"
              title="What Our Guests Say"
            />
          </FadeIn>

          <StaggerContainer className="review-grid">
            {[
              [
                'A beautiful and peaceful escape',
                'The rooms were comfortable, clean, and beautifully designed. The staff were incredibly welcoming.',
                'Sarah M., Colombo',
              ],
              [
                'An unforgettable experience',
                'From the beautiful surroundings to the friendly staff, every detail made our stay special.',
                'Emma W., Singapore',
              ],
              [
                'A wonderful holiday',
                'A relaxing place with excellent service and delicious food. We hope to visit again.',
                'Nimal P., Kandy',
              ],
            ].map(([title, body, name]) => (
              <StaggerItem key={name}>
                <article className="review-card">
                  <div className="stars">★★★★★</div>

                  <strong>{title}</strong>

                  <p>{body}</p>

                  <small>{name} · Guest</small>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* SPECIAL OFFERS */}
      <section className="container section-space">
        <FadeIn>
          <SectionHeading
            eyebrow="EXCLUSIVE OFFERS"
            title="Special Offers & Packages"
          />
        </FadeIn>

        <StaggerContainer className="offer-grid">
          {offers.map((o) => (
            <StaggerItem key={o.id}>
              <article className="offer-card">
                <div className="offer-image">
                  <img src={o.image} alt={o.name} />
                  <b>{o.discount} OFF</b>
                </div>

                <div className="offer-body">
                  <h3>{o.name}</h3>

                  <p>{o.description}</p>

                  <div className="offer-code">
                    <span>
                      <CalendarDays size={15} />
                      Valid for selected dates
                    </span>

                    <span>
                      Promo Code <b>{o.code}</b>
                    </span>
                  </div>

                  <ul>
                    {o.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>

                  <ButtonLink to={`/offers/${o.id}`}>
                    Book This Offer
                    <ArrowRight size={15} />
                  </ButtonLink>

                  <small>
                    ⓘ Terms & Conditions Apply
                  </small>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CLOSING CALL TO ACTION */}
      <FadeIn>
        <section className="closing-cta">
          <div className="container">
            <span className="eyebrow">
              EXPERIENCE ISLAND HOSPITALITY
            </span>

            <h2>
              Your Island Escape, Beautiful Experience
            </h2>

            <p>
              Discover a place where comfort, local flavors,
              leisure and adventure come together. From
              relaxing stays to unforgettable experiences,
              make every moment at Island Taste worth
              remembering.
            </p>

            <ButtonLink to="/booking">
              Book Your Stay
            </ButtonLink>
          </div>
        </section>
      </FadeIn>

      {/* PROMOTIONAL POPUP */}
      {showDeal && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="deal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="deal-title"
          >
            <button
              className="modal-close"
              onClick={closeDeal}
              aria-label="Close"
            >
              ×
            </button>

            <img
              src={photos.pool}
              alt="Poolside summer escape"
            />

            <div className="deal-modal-content">
              <span className="eyebrow">
                A LITTLE SOMETHING FOR YOU
              </span>

              <h2 id="deal-title">
                Your Summer Escape Awaits
              </h2>

              <p>
                Enjoy a special offer on your next Island
                Taste stay.
              </p>

              <div className="voucher">
                <span>SUMMER15</span>

                <button onClick={copyCode}>
                  <Copy size={15} />
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <ButtonLink to="/offers/summer-escape">
                Claim Deal
              </ButtonLink>

              <button
                className="text-button"
                onClick={closeDeal}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <Notice>{notice}</Notice>
    </>
  );
}
