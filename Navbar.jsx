import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navbar({ extraLink }) {
  const { currentUser, logout, deleteAccount, settings, updateSettings, visitedPlaces, places, favourites } = useApp();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [dropdownView, setDropdownView] = useState("main"); // "main" | "visited"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const totalFavourites = (favourites?.places?.length || 0) + (favourites?.hotels?.length || 0);

  const userVisited = useMemo(() => {
    if (!currentUser) return [];
    return (visitedPlaces || []).filter(
      (v) => v.userEmail === currentUser.email || !v.userEmail
    );
  }, [visitedPlaces, currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
        setDropdownView("main");
      }
      if (!e.target.closest(".mainNavbar")) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    setDropdownView("main");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    setAccountMenuOpen(false);
    setDropdownView("main");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const toggleDropdown = () => {
    if (accountMenuOpen) {
      setAccountMenuOpen(false);
      setDropdownView("main");
    } else {
      setAccountMenuOpen(true);
      setDropdownView("main");
    }
  };

  const userInitial = (currentUser?.name || currentUser?.email || "A").trim().charAt(0).toUpperCase();

  const closeAccountMenu = () => {
    setAccountMenuOpen(false);
    setDropdownView("main");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="mainNavbar">
      <Link to="/" className="brandLogo" onClick={() => setMobileMenuOpen(false)}>
        <svg
          className="brandLogoIcon"
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="14" stroke="#60a5fa" strokeWidth="2" strokeOpacity="0.85" strokeDasharray="3 3" />
          <path d="M16 5C11.58 5 8 8.58 8 13C8 18.25 16 27 16 27C16 27 24 18.25 24 13C24 8.58 20.42 5 16 5Z" fill="#3b82f6" />
          <circle cx="16" cy="13" r="3.5" fill="#0b1329" />
          <polygon points="16,7.5 18.5,13 16,12 13.5,13" fill="#f97316" />
        </svg>
        <div className="brandWordmark">
          <span className="brandTrip">Trip</span>
          <span className="brandWise">Wise</span>
        </div>
      </Link>

      <form className="navSearchForm" onSubmit={handleNavSearch}>
        <input
          type="text"
          className="navSearchInput"
          placeholder="Search destinations..."
          value={navSearch}
          onChange={(e) => setNavSearch(e.target.value)}
        />
        <button type="submit" className="navSearchBtn">
          Search
        </button>
      </form>

      <button
        type="button"
        className={`navHamburgerBtn ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        <span className="hamburgerLine" />
        <span className="hamburgerLine" />
        <span className="hamburgerLine" />
      </button>

      <div className={`navLinks ${mobileMenuOpen ? "mobileOpen" : ""}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>Explore</Link>
        <Link to="/favourites" className="navFavLink" onClick={() => setMobileMenuOpen(false)}>
          <span>Favourites</span>
          {totalFavourites > 0 && <span className="favNavBadge">{totalFavourites}</span>}
        </Link>
        {currentUser && <Link to="/my-trips" onClick={() => setMobileMenuOpen(false)}>My Trips</Link>}
        {extraLink && (
          <a
            onClick={(e) => {
              setMobileMenuOpen(false);
              extraLink.onClick(e);
            }}
          >
            {extraLink.label}
          </a>
        )}

        <span className="authNavSlot" ref={dropdownRef}>
          {currentUser ? (
            <>
              <button
                className="accountIconBtn"
                id="accountIconBtn"
                onClick={toggleDropdown}
                title="Account Menu"
                aria-label="Account Menu"
              >
                {userInitial}
              </button>
              {accountMenuOpen && (
                <div
                  className={`accountDropdown open ${dropdownView !== "main" ? "dropdownVisitedPanel" : ""}`}
                  id="accountDropdown"
                >
                  {dropdownView === "main" ? (
                    <>
                      <div className="dropdownUserCard">
                        <div className="dropdownUserAvatar" aria-hidden="true">{userInitial}</div>
                        <div className="dropdownUserMeta">
                          <div className="dropdownInfoName">{currentUser.name}</div>
                          <div className="dropdownInfoEmail">{currentUser.email}</div>
                        </div>
                      </div>

                      <div className="dropdownMenuDivider" />

                      <button
                        type="button"
                        className="dropdownTextLink"
                        onClick={() => {
                          closeAccountMenu();
                          navigate("/favourites");
                        }}
                      >
                        Favourites
                      </button>

                      <button
                        type="button"
                        className="dropdownTextLink"
                        onClick={() => {
                          closeAccountMenu();
                          navigate("/my-trips");
                        }}
                      >
                        Previous Trips
                      </button>

                      <button
                        type="button"
                        className="dropdownTextLink"
                        onClick={() => setDropdownView("visited")}
                      >
                        Visited Places
                      </button>

                      <button
                        type="button"
                        className="dropdownTextLink"
                        onClick={() => setDropdownView("account")}
                      >
                        Your account
                      </button>

                      <button type="button" className="dropdownSignOutBtn" onClick={handleLogout}>
                        Sign out
                      </button>
                    </>
                  ) : dropdownView === "account" ? (
                    <>
                      <div className="dropdownPanelHeader">
                        <button
                          type="button"
                          className="dropdownBackBtn"
                          onClick={() => setDropdownView("main")}
                        >
                          ← Back
                        </button>
                        <span className="dropdownPanelTitle">Your account</span>
                        <button
                          type="button"
                          className="dropdownBackBtn"
                          style={{ padding: "2px 6px", fontSize: "12px" }}
                          onClick={closeAccountMenu}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="dropdownItem" style={{ cursor: "default" }}>
                        <span>Appearance</span>
                        <div className="dropdownThemeToggle">
                          <button
                            type="button"
                            className={`dropdownThemeBtn ${settings.theme === "light" ? "active" : ""}`}
                            onClick={() => updateSettings({ theme: "light" })}
                          >
                            Light
                          </button>
                          <button
                            type="button"
                            className={`dropdownThemeBtn ${settings.theme === "dark" ? "active" : ""}`}
                            onClick={() => updateSettings({ theme: "dark" })}
                          >
                            Dark
                          </button>
                        </div>
                      </div>
                      <button type="button" className="dropdownItem warning" onClick={handleDeleteAccount}>
                        Delete Account
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropdownPanelHeader">
                        <button
                          type="button"
                          className="dropdownBackBtn"
                          onClick={() => setDropdownView("main")}
                        >
                          ← Back
                        </button>
                        <span className="dropdownPanelTitle">
                          <span>Visited Places</span>
                          <span className="visitedBadgeCount">{userVisited.length}</span>
                        </span>
                        <button
                          type="button"
                          className="dropdownBackBtn"
                          style={{ padding: "2px 6px", fontSize: "12px" }}
                          onClick={closeAccountMenu}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="dropdownVisitedScroll">
                        {userVisited.length === 0 ? (
                          <div className="dropdownEmptyVisited">
                            No visited places yet.<br />Explore destinations to track where you've been!
                          </div>
                        ) : (
                          userVisited.map((vp, idx) => {
                            const place = places.find((p) => p.id === vp.placeId) || {
                              id: vp.placeId,
                              name: vp.name,
                              region: "India",
                              category: "Destination",
                              icon: "📍",
                              artColor: "#e2d9f2",
                            };
                            return (
                              <div key={idx} className="dropdownVisitedCard">
                                <div className="dropdownVisitedThumb" style={{ background: place.artColor }}>
                                  {place.image ? (
                                    <img src={place.image} alt={place.name} />
                                  ) : (
                                    <span>{place.icon}</span>
                                  )}
                                </div>
                                <div className="dropdownVisitedInfo">
                                  <h4>{place.name}</h4>
                                  <span className="meta">{place.region} &middot; {place.category}</span>
                                  <span className="date">📅 {vp.dateVisited || "Visited"}</span>
                                </div>
                                <button
                                  type="button"
                                  className="dropdownVisitedViewBtn"
                                  onClick={() => {
                                    setAccountMenuOpen(false);
                                    setDropdownView("main");
                                    navigate(`/explore?q=${encodeURIComponent(place.name)}`);
                                  }}
                                >
                                  View →
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="navSignupBtn" onClick={() => setMobileMenuOpen(false)}>
                Log In
              </Link>{" "}
              <Link to="/signup" className="navSignupBtn" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </span>
      </div>
    </nav>
  );
}