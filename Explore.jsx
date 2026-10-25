import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { categories, regions, recommendedHotels } from "../data/places";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import PlaceCard from "../components/PlaceCard";
import HotelCard from "../components/HotelCard";
import PlaceModal from "../components/PlaceModal";
import HotelModal from "../components/HotelModal";
import AssistantWidget from "../components/AssistantWidget";

export default function Explore() {
  const { places } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeRegion, setActiveRegion] = useState("All");
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [modalPlaceId, setModalPlaceId] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Pagination states - 2 rows (6 items) by default
  const [visibleDestCount, setVisibleDestCount] = useState(6);
  const [visibleHotelCount, setVisibleHotelCount] = useState(6);

  // Synchronize when query parameter changes
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Reset pagination whenever search term or filters change
  useEffect(() => {
    setVisibleDestCount(6);
    setVisibleHotelCount(6);
  }, [searchTerm, activeCategory, activeRegion]);

  const filtered = useMemo(() => {
    return places.filter((place) => {
      const matchesCategory = activeCategory === "All" || place.category === activeCategory;
      const matchesRegion = activeRegion === "All" || place.region === activeRegion;
      const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [places, activeCategory, activeRegion, searchTerm]);

  const displayedPlaces = useMemo(() => {
    return filtered.slice(0, visibleDestCount);
  }, [filtered, visibleDestCount]);

  const filteredHotels = useMemo(() => {
    return recommendedHotels.filter((hotel) => {
      const matchesCategory = activeCategory === "All" || hotel.category === activeCategory;
      const matchesRegion = activeRegion === "All" || hotel.region === activeRegion;
      const matchesSearch =
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.destinationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [activeCategory, activeRegion, searchTerm]);

  const displayedHotels = useMemo(() => {
    return filteredHotels.slice(0, visibleHotelCount);
  }, [filteredHotels, visibleHotelCount]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <Navbar extraLink={{ label: "Ask TripWise", onClick: () => setAssistantOpen(true) }} />

      <header className="hero exploreHero">
        <div className="eyebrow">India &middot; Tourism Guide</div>
        <h1>Explore every destination.</h1>
        <p>Search by name, or filter by terrain and region — from the Himalayas to the islands.</p>

        <div className="searchBar">
          <input
            type="text"
            placeholder="Search a place... e.g. Munnar, Jaipur, Manali"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button type="button">Search</button>
        </div>

        <div className="filterRow">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filterChip${cat === activeCategory ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="filterRow regionRow">
          {regions.map((reg) => (
            <button
              key={reg}
              className={`filterChip regionChip${reg === activeRegion ? " active" : ""}`}
              onClick={() => setActiveRegion(reg)}
            >
              {reg}
            </button>
          ))}
        </div>
      </header>

      <section className="sectionWrap exploreCardsSection" id="placesSection">
        <div className="sectionHead">
          <h2>All Destinations</h2>
          <div className="count mono">
            {filtered.length === 0
              ? "0 spots"
              : `Showing ${displayedPlaces.length} of ${filtered.length} spots`}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="emptyState">No places match your search. Try a different name or filter.</div>
        ) : (
          <>
            <div className="cardGrid">
              {displayedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onView={setModalPlaceId} />
              ))}
            </div>

            {visibleDestCount < filtered.length && (
              <div className="showMoreWrap">
                <button
                  type="button"
                  className="showMoreBtn"
                  onClick={() => setVisibleDestCount((prev) => prev + 6)}
                >
                  Show More Destinations ↓
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* RECOMMENDED HOTELS & STAYS SECTION */}
      <section className="sectionWrap hotelsSection" id="exploreHotelsSection">
        <div className="sectionHead">
          <h2>Recommended Hotels & Stays</h2>
          <div className="count mono">
            {filteredHotels.length === 0
              ? "0 stays"
              : `Showing ${displayedHotels.length} of ${filteredHotels.length} stays`}
          </div>
        </div>
        {filteredHotels.length === 0 ? (
          <div className="emptyState">No hotels match your current search or filter.</div>
        ) : (
          <>
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

            {visibleHotelCount < filteredHotels.length && (
              <div className="showMoreWrap">
                <button
                  type="button"
                  className="showMoreBtn"
                  onClick={() => setVisibleHotelCount((prev) => prev + 6)}
                >
                  Show More Hotels ↓
                </button>
              </div>
            )}
          </>
        )}
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