import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCrowdLevel } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import FavouriteButton from "./FavouriteButton";

export default function PlaceModal({ placeId, onClose }) {
  const { places, currentUser, isPlaceFavourite, toggleFavouritePlace, planVisit } = useApp();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const place = places.find((p) => p.id === placeId);

  if (!place) return null;

  const level = getCrowdLevel(place);
  const percent = Math.min(100, Math.round((place.currentVisitors / place.maxVisitors) * 100));
  const isFull = place.currentVisitors >= place.maxVisitors;

  const handlePlanClick = () => {
    onClose();
    if (!currentUser) {
      navigate(`/signup?redirect=plan&placeId=${place.id}`);
    } else {
      planVisit(place.id);
    }
  };

  return (
    <div className="overlay open" id="overlay" onClick={(e) => { if (e.target.id === "overlay") onClose(); }}>
      <div className="modal">
        <div className="modalArt" style={{ background: place.artColor }}>
          {place.image && !imgError ? (
            <img
              src={place.image}
              alt={place.name}
              className="modalArtImg"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{place.icon}</span>
          )}
          <FavouriteButton
            isActive={isPlaceFavourite(place.id)}
            onToggle={() => toggleFavouritePlace(place.id)}
            className="modalFavBtn"
          />
        </div>
        <button className="closeBtn" onClick={onClose}>
          ✕
        </button>
        <div className="modalBody">
          <div className="category">
            {place.region} &middot; {place.category}
          </div>
          <h2>{place.name}</h2>
          <p className="desc">{place.desc}</p>

          <div className="infoGrid">
            <div className="infoBox">
              <div className="label">Best Time to Visit</div>
              <div className="value">{place.bestTime}</div>
            </div>
            <div className="infoBox">
              <div className="label">Typical Weather</div>
              <div className="value">{place.weather}</div>
            </div>
          </div>

          <div
            className="label"
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#8a8270",
              marginBottom: "8px",
            }}
          >
            Nearby Hotels
          </div>
          <ul className="hotelList">
            {place.hotels.map((h, i) => (
              <li key={i}>
                <span>{h.name}</span>
                <span>{h.price}</span>
              </li>
            ))}
          </ul>

          <div className="capacitySection">
            <div className="gaugeLabel">
              <span>Today's Footfall</span>
              <span>
                {place.currentVisitors} / {place.maxVisitors}
              </span>
            </div>
            <div className="gaugeTrack">
              <div className={`gaugeFill fill-${level}`} style={{ width: `${percent}%` }} />
            </div>
            <div className="capacityNote">
              {isFull
                ? "This spot has reached today's visitor limit."
                : `${place.maxVisitors - place.currentVisitors} slots left for today`}
            </div>
          </div>

          <button
            className="planBtn"
            disabled={isFull}
            onClick={handlePlanClick}
          >
            {isFull ? "Fully Booked Today" : "Plan a Visit"}
          </button>
        </div>
      </div>
    </div>
  );
}