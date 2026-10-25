import { useState } from "react";
import { getCrowdLevel, getCrowdLabel } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import FavouriteButton from "./FavouriteButton";

export default function PlaceCard({ place, onView }) {
  const { isPlaceFavourite, toggleFavouritePlace } = useApp();
  const [imgError, setImgError] = useState(false);
  const level = getCrowdLevel(place);
  const percent = Math.min(100, Math.round((place.currentVisitors / place.maxVisitors) * 100));

  const isFav = isPlaceFavourite(place.id);

  return (
    <div className="card">
      <div className="cardArt" style={{ background: place.artColor }}>
        {place.image && !imgError ? (
          <img
            src={place.image}
            alt={place.name}
            className="cardArtImg"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span>{place.icon}</span>
        )}
        <FavouriteButton
          isActive={isFav}
          onToggle={() => toggleFavouritePlace(place.id)}
          className="cardFavBtn"
        />
      </div>
      <div className="cardBody">
        <div className="cardTop">
          <div>
            <div className="category">
              {place.region} &middot; {place.category}
            </div>
            <h3>{place.name}</h3>
          </div>
        </div>
        <div className="metaRow">
          <span>📅 {place.bestTime}</span>
          <span>🌡️ {place.weather}</span>
        </div>
        <div className="gaugeLabel">
          <span>Crowd Level</span>
          <span>
            {getCrowdLabel(level)} · {percent}%
          </span>
        </div>
        <div className="gaugeTrack">
          <div className={`gaugeFill fill-${level}`} style={{ width: `${percent}%` }} />
        </div>
        <button className="viewBtn" onClick={() => onView(place.id)}>
          View Details
        </button>
      </div>
    </div>
  );
}