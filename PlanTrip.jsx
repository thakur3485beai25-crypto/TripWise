import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEFAULT_PREVIOUS_TRIPS } from "../data/places";
import { DEFAULT_SETTINGS } from "../utils/storage";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import PreviousTripCard from "../components/PreviousTripCard";

export default function Account() {
  const { currentUser, settings, updateSettings, updateProfile, logout, visitedPlaces, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trips"); // "trips" | "profile" | "settings" | "security"

  // Profile form state
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 7876604227");
  const [location, setLocation] = useState(currentUser?.location || "Chitkara University, Punjab");

  // Password change state
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passFeedback, setPassFeedback] = useState({ type: "", text: "" });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), phone: phone.trim(), location: location.trim() });
    showToast("Profile details updated successfully! ✓", "success", "👤");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPass.length < 6) {
      setPassFeedback({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPass !== confirmPass) {
      setPassFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPassFeedback({ type: "success", text: "Password updated successfully! 🔒" });
    setCurrPass("");
    setNewPass("");
    setConfirmPass("");
    showToast("Password updated successfully! 🔒");
    setTimeout(() => setPassFeedback({ type: "", text: "" }), 3500);
  };

  const handleResetPreferences = () => {
    updateSettings(DEFAULT_SETTINGS);
    showToast("Settings reset to defaults! ↺");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="authWrap">
          <div className="authPromptCard">
            <div className="eyebrow" style={{ color: "var(--clay)" }}>User Account</div>
            <h2>Log in to view your account</h2>
            <p>Sign in to access your previous trips, hotel stays, settings, and receipts.</p>
            <Link to="/login" className="heroExploreBtn">
              Log In to TripWise
            </Link>
          </div>
        </div>
        <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
      </>
    );
  }

  const previousTrips = DEFAULT_PREVIOUS_TRIPS;
  const totalExpenditure = previousTrips.reduce((acc, t) => acc + t.totalPaid, 0);
  const userVisitedCount = visitedPlaces.filter(
    (v) => v.userEmail === currentUser?.email || !v.userEmail
  ).length;

  return (
    <>
      <Navbar />

      <header className="hero accountHero">
        <div className="eyebrow">Account Dashboard</div>
        <h1>My Account</h1>
        <p>Manage your travel history, profile details, and app preferences.</p>
      </header>

      <main className="genericAccountWrap">
        {toastMsg && <div className="accountToastNotice">{toastMsg}</div>}

        <div className="genericAccountContainer">
          {/* Left Column: Sidebar Navigation */}
          <aside className="genericAccountSidebar">
            <div className="genericUserCard">
              <div className="genericAvatar">
                {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
              </div>
              <div className="genericUserInfo">
                <h3>{currentUser.name || "Traveler"}</h3>
                <span className="genericEmail">{currentUser.email}</span>
                <span className="genericBadge">✓ Verified Traveler</span>
              </div>
            </div>

            <nav className="genericNavMenu">
              <button
                type="button"
                className={`genericNavItem ${activeTab === "trips" ? "active" : ""}`}
                onClick={() => setActiveTab("trips")}
              >
                <span className="genericNavIcon">🎒</span>
                <span>Booking History</span>
                <span className="genericNavCount">{previousTrips.length}</span>
              </button>

              <button
                type="button"
                className={`genericNavItem ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="genericNavIcon">👤</span>
                <span>Personal Profile</span>
              </button>

              <button
                type="button"
                className={`genericNavItem ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                <span className="genericNavIcon">⚙️</span>
                <span>Preferences & Theme</span>
              </button>

              <button
                type="button"
                className={`genericNavItem ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <span className="genericNavIcon">🔒</span>
                <span>Security & Password</span>
              </button>
            </nav>

            <div className="genericSidebarFooter">
              <button type="button" onClick={handleLogout} className="genericLogoutBtn">
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Right Column: Main Content Area */}
          <section className="genericMainContent">
            {/* TAB 1: BOOKING & TRIPS HISTORY */}
            {activeTab === "trips" && (
              <div className="genericTabPanel">
                <div className="genericTabHeader">
                  <div>
                    <h2>Travel & Booking History</h2>
                    <p>Review completed itineraries, hotel bookings, and itemized receipts.</p>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="genericStatsRow">
                  <div className="genericStatBox">
                    <div className="genericStatNumber">{previousTrips.length}</div>
                    <div className="genericStatLabel">Completed Trips</div>
                  </div>
                  <div className="genericStatBox">
                    <div className="genericStatNumber">₹{totalExpenditure.toLocaleString()}</div>
                    <div className="genericStatLabel">Total Spent</div>
                  </div>
                  <div className="genericStatBox">
                    <div className="genericStatNumber">{userVisitedCount}</div>
                    <div className="genericStatLabel">Places Visited</div>
                  </div>
                </div>

                <div className="tripsList" style={{ marginTop: "24px" }}>
                  {previousTrips.map((trip) => (
                    <PreviousTripCard key={trip.id} trip={trip} currentUser={currentUser} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PERSONAL PROFILE */}
            {activeTab === "profile" && (
              <div className="genericTabPanel">
                <div className="genericTabHeader">
                  <div>
                    <h2>Personal Information</h2>
                    <p>Update your display name, contact phone, and primary location.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="genericCardForm">
                  <div className="genericFormGroup">
                    <label htmlFor="genName">Full Name</label>
                    <input
                      type="text"
                      id="genName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="genericFormGroup">
                    <label htmlFor="genEmail">Email Address</label>
                    <input
                      type="email"
                      id="genEmail"
                      value={currentUser.email}
                      disabled
                      title="Email cannot be changed directly"
                    />
                    <small className="genericHelpText">Email address is permanently linked to your account.</small>
                  </div>

                  <div className="genericFormGroup">
                    <label htmlFor="genPhone">Phone Number</label>
                    <input
                      type="tel"
                      id="genPhone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 7876604227"
                    />
                  </div>

                  <div className="genericFormGroup">
                    <label htmlFor="genLocation">Location / University</label>
                    <input
                      type="text"
                      id="genLocation"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Chitkara University, Punjab"
                    />
                  </div>

                  <div className="genericFormActions">
                    <button type="submit" className="genericPrimaryBtn">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: SETTINGS & THEME */}
            {activeTab === "settings" && (
              <div className="genericTabPanel">
                <div className="genericTabHeader">
                  <div>
                    <h2>Preferences & Display Settings</h2>
                    <p>Customize your visual appearance, crowd surge notifications, and regional units.</p>
                  </div>
                </div>

                <div className="genericSettingsSection">
                  <h3 className="genericSectionTitle">🎨 Visual Theme</h3>
                  <div className="themeCardsGrid">
                    <div
                      className={`themeOptionCard light ${settings.theme === "light" ? "active" : ""}`}
                      onClick={() => {
                        updateSettings({ theme: "light" });
                        showToast("Light mode applied! ☀️");
                      }}
                    >
                      <div className="themeCardPreview lightPreview">
                        <div className="themePreviewNav"></div>
                        <div className="themePreviewContent">
                          <div className="themePreviewLine title"></div>
                          <div className="themePreviewLine desc"></div>
                          <div className="themePreviewBox"></div>
                        </div>
                      </div>
                      <div className="themeCardLabel">
                        <div className="themeCardTitle">
                          <span>☀️ Light Mode</span>
                          {settings.theme === "light" && <span className="themeSelectedBadge">✓ Active</span>}
                        </div>
                        <p>Warm sand canvas with deep emerald accents.</p>
                      </div>
                    </div>

                    <div
                      className={`themeOptionCard dark ${settings.theme === "dark" ? "active" : ""}`}
                      onClick={() => {
                        updateSettings({ theme: "dark" });
                        showToast("Dark mode applied! 🌙");
                      }}
                    >
                      <div className="themeCardPreview darkPreview">
                        <div className="themePreviewNav"></div>
                        <div className="themePreviewContent">
                          <div className="themePreviewLine title"></div>
                          <div className="themePreviewLine desc"></div>
                          <div className="themePreviewBox"></div>
                        </div>
                      </div>
                      <div className="themeCardLabel">
                        <div className="themeCardTitle">
                          <span>🌙 Dark Mode</span>
                          {settings.theme === "dark" && <span className="themeSelectedBadge">✓ Active</span>}
                        </div>
                        <p>Sleek obsidian night palette with ambient teal glow.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="genericSettingsSection" style={{ marginTop: "28px" }}>
                  <h3 className="genericSectionTitle">🔔 Notifications & Alerts</h3>
                  <div className="settingsTogglesList">
                    <label className="settingsToggleCard">
                      <div className="toggleMeta">
                        <strong>🚨 Live Crowd Surge Warnings</strong>
                        <span>Notify when your planned destination exceeds 80% footfall capacity</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.crowdAlerts}
                        onChange={(e) => {
                          updateSettings({ crowdAlerts: e.target.checked });
                          showToast(`Crowd surge alerts ${e.target.checked ? "enabled" : "disabled"}`);
                        }}
                        className="customToggleSwitch"
                      />
                    </label>

                    <label className="settingsToggleCard">
                      <div className="toggleMeta">
                        <strong>🗓️ Trip Itinerary Reminders</strong>
                        <span>Receive schedule reminders 24 hours prior to travel date</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.tripReminders}
                        onChange={(e) => {
                          updateSettings({ tripReminders: e.target.checked });
                          showToast(`Trip reminders ${e.target.checked ? "enabled" : "disabled"}`);
                        }}
                        className="customToggleSwitch"
                      />
                    </label>

                    <label className="settingsToggleCard">
                      <div className="toggleMeta">
                        <strong>🏷️ Hotel Price Drops & Flash Deals</strong>
                        <span>Get alert pings when recommended hotels discount nightly rates</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.dealAlerts}
                        onChange={(e) => {
                          updateSettings({ dealAlerts: e.target.checked });
                          showToast(`Hotel deal alerts ${e.target.checked ? "enabled" : "disabled"}`);
                        }}
                        className="customToggleSwitch"
                      />
                    </label>
                  </div>
                </div>

                <div className="genericSettingsSection" style={{ marginTop: "28px" }}>
                  <h3 className="genericSectionTitle">🌐 Units & Regional Presets</h3>
                  <div className="settingsFormGrid">
                    <div className="settingsFieldGroup">
                      <label>Preferred Currency</label>
                      <div className="chipSelectRow">
                        {[
                          { id: "INR", label: "₹ INR (Rupee)" },
                          { id: "USD", label: "$ USD (Dollar)" },
                          { id: "EUR", label: "€ EUR (Euro)" },
                          { id: "GBP", label: "£ GBP (Pound)" },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={`prefChip ${settings.currency === c.id ? "active" : ""}`}
                            onClick={() => {
                              updateSettings({ currency: c.id });
                              showToast(`Currency set to ${c.id}`);
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="settingsFieldGroup">
                      <label>Temperature Units</label>
                      <div className="chipSelectRow">
                        <button
                          type="button"
                          className={`prefChip ${settings.tempUnit === "C" ? "active" : ""}`}
                          onClick={() => {
                            updateSettings({ tempUnit: "C" });
                            showToast("Temperature unit set to Celsius (°C)");
                          }}
                        >
                          🌡️ Celsius (°C)
                        </button>
                        <button
                          type="button"
                          className={`prefChip ${settings.tempUnit === "F" ? "active" : ""}`}
                          onClick={() => {
                            updateSettings({ tempUnit: "F" });
                            showToast("Temperature unit set to Fahrenheit (°F)");
                          }}
                        >
                          🌡️ Fahrenheit (°F)
                        </button>
                      </div>
                    </div>

                    <div className="settingsFieldGroup">
                      <label>Default Travel Mode</label>
                      <div className="chipSelectRow">
                        {[
                          { id: "Car", label: "🚗 Car / Drive" },
                          { id: "Train", label: "🚆 Train / Rail" },
                          { id: "Flight", label: "✈️ Flight" },
                          { id: "Bus", label: "🚌 Bus" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`prefChip ${settings.defaultTravelMode === m.id ? "active" : ""}`}
                            onClick={() => {
                              updateSettings({ defaultTravelMode: m.id });
                              showToast(`Default travel mode: ${m.id}`);
                            }}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY */}
            {activeTab === "security" && (
              <div className="genericTabPanel">
                <div className="genericTabHeader">
                  <div>
                    <h2>Security & Password</h2>
                    <p>Manage your account password and security preferences.</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="genericCardForm">
                  <div className="genericFormGroup">
                    <label htmlFor="secCurrentPass">Current Password</label>
                    <input
                      type="password"
                      id="secCurrentPass"
                      placeholder="Enter current password"
                      value={currPass}
                      onChange={(e) => setCurrPass(e.target.value)}
                    />
                  </div>

                  <div className="genericFormGroup">
                    <label htmlFor="secNewPass">New Password</label>
                    <input
                      type="password"
                      id="secNewPass"
                      placeholder="At least 6 characters"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                    />
                  </div>

                  <div className="genericFormGroup">
                    <label htmlFor="secConfirmPass">Confirm New Password</label>
                    <input
                      type="password"
                      id="secConfirmPass"
                      placeholder="Re-type new password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                    />
                  </div>

                  {passFeedback.text && (
                    <div className={`passAlert ${passFeedback.type}`}>
                      {passFeedback.text}
                    </div>
                  )}

                  <div className="genericFormActions">
                    <button type="submit" className="genericPrimaryBtn">
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="resetSectionCard" style={{ marginTop: "28px" }}>
                  <div>
                    <strong>Reset Preferences to Default</strong>
                    <p>Reverts visual theme, alert switches, currency, and travel units to defaults.</p>
                  </div>
                  <button type="button" onClick={handleResetPreferences} className="resetDefaultsBtn">
                    Reset Settings ↺
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
    </>
  );
}