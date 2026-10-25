import { useState } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_PREVIOUS_TRIPS } from "../data/places";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import HotelReviewItem from "../components/HotelReviewItem";
import PreviousTripCard from "../components/PreviousTripCard";

export default function MyTrips() {
  const {
    places,
    visitedPlaces,
    markAsVisited,
    removeVisitedPlace,
    currentUser,
  } = useApp();
  const [selectedPlaceToAdd, setSelectedPlaceToAdd] = useState("");

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="authWrap">
          <div className="authPromptCard">
            <div className="eyebrow" style={{ color: "var(--clay)" }}>Your Travel Journey</div>
            <h2>Log in to see your trips</h2>
            <p>
              Sign in to view destinations you've visited, access your hotel stays & receipts,
              and share reviews for hotels you've stayed at.
            </p>
            <Link to="/login" className="heroExploreBtn">
              Log In to TripWise
            </Link>
          </div>
        </div>
        <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
      </>
    );
  }

  // Filter visited places for current user
  const userVisited = visitedPlaces.filter(
    (v) => v.userEmail === currentUser.email || !v.userEmail
  );

  const previousTrips = DEFAULT_PREVIOUS_TRIPS;
  const totalExpenditure = previousTrips.reduce((acc, t) => acc + (t.totalPaid || 0), 0);

  const handleAddVisited = (e) => {
    e.preventDefault();
    if (!selectedPlaceToAdd) return;
    markAsVisited(Number(selectedPlaceToAdd));
    setSelectedPlaceToAdd("");
  };

  return (
    <>
      <Navbar />

      <header className="hero myTripsHero">
        <div className="eyebrow">Personal Travel Log</div>
        <h1>My Trips, Bookings & Receipts</h1>
        <p>Review completed itineraries, hotel stays, verified reviews, and official itemized receipts.</p>
      </header>

      <main className="myTripsWrap">
        {/* Quick Stats Grid */}
        <div className="genericStatsRow" style={{ marginBottom: "32px" }}>
          <div className="genericStatBox">
            <div className="genericStatNumber">{previousTrips.length}</div>
            <div className="genericStatLabel">Completed Trips</div>
          </div>
          <div className="genericStatBox">
            <div className="genericStatNumber">₹{totalExpenditure.toLocaleString()}</div>
            <div className="genericStatLabel">Total Spent</div>
          </div>
          <div className="genericStatBox">
            <div className="genericStatNumber">{userVisited.length}</div>
            <div className="genericStatLabel">Visited Places</div>
          </div>
        </div>

        {/* 1. COMPLETED TRIPS WITH HOTEL, REVIEWS & EXPANDABLE RECEIPTS */}
        <div className="sectionHead">
          <h2>Past Travel & Bookings</h2>
          <div className="count mono">{previousTrips.length} completed trips</div>
        </div>

        <div className="tripsList" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
          {previousTrips.map((trip) => (
            <PreviousTripCard key={trip.id} trip={trip} currentUser={currentUser} />
          ))}
        </div>

        {/* 2. VISITED DESTINATIONS & HOTEL REVIEWS */}
        <div className="sectionHead">
          <h2>Visited Destinations & Reviews</h2>
          <div className="count mono">{userVisited.length} places logged</div>
        </div>

        <form className="quickAddVisitRow" onSubmit={handleAddVisited}>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--forest-dark)" }}>
            + Log a Visited Place:
          </span>
          <select
            className="quickAddSelect"
            value={selectedPlaceToAdd}
            onChange={(e) => setSelectedPlaceToAdd(e.target.value)}
          >
            <option value="">Select a destination you have visited...</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.region} &middot; {p.category})
              </option>
            ))}
          </select>
          <button type="submit" className="markVisitedBtn" disabled={!selectedPlaceToAdd}>
            Add to Visited
          </button>
        </form>

        {userVisited.length === 0 ? (
          <div className="emptyState" style={{ marginBottom: "40px" }}>
            You haven't marked any destinations as visited yet. Select a destination above to log your journey!
          </div>
        ) : (
          userVisited.map((v) => {
            const place = places.find((p) => p.id === v.placeId);
            if (!place) return null;
            return (
              <div className="visitedPlaceCard" key={v.placeId}>
                <div className="visitedPlaceHeader">
                  <div className="visitedPlaceThumb" style={{ background: place.artColor }}>
                    {place.image ? (
                      <img src={place.image} alt={place.name} />
                    ) : (
                      <span>{place.icon}</span>
                    )}
                  </div>
                  <div className="visitedPlaceInfo">
                    <h3>{place.name}</h3>
                    <div className="visitedPlaceMeta">
                      <span className="visitedBadge">✓ Visited on {v.dateVisited || "Recent"}</span>
                      <span>{place.region} &middot; {place.category}</span>
                      <span>Best Time: {place.bestTime}</span>
                    </div>
                  </div>
                  <button
                    className="removeBtn"
                    onClick={() => removeVisitedPlace(place.id)}
                    title="Remove from visited"
                  >
                    Remove
                  </button>
                </div>

                <div className="hotelsReviewContainer">
                  <h4>Nearby Hotels & Reviews</h4>
                  {place.hotels.map((hotel, idx) => (
                    <HotelReviewItem key={idx} hotel={hotel} placeId={place.id} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
    </>
  );
}