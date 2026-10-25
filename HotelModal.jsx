import { useState, useMemo } from "react";
import { getHotelDetails } from "../utils/hotelDetails";
import { useApp } from "../context/AppContext";
import FavouriteButton from "./FavouriteButton";

export default function HotelModal({ hotel, onClose, onViewDestination }) {
  const { currentUser, isHotelFavourite, toggleFavouriteHotel, showToast } = useApp();
  const [imgError, setImgError] = useState(false);
  const [selectedRoomToBook, setSelectedRoomToBook] = useState(null);
  const [guestName, setGuestName] = useState(currentUser?.name || "");
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    return tomorrow.toISOString().split("T")[0];
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingRefId, setBookingRefId] = useState("");
  const [activeTab, setActiveTab] = useState("rooms"); // "rooms" | "amenities" | "contact"

  const details = useMemo(() => getHotelDetails(hotel), [hotel]);

  if (!details) return null;

  const handleStartBooking = (room) => {
    setSelectedRoomToBook(room);
    setBookingConfirmed(false);
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    const ref = `HTL-${(details.destinationName || "TW").toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRefId(ref);
    setBookingConfirmed(true);
    showToast(`Reservation confirmed at ${details.name}!`, "success", "🏨");
  };

  return (
    <div
      className="overlay open"
      id="hotelModalOverlay"
      onClick={(e) => {
        if (e.target.id === "hotelModalOverlay") onClose();
      }}
    >
      <div className="hotelModal" role="dialog" aria-modal="true">
        {/* Cover Image & Quick Badge */}
        <div className="hotelModalArt">
          {details.image && !imgError ? (
            <img
              src={details.image}
              alt={details.name}
              className="hotelModalArtImg"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="hotelModalPlaceholder">🏨</div>
          )}
          <FavouriteButton
            isActive={isHotelFavourite(details.id)}
            onToggle={() => toggleFavouriteHotel(details.id)}
            className="hotelModalFavBtn"
          />
          <button
            type="button"
            className="hotelModalCloseBtn"
            onClick={onClose}
            aria-label="Close hotel details"
          >
            ✕
          </button>
          {details.badge && (
            <span className="hotelModalTopBadge">{details.badge}</span>
          )}
          <div className="hotelModalArtGradient" />
          <div className="hotelModalArtCaption">
            <span className="hotelModalLocationPin">
              📍 {details.destinationName} &middot; {details.location}
            </span>
            <h2 className="hotelModalTitle">{details.name}</h2>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="hotelModalNavTabs">
          <button
            type="button"
            className={`hotelModalTabBtn ${activeTab === "rooms" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("rooms");
              setSelectedRoomToBook(null);
            }}
          >
            🛏️ Available Rooms ({details.rooms.length})
          </button>
          <button
            type="button"
            className={`hotelModalTabBtn ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("gallery");
              setSelectedRoomToBook(null);
            }}
          >
            📸 Property Gallery
          </button>
          <button
            type="button"
            className={`hotelModalTabBtn ${activeTab === "amenities" ? "active" : ""}`}
            onClick={() => setActiveTab("amenities")}
          >
            ✨ Amenities & Ratings
          </button>
          <button
            type="button"
            className={`hotelModalTabBtn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            📞 Contact & Address
          </button>
        </div>

        <div className="hotelModalBody">
          {/* Top Quick Overview Banner */}
          <div className="hotelOverviewBanner">
            <div className="hotelRatingHighlight">
              <div className="hotelRatingBigScore">⭐ {details.rating}</div>
              <div className="hotelRatingText">
                <strong>Exceptional Guest Experience</strong>
                <span>Based on {details.reviewCount}</span>
              </div>
            </div>
            <div className="hotelPriceHighlight">
              <span className="hotelPriceLabel">Starting from</span>
              <span className="hotelPriceAmount">{details.pricePerNight}</span>
            </div>
          </div>

          {/* TAB 1: AVAILABLE ROOMS */}
          {activeTab === "rooms" && !selectedRoomToBook && (
            <div className="hotelRoomsSection">
              <div className="hotelSectionHead">
                <div>
                  <h3>Select an Available Room</h3>
                  <p>Real-time room availability for verified direct reservations</p>
                </div>
                <div className="hotelAvailBadge">
                  ✓ {details.rooms.reduce((acc, r) => acc + r.available, 0)} Total Rooms Free Today
                </div>
              </div>

              <div className="hotelRoomList">
                {details.rooms.map((room) => (
                  <div key={room.id} className="hotelRoomCard">
                    {room.image && (
                      <div className="hotelRoomThumb">
                        <img
                          src={room.image}
                          alt={room.type}
                          className="hotelRoomThumbImg"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="hotelRoomMain">
                      <div className="hotelRoomHeader">
                        <h4>{room.type}</h4>
                        <span className="hotelRoomAvailChip">
                          ⚡ Only {room.available} left!
                        </span>
                      </div>

                      <div className="hotelRoomSpecs">
                        <span>🛏️ {room.bed}</span>
                        <span>👥 {room.capacity}</span>
                        <span>📐 {room.size}</span>
                      </div>

                      <div className="hotelRoomPerks">
                        {room.perks.map((perk, i) => (
                          <span key={i} className="hotelPerkTag">
                            ✓ {perk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hotelRoomPriceCol">
                      <div className="hotelRoomPriceBox">
                        <span className="hotelRoomPriceNumber">{room.price}</span>
                        <span className="hotelRoomPriceSub">/ night + taxes</span>
                      </div>
                      <button
                        type="button"
                        className="hotelReserveBtn"
                        onClick={() => handleStartBooking(room)}
                      >
                        Reserve Room →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PROPERTY PHOTO GALLERY */}
          {activeTab === "gallery" && (
            <div className="hotelGallerySection">
              <div className="hotelSectionHead">
                <div>
                  <h3>Property Photos & Verified Views</h3>
                  <p>Explore real exterior, suite, and resort facilities at {details.name}</p>
                </div>
              </div>

              <div className="hotelGalleryGrid">
                {details.gallery?.map((imgUrl, idx) => (
                  <div key={idx} className="hotelGalleryCard">
                    <img
                      src={imgUrl}
                      alt={`${details.name} photo ${idx + 1}`}
                      className="hotelGalleryImg"
                      loading="lazy"
                    />
                    <div className="hotelGalleryCaption">
                      {idx === 0 && "Grand Property View & Setting"}
                      {idx === 1 && "Deluxe Comfort Guest Bedroom"}
                      {idx === 2 && "Premier Valley Suite Interior"}
                      {idx === 3 && "Swimming Pool & Resort Grounds"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKING INTERACTIVE FLOW */}
          {selectedRoomToBook && !bookingConfirmed && (
            <div className="hotelBookingFlowCard">
              <div className="hotelBookingFlowHead">
                <div>
                  <button
                    type="button"
                    className="hotelBackLink"
                    onClick={() => setSelectedRoomToBook(null)}
                  >
                    ← Back to Rooms
                  </button>
                  <h3>Book {selectedRoomToBook.type}</h3>
                  <p>Direct reservation at {details.name}</p>
                </div>
                <div className="hotelBookingRateBadge">
                  {selectedRoomToBook.price} / night
                </div>
              </div>

              {selectedRoomToBook.image && (
                <div className="hotelBookingRoomPreview">
                  <img
                    src={selectedRoomToBook.image}
                    alt={selectedRoomToBook.type}
                    className="hotelBookingRoomImg"
                  />
                  <div>
                    <strong>{selectedRoomToBook.type}</strong>
                    <span>{selectedRoomToBook.bed} &middot; {selectedRoomToBook.capacity} &middot; {selectedRoomToBook.size}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleConfirmReservation} className="hotelBookingForm">
                <div className="hotelFormRow">
                  <div className="hotelFormField">
                    <label>Guest Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajvansh Thakur"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div className="hotelFormField">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="hotelFormRow">
                  <div className="hotelFormField">
                    <label>Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                    />
                  </div>
                  <div className="hotelFormField">
                    <label>Check-out Date</label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="hotelBookingInclusions">
                  <strong>Room Inclusions:</strong>
                  <div className="hotelPerkTagList">
                    {selectedRoomToBook.perks.map((p, i) => (
                      <span key={i} className="hotelPerkTag">✓ {p}</span>
                    ))}
                  </div>
                </div>

                <div className="hotelBookingActions">
                  <button
                    type="button"
                    className="hotelCancelBookingBtn"
                    onClick={() => setSelectedRoomToBook(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="hotelSubmitBookingBtn">
                    Confirm Reservation ({selectedRoomToBook.price}) ✓
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BOOKING CONFIRMED SUCCESS VOUCHER */}
          {bookingConfirmed && (
            <div className="hotelBookingSuccessCard">
              <div className="hotelSuccessIcon">🎉</div>
              <h3>Reservation Confirmed!</h3>
              <p>Your room at <strong>{details.name}</strong> is officially booked.</p>

              <div className="hotelVoucherBox">
                <div className="hotelVoucherRow">
                  <span>Booking Reference:</span>
                  <strong>{bookingRefId}</strong>
                </div>
                <div className="hotelVoucherRow">
                  <span>Guest:</span>
                  <span>{guestName} ({guestPhone})</span>
                </div>
                <div className="hotelVoucherRow">
                  <span>Room Reserved:</span>
                  <span>{selectedRoomToBook?.type}</span>
                </div>
                <div className="hotelVoucherRow">
                  <span>Dates:</span>
                  <span>{checkInDate} to {checkOutDate}</span>
                </div>
                <div className="hotelVoucherRow">
                  <span>Front Desk Contact:</span>
                  <span>{details.phone}</span>
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  className="hotelViewDestinationBtn"
                  onClick={() => {
                    setSelectedRoomToBook(null);
                    setBookingConfirmed(false);
                  }}
                >
                  View Another Room
                </button>
                <button
                  type="button"
                  className="hotelSubmitBookingBtn"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AMENITIES & DETAILED RATINGS */}
          {activeTab === "amenities" && (
            <div className="hotelAmenitiesSection">
              <div className="hotelSectionHead">
                <div>
                  <h3>Property Amenities & Services</h3>
                  <p>All facilities included with your stay at {details.name}</p>
                </div>
              </div>

              <div className="hotelAmenitiesGrid">
                {details.amenities.map((item, idx) => (
                  <div key={idx} className="hotelAmenityItem">
                    <span className="hotelAmenityIcon">{item.icon}</span>
                    <span className="hotelAmenityName">{item.name}</span>
                  </div>
                ))}
              </div>

              <div className="hotelRatingsBreakdownSection">
                <h4>Guest Ratings Breakdown</h4>
                <div className="hotelRatingBarsGrid">
                  <div className="hotelRatingBarItem">
                    <div className="hotelBarLabel">
                      <span>Cleanliness & Hygiene</span>
                      <strong>{details.ratingsBreakdown.cleanliness} / 5.0</strong>
                    </div>
                    <div className="hotelMeterTrack">
                      <div
                        className="hotelMeterFill"
                        style={{ width: `${(details.ratingsBreakdown.cleanliness / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="hotelRatingBarItem">
                    <div className="hotelBarLabel">
                      <span>Room Comfort & Bedding</span>
                      <strong>{details.ratingsBreakdown.comfort} / 5.0</strong>
                    </div>
                    <div className="hotelMeterTrack">
                      <div
                        className="hotelMeterFill"
                        style={{ width: `${(details.ratingsBreakdown.comfort / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="hotelRatingBarItem">
                    <div className="hotelBarLabel">
                      <span>Scenic Location & Views</span>
                      <strong>{details.ratingsBreakdown.location} / 5.0</strong>
                    </div>
                    <div className="hotelMeterTrack">
                      <div
                        className="hotelMeterFill"
                        style={{ width: `${(details.ratingsBreakdown.location / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="hotelRatingBarItem">
                    <div className="hotelBarLabel">
                      <span>Staff Hospitality & Service</span>
                      <strong>{details.ratingsBreakdown.staff} / 5.0</strong>
                    </div>
                    <div className="hotelMeterTrack">
                      <div
                        className="hotelMeterFill"
                        style={{ width: `${(details.ratingsBreakdown.staff / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="hotelRatingBarItem">
                    <div className="hotelBarLabel">
                      <span>Value for Money</span>
                      <strong>{details.ratingsBreakdown.value} / 5.0</strong>
                    </div>
                    <div className="hotelMeterTrack">
                      <div
                        className="hotelMeterFill"
                        style={{ width: `${(details.ratingsBreakdown.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT INFO & RECEPTION */}
          {activeTab === "contact" && (
            <div className="hotelContactSection">
              <div className="hotelSectionHead">
                <div>
                  <h3>Hotel Contact & Reception Desk</h3>
                  <p>Get in touch directly with the hotel management and concierge</p>
                </div>
              </div>

              <div className="hotelContactCardsGrid">
                <div className="hotelContactCard">
                  <div className="hotelContactIcon">📞</div>
                  <div className="hotelContactInfo">
                    <span className="hotelContactLabel">Direct Telephone</span>
                    <a href={`tel:${details.phone}`} className="hotelContactValueLink">
                      {details.phone}
                    </a>
                    <span className="hotelContactSub">24 Hours Front Desk Line</span>
                  </div>
                </div>

                <div className="hotelContactCard">
                  <div className="hotelContactIcon">✉️</div>
                  <div className="hotelContactInfo">
                    <span className="hotelContactLabel">Reservations Email</span>
                    <a href={`mailto:${details.email}`} className="hotelContactValueLink">
                      {details.email}
                    </a>
                    <span className="hotelContactSub">Average reply time: within 1 hour</span>
                  </div>
                </div>

                <div className="hotelContactCard">
                  <div className="hotelContactIcon">📍</div>
                  <div className="hotelContactInfo">
                    <span className="hotelContactLabel">Property Address</span>
                    <span className="hotelContactAddressText">{details.fullAddress}</span>
                    <span className="hotelContactSub">Pick-up available upon request</span>
                  </div>
                </div>

                <div className="hotelContactCard">
                  <div className="hotelContactIcon">⏰</div>
                  <div className="hotelContactInfo">
                    <span className="hotelContactLabel">Timings & Policies</span>
                    <span className="hotelContactTimingText">
                      Check-in: <strong>{details.checkIn}</strong> &middot; Check-out: <strong>{details.checkOut}</strong>
                    </span>
                    <span className="hotelContactSub">Early check-in subject to room availability</span>
                  </div>
                </div>
              </div>

              {/* Destination cross-link */}
              {details.destinationId && onViewDestination && (
                <div className="hotelDestinationBanner">
                  <div>
                    <strong>Explore {details.destinationName}</strong>
                    <p>Check live crowd footfall, best travel months, and weather forecast</p>
                  </div>
                  <button
                    type="button"
                    className="hotelViewDestinationBtn"
                    onClick={() => {
                      onClose();
                      onViewDestination(details.destinationId);
                    }}
                  >
                    View Destination Details →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
