import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { recommendedHotels } from "../data/places";
import {
  PLANNED_VISITS_KEY,
  VISITED_PLACES_KEY,
  HOTEL_REVIEWS_KEY,
  CURRENT_USER_KEY,
  USERS_KEY,
  seedDefaultUser,
  loadInitialPlaces,
  loadPlannedVisits,
  loadVisitedTrips,
  loadVisitedPlaces,
  loadHotelReviews,
  loadCurrentUser,
  SETTINGS_KEY,
  loadSettings,
  loadFavourites,
  saveFavourites,
} from "../utils/storage";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [places, setPlaces] = useState(() => loadInitialPlaces());
  const [plannedVisits, setPlannedVisits] = useState(() => loadPlannedVisits());
  const [visitedTrips, setVisitedTrips] = useState(() => loadVisitedTrips());
  const [visitedPlaces, setVisitedPlaces] = useState(() => loadVisitedPlaces());
  const [hotelReviews, setHotelReviews] = useState(() => loadHotelReviews());
  const [currentUser, setCurrentUserState] = useState(() => loadCurrentUser());
  const [settings, setSettingsState] = useState(() => loadSettings());

  // Toast feedback state (strictly single active notification)
  const [toasts, setToasts] = useState([]);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = "success", icon = null) => {
    const id = Date.now();
    // Only display one active toast at a time
    setToasts([{ id, message, type, icon }]);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToasts([]);
    }, 2800);
  }, []);

  const removeToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToasts([]);
  }, []);

  // Favourites state: { places: [ids], hotels: [ids] } per logged-in user or guest
  const [favourites, setFavourites] = useState(() => loadFavourites(currentUser?.email));

  // Skip the next save when we have just loaded another user's (or guest) list
  const skipFavouriteSave = useRef(true);

  // Reload favourites when user logs in or logs out
  useEffect(() => {
    skipFavouriteSave.current = true;
    setFavourites(loadFavourites(currentUser?.email));
  }, [currentUser?.email]);

  // Persist favourites to localStorage whenever the list itself changes
  useEffect(() => {
    if (skipFavouriteSave.current) {
      skipFavouriteSave.current = false;
      return;
    }
    saveFavourites(favourites, currentUser?.email);
  }, [favourites, currentUser?.email]);

  // Ensure default accounts (including asd123@gmail.com and rajvansh@tripwise.com) are seeded
  useEffect(() => {
    seedDefaultUser();
  }, []);

  // Apply dark / light theme globally to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(PLANNED_VISITS_KEY, JSON.stringify(plannedVisits));
  }, [plannedVisits]);

  useEffect(() => {
    localStorage.setItem(VISITED_PLACES_KEY, JSON.stringify(visitedPlaces));
  }, [visitedPlaces]);

  useEffect(() => {
    localStorage.setItem(HOTEL_REVIEWS_KEY, JSON.stringify(hotelReviews));
  }, [hotelReviews]);

  const updateSettings = useCallback((newSettings) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setSettingsState((prev) => {
      const nextTheme = prev.theme === "dark" ? "light" : "dark";
      const updated = { ...prev, theme: nextTheme };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback(({ name, phone, location }) => {
    setCurrentUserState((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        name: name !== undefined ? name : prev.name,
        phone: phone !== undefined ? phone : prev.phone,
        location: location !== undefined ? location : prev.location,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

      let users = seedDefaultUser();
      let newUsers = users.map((u) => (u.email === prev.email ? { ...u, ...updated } : u));
      saveUsers(newUsers);

      return updated;
    });
    return { ok: true };
  }, []);

  const planVisit = useCallback(
    (placeId, extraDetails = {}) => {
      let plannedPlace = null;

      setPlaces((prev) =>
        prev.map((place) => {
          if (place.id === placeId && place.currentVisitors < place.maxVisitors) {
            plannedPlace = place;
            return { ...place, currentVisitors: place.currentVisitors + 1 };
          }
          return place;
        })
      );

      if (plannedPlace) {
        setPlannedVisits((visits) => [
          ...visits,
          {
            placeId: plannedPlace.id,
            name: plannedPlace.name,
            icon: plannedPlace.icon,
            date: extraDetails.travelDate || new Date().toLocaleDateString(),
            travelMode: extraDetails.travelMode || "Car",
            budget: extraDetails.budget || "Mid-Range",
            visited: false,
          },
        ]);
        showToast(`Trip planned for ${plannedPlace.name}!`, "success", "🎒");
      } else {
        showToast("This destination is currently at full capacity today.", "warning", "⚠️");
      }

      return !!plannedPlace;
    },
    [showToast]
  );

  const removeVisit = useCallback(
    (index) => {
      setPlannedVisits((prev) => {
        let visit = prev[index];
        if (visit) {
          setPlaces((places) =>
            places.map((place) =>
              place.id === visit.placeId && place.currentVisitors > 0
                ? { ...place, currentVisitors: place.currentVisitors - 1 }
                : place
            )
          );
          showToast(`Removed ${visit.name} from planned visits`, "info", "🗑️");
        }
        let next = [...prev];
        next.splice(index, 1);
        return next;
      });
    },
    [showToast]
  );

  const markAsVisited = useCallback(
    (placeId, fromPlannedIndex = null) => {
      const targetPlace = places.find((p) => p.id === placeId);
      if (!targetPlace) return;

      const userEmail = currentUser ? currentUser.email : "guest";

      setVisitedPlaces((prev) => {
        const exists = prev.some(
          (v) => v.placeId === placeId && (v.userEmail === userEmail || !v.userEmail)
        );
        if (exists) {
          showToast(`${targetPlace.name} is already logged in visited!`, "info", "📍");
          return prev;
        }
        showToast(`Marked ${targetPlace.name} as visited!`, "success", "📍");
        return [
          {
            placeId: targetPlace.id,
            name: targetPlace.name,
            dateVisited: new Date().toLocaleDateString(),
            userEmail: userEmail,
          },
          ...prev,
        ];
      });

      if (fromPlannedIndex !== null && fromPlannedIndex !== undefined) {
        setPlannedVisits((prev) =>
          prev.map((visit, i) => (i === fromPlannedIndex ? { ...visit, visited: true } : visit))
        );
      }
    },
    [places, currentUser, showToast]
  );

  const removeVisitedPlace = useCallback(
    (placeId) => {
      const targetPlace = places.find((p) => p.id === placeId);
      const userEmail = currentUser ? currentUser.email : "guest";
      setVisitedPlaces((prev) =>
        prev.filter((v) => !(v.placeId === placeId && (v.userEmail === userEmail || !v.userEmail)))
      );
      showToast(`Removed ${targetPlace?.name || "destination"} from visited places`, "info", "🗑️");
    },
    [places, currentUser, showToast]
  );

  const addHotelReview = useCallback(
    ({ placeId, hotelName, rating, text }) => {
      if (!currentUser) {
        showToast("Please log in to submit a review.", "warning", "⚠️");
        return { ok: false, error: "Please log in to submit a review." };
      }
      if (!rating || rating < 1) {
        showToast("Please select a star rating.", "warning", "⚠️");
        return { ok: false, error: "Please select a star rating." };
      }
      if (!text || text.trim() === "") {
        showToast("Please write a short review.", "warning", "⚠️");
        return { ok: false, error: "Please write a short review." };
      }

      const newReview = {
        id: "rev_" + Date.now(),
        placeId,
        hotelName,
        userEmail: currentUser.email,
        userName: currentUser.name,
        rating: Number(rating),
        text: text.trim(),
        date: new Date().toLocaleDateString(),
      };

      setHotelReviews((prev) => [newReview, ...prev]);
      showToast("Review submitted successfully! ⭐", "success", "⭐");
      return { ok: true };
    },
    [currentUser, showToast]
  );

  // Toggle destination in favourites
  const toggleFavouritePlace = useCallback(
    (id) => {
      const targetPlace = places.find((p) => String(p.id) === String(id));
      const placeName = targetPlace?.name || "Destination";
      const placesList = Array.isArray(favourites?.places) ? favourites.places : [];
      const exists = placesList.some((favId) => String(favId) === String(id));
      const nextPlaces = exists
        ? placesList.filter((favId) => String(favId) !== String(id))
        : [...placesList, id];
      const updated = {
        places: nextPlaces,
        hotels: Array.isArray(favourites?.hotels) ? favourites.hotels : [],
      };

      setFavourites(updated);
      saveFavourites(updated, currentUser?.email);

      if (exists) {
        showToast(`Removed ${placeName} from favourites`, "info", "🤍");
      } else {
        showToast(`Added ${placeName} to favourites!`, "success", "❤️");
      }
    },
    [places, favourites, currentUser?.email, showToast]
  );

  // Toggle hotel in favourites
  const toggleFavouriteHotel = useCallback(
    (id) => {
      const targetHotel = recommendedHotels.find((h) => String(h.id) === String(id));
      const hotelName = targetHotel?.name || "Hotel";
      const hotelsList = Array.isArray(favourites?.hotels) ? favourites.hotels : [];
      const exists = hotelsList.some((favId) => String(favId) === String(id));
      const nextHotels = exists
        ? hotelsList.filter((favId) => String(favId) !== String(id))
        : [...hotelsList, id];
      const updated = {
        places: Array.isArray(favourites?.places) ? favourites.places : [],
        hotels: nextHotels,
      };

      setFavourites(updated);
      saveFavourites(updated, currentUser?.email);

      if (exists) {
        showToast(`Removed ${hotelName} from favourites`, "info", "🤍");
      } else {
        showToast(`Added ${hotelName} to favourites!`, "success", "❤️");
      }
    },
    [favourites, currentUser?.email, showToast]
  );

  // Check if destination is favourited
  const isPlaceFavourite = useCallback(
    (id) => {
      if (id === undefined || id === null || !favourites?.places) return false;
      return favourites.places.some((favId) => String(favId) === String(id));
    },
    [favourites?.places]
  );

  // Check if hotel is favourited
  const isHotelFavourite = useCallback(
    (id) => {
      if (id === undefined || id === null || !favourites?.hotels) return false;
      return favourites.hotels.some((favId) => String(favId) === String(id));
    },
    [favourites?.hotels]
  );

  const getUsers = () => {
    return seedDefaultUser();
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const setCurrentUser = (user) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUserState(user);
  };

  const signup = ({ name, email, password }) => {
    let cleanEmail = email.trim().toLowerCase();
    let users = getUsers();

    if (users.some((u) => u.email === cleanEmail)) {
      return { ok: false, error: "An account with that email already exists. Try logging in instead." };
    }

    users.push({ name, email: cleanEmail, password });
    saveUsers(users);
    setCurrentUser({ name, email: cleanEmail });
    showToast(`Welcome to TripWise, ${name || "Traveler"}! 🎉`, "success", "🎉");
    return { ok: true };
  };

  const login = ({ email, password }) => {
    let cleanEmail = email.trim().toLowerCase();
    let users = getUsers();
    let match = users.find((u) => u.email === cleanEmail && u.password === password);

    if (!match) {
      return { ok: false, error: "Email or password is incorrect." };
    }

    setCurrentUser({ name: match.name, email: match.email });
    showToast(`Welcome back, ${match.name}! 👋`, "success", "👋");
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUserState(null);
    showToast("Logged out successfully.", "info", "🚪");
  };

  const deleteAccount = () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;
    if (currentUser) {
      let users = getUsers().filter((u) => u.email !== currentUser.email);
      saveUsers(users);
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(PLANNED_VISITS_KEY);
    setCurrentUserState(null);
    setPlannedVisits([]);
    showToast("Account deleted.", "info", "🗑️");
  };

  const value = {
    places,
    plannedVisits,
    visitedTrips,
    visitedPlaces,
    hotelReviews,
    favourites,
    toggleFavouritePlace,
    toggleFavouriteHotel,
    isPlaceFavourite,
    isHotelFavourite,
    planVisit,
    removeVisit,
    markAsVisited,
    removeVisitedPlace,
    addHotelReview,
    currentUser,
    settings,
    updateSettings,
    toggleTheme,
    updateProfile,
    signup,
    login,
    logout,
    deleteAccount,
    toasts,
    showToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}