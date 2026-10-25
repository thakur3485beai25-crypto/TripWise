import { useState } from "react";
import { useApp } from "../context/AppContext";
import FavouriteButton from "./FavouriteButton";

export default function HotelCard({ hotel, onViewHotel, onViewDestination }) {
  const { isHotelFavourite, toggleFavouriteHotel } = useApp();
  const [imgError, setImgError] = useState(false);

  const isFav = isHotelFavourite(hotel.id);

  const handleCardClick = () => {
    if (onViewHotel) {
      onViewHotel(hotel);
    } else if (onViewDestination) {
      onViewDestination(hotel.destinationId);
    }
  };

  return (
    <div className="hotelCard" onClick={handleCardClick} role="button" tabIndex={0}>
      <div className="hotelCardArt">
        {hotel.badge && <span className="hotelBadge">{hotel.badge}</span>}
        <FavouriteButton
          isActive={isFav}
          onToggle={() => toggleFavouriteHotel(hotel.id)}
          className="cardFavBtn"
        />
        {hotel.image && !imgError ? (
          <img
            src={hotel.image}
            alt={hotel.name}
            className="hotelCardArtImg"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "40px" }}>
            🏨
          </div>
        )}
      </div>
      <div className="hotelCardBody">
        <div
          className="hotelLocationTag"
          onClick={(e) => {
            if (onViewDestination) {
              e.stopPropagation();
              onViewDestination(hotel.destinationId);
            }
          }}
          title={`Explore ${hotel.destinationName}`}
        >
          📍 {hotel.destinationName}
        </div>
        <h3>{hotel.name}</h3>
        <div className="hotelRatingRow">
          <span className="hotelRatingBadge">⭐ {hotel.rating}</span>
          <span className="hotelReviewCount">{hotel.reviewCount}</span>
        </div>
        <div className="hotelPriceRow">
          <div className="hotelPricePerNight">{hotel.pricePerNight}</div>
          <button
            type="button"
            className="hotelViewBtn"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Hotel Details →
          </button>
        </div>
      </div>
    </div>
  );
}