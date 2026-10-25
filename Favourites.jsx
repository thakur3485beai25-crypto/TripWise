import { useState } from "react";
import { Link } from "react-router-dom";
import { recommendedHotels } from "../data/places";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import PlaceCard from "../components/PlaceCard";
import HotelCard from "../components/HotelCard";
import PlaceModal from "../components/PlaceModal";
import HotelModal from "../components/HotelModal";

export default function Favourites() {
  const { places, favourites } = useApp();
  const [modalPlaceId, setModalPlaceId] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Match saved ids to full place / hotel objects
  const savedPlaces = places.filter((place) =>
    (favourites?.places || []).some((favId) => String(favId) === String(place.id))
  );

  const savedHotels = recommendedHotels.filter((hotel) =>
    (favourites?.hotels || []).some((favId) => String(favId) === String(hotel.id))
  );

  return (
    <>
      <Navbar />

      <header className="hero favouritesHero">
        <div className="eyebrow">Wishlist</div>
        <h1>Your Favourites</h1>
        <p>Destinations and hotels you saved with the heart. Tap the filled heart again to remove them.</p>
      </header>

      <main className="favouritesPage">
        <section className="sectionWrap">
          <div className="sectionHead">
            <h2>Saved Destinations</h2>
            <div className="count mono">
              {savedPlaces.length === 0 ? "0 saved" : `${savedPlaces.length} saved`}
            </div>
          </div>

          {savedPlaces.length === 0 ? (
            <div className="emptyState favEmptyState">
              No saved destinations yet. Explore places and tap the heart to save them.{" "}
              <Link to="/explore">Explore destinations →</Link>
            </div>
          ) : (
            <div className="cardGrid">
              {savedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onView={setModalPlaceId} />
              ))}
            </div>
          )}
        </section>

        <section className="sectionWrap hotelsSection">
          <div className="sectionHead">
            <h2>Saved Hotels</h2>
            <div className="count mono">
              {savedHotels.length === 0 ? "0 saved" : `${savedHotels.length} saved`}
            </div>
          </div>

          {savedHotels.length === 0 ? (
            <div className="emptyState favEmptyState">
              No saved hotels yet. Explore stays and tap the heart to save them.{" "}
              <Link to="/explore">Explore hotels →</Link>
            </div>
          ) : (
            <div className="hotelGrid">
              {savedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onViewHotel={(h) => setSelectedHotel(h)}
                  onViewDestination={(destId) => setModalPlaceId(destId)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

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
    </>
  );
}
