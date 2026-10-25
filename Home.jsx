import { useState } from "react";
import { Link } from "react-router-dom";
import { recommendedHotels, featuredIds } from "../data/places";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import PlaceCard from "../components/PlaceCard";
import HotelCard from "../components/HotelCard";
import PlaceModal from "../components/PlaceModal";
import HotelModal from "../components/HotelModal";
import AssistantWidget from "../components/AssistantWidget";

export default function Home() {
  const { places } = useApp();
  const [modalPlaceId, setModalPlaceId] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const featuredPlaces = featuredIds.map((id) => places.find((p) => p.id === id)).filter(Boolean);
  // Show only 6 handpicked hotels on the home page and hide the rest
  const displayedHotels = recommendedHotels.slice(0, 6);

  return (
    <>
      <Navbar />

      <header className="hero homeHero">
        <div className="eyebrow">India &middot; Live Crowd-Aware Tourism</div>
        <h1>Know before you go — and how crowded it'll be.</h1>
        <p>
          From hill stations to deserts, beaches to forests — check the best season, compare
          hotels, and plan your visit against each spot's daily footfall limit.
        </p>

        <div className="heroBtns" style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
          <Link to="/explore" className="heroPrimary">
            Explore all 63 destinations &rarr;
          </Link>
          <button type="button" className="heroSecondary" onClick={() => setAssistantOpen(true)}>
            💬 Ask TripWise
          </button>
        </div>
      </header>

      <section className="sectionWrap" id="featuredSection">
        <div className="sectionHead">
          <h2>Featured Destinations</h2>
          <div className="count mono">
            <Link to="/explore" className="seeAllLink">
              See all 63 &rarr;
            </Link>
          </div>
        </div>
        <div className="cardGrid" id="featuredGrid">
          {featuredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onView={setModalPlaceId} />
          ))}
        </div>
      </section>

      <section className="sectionWrap hotelsSection" id="hotelsSection">
        <div className="sectionHead">
          <h2>Recommended Hotels</h2>
          <div className="count mono">
            <Link to="/explore" className="seeAllLink">
              See all {recommendedHotels.length} &rarr;
            </Link>
          </div>
        </div>
        <div className="hotelGrid">
          {displayedHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onViewHotel={(h) => setSelectedHotel(h)}
              onViewDestination={(destId) => setModalPlaceId(destId)}
            />
          ))}
        </div>
      </section>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>

      {modalPlaceId !== null && (
        <PlaceModal placeId={modalPlaceId} onClose={() => setModalPlaceId(null)} />
      )}

      {selectedHotel !== null && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onViewDestination={(destId) => {
            setSelectedHotel(null);
            setModalPlaceId(destId);
          }}
        />
      )}

      <button className="assistantToggle" onClick={() => setAssistantOpen(true)}>
        💬 Ask TripWise
      </button>
      <AssistantWidget open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}