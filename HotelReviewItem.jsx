import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

export default function HotelReviewItem({ hotel, placeId }) {
  const { hotelReviews, addHotelReview, currentUser } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const reviewsForHotel = useMemo(() => {
    return hotelReviews.filter(
      (r) => r.placeId === placeId && r.hotelName.toLowerCase() === hotel.name.toLowerCase()
    );
  }, [hotelReviews, placeId, hotel.name]);

  const avgRating = useMemo(() => {
    if (reviewsForHotel.length === 0) return null;
    const sum = reviewsForHotel.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return (sum / reviewsForHotel.length).toFixed(1);
  }, [reviewsForHotel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMsg("");
    const res = addHotelReview({
      placeId,
      hotelName: hotel.name,
      rating,
      text: reviewText,
    });
    if (res.ok) {
      setReviewText("");
      setStatusMsg("Review submitted successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    } else {
      setStatusMsg(res.error);
    }
  };

  return (
    <div className="hotelReviewCard">
      <div className="hotelCardTop">
        <div className="hotelNamePrice">
          <strong>🏨 {hotel.name}</strong>
          <span className="hotelPriceTag">{hotel.price}</span>
        </div>
        {avgRating ? (
          <span className="avgRatingBadge">★ {avgRating} ({reviewsForHotel.length} review{reviewsForHotel.length > 1 ? "s" : ""})</span>
        ) : (
          <span className="avgRatingBadge" style={{ color: "#8a8270" }}>No ratings yet</span>
        )}
      </div>

      {reviewsForHotel.length > 0 ? (
        <div className="reviewList">
          {reviewsForHotel.map((rev) => (
            <div key={rev.id} className="reviewItem">
              <div className="reviewItemHead">
                <span className="reviewAuthor">
                  {rev.userName} {rev.userEmail === currentUser?.email && <span style={{ color: "var(--forest)", fontSize: "11px", fontWeight: 700 }}>(You)</span>}
                </span>
                <span className="reviewDate">{rev.date}</span>
              </div>
              <div className="reviewStars">
                {"★".repeat(rev.rating)}
                {"☆".repeat(5 - rev.rating)}
              </div>
              <div className="reviewTextContent">{rev.text}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="noReviewsYet">No reviews yet for this hotel. Be the first to share your experience!</div>
      )}

      {currentUser && (
        <form className="addReviewForm" onSubmit={handleSubmit}>
          <label>Rate your stay & leave a review</label>
          <div className="starPicker">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`starBtn ${(hoverRating || rating) >= star ? "filled" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                title={`${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="reviewTextarea"
            placeholder={`How was your experience at ${hotel.name}?`}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          />
          {statusMsg && (
            <div
              style={{
                fontSize: "12px",
                marginTop: "6px",
                color: statusMsg.includes("successfully") ? "var(--green-ok)" : "var(--red)",
                fontWeight: 600,
              }}
            >
              {statusMsg}
            </div>
          )}
          <button type="submit" className="postReviewBtn">
            Post Review
          </button>
        </form>
      )}
    </div>
  );
}