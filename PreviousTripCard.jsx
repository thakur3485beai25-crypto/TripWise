import { useState } from "react";

export default function PreviousTripCard({ trip, currentUser }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="tripCard">
      <div className="tripCardHeader">
        <div className="tripDestinationInfo">
          <div className="tripThumb">
            {trip.image && !imgError ? (
              <img
                src={trip.image}
                alt={trip.destinationName}
                onError={() => setImgError(true)}
              />
            ) : (
              <span>{trip.icon}</span>
            )}
          </div>
          <div className="tripTitleGroup">
            <h3>{trip.destinationName}</h3>
            <div className="tripRegionCategory">
              {trip.destinationRegion} &middot; {trip.destinationCategory}
            </div>
          </div>
        </div>
        <div className="tripStatusBadge">
          ✓ {trip.bookingStatus}
        </div>
      </div>

      <div className="tripCardBody">
        <div className="tripDetailsGrid">
          <div className="tripDetailItem">
            <div className="tripDetailLabel">Trip Dates</div>
            <div className="tripDetailValue">
              📅 {trip.checkIn} – {trip.checkOut} ({trip.nights} Nights)
            </div>
          </div>
          <div className="tripDetailItem">
            <div className="tripDetailLabel">Hotel Stayed At</div>
            <div className="tripDetailValue">
              🏨 {trip.hotelName}
              <span style={{ fontSize: "12.5px", color: "#78716c", display: "block", fontWeight: 400 }}>
                {trip.roomType}
              </span>
            </div>
          </div>
          <div className="tripDetailItem">
            <div className="tripDetailLabel">Payment & Invoice</div>
            <div className="tripDetailValue">
              💳 {trip.paymentMethod}
              <span style={{ fontSize: "12px", color: "var(--forest)", display: "block", fontFamily: "'JetBrains Mono', monospace" }}>
                {trip.invoiceNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="tripReceiptSummaryBar">
          <div className="receiptQuickTotal">
            <span className="receiptQuickTotalLabel">
              Room (₹{trip.pricePerNight.toLocaleString()} × {trip.nights}) + Taxes & Fees (₹{(trip.taxes + trip.serviceFee).toLocaleString()}):
            </span>
            <span className="receiptQuickTotalAmount">
              ₹{trip.totalPaid.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            className="viewReceiptBtn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide Receipt ▲" : "View Receipt 🧾"}
          </button>
        </div>

        {expanded && (
          <div className="receiptInvoiceBox">
            <div className="receiptInvoiceHeader">
              <div>
                <div className="invoiceBrand">TripWise</div>
                <div style={{ fontSize: "12px", color: "#78716c" }}>Official Travel Bill & Receipt</div>
              </div>
              <div className="invoiceMeta">
                <div><strong>Invoice:</strong> {trip.invoiceNumber}</div>
                <div><strong>Issued on:</strong> {trip.checkOut}</div>
                <div><strong>Billed to:</strong> {currentUser?.name || "User"} ({currentUser?.email || "asd123@gmail.com"})</div>
              </div>
            </div>

            <table className="invoiceTable">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="amountCol">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Hotel Stay: {trip.hotelName} ({trip.destinationName})</strong>
                    <div style={{ fontSize: "12px", color: "#78716c" }}>
                      {trip.roomType} &middot; {trip.nights} nights @ ₹{trip.pricePerNight.toLocaleString()}/night
                    </div>
                  </td>
                  <td className="amountCol">₹{trip.hotelCharge.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    Platform Booking & Service Fee
                    <div style={{ fontSize: "12px", color: "#78716c" }}>24/7 travel concierge & instant reservation support</div>
                  </td>
                  <td className="amountCol">₹{trip.serviceFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    Taxes & GST (12%)
                    <div style={{ fontSize: "12px", color: "#78716c" }}>Government hospitality & service tax</div>
                  </td>
                  <td className="amountCol">₹{trip.taxes.toLocaleString()}</td>
                </tr>
                <tr className="invoiceTotalRow">
                  <td>Total Amount Paid</td>
                  <td className="amountCol">₹{trip.totalPaid.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoiceFooter">
              <span>Payment Mode: <strong>{trip.paymentMethod}</strong> (Transaction ID: TXN-{trip.invoiceNumber.replace(/[^\d]/g, '')})</span>
              <span style={{ color: "#137333", fontWeight: 700 }}>● Status: Paid in Full</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}