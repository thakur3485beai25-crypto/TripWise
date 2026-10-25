import { initialPlaces } from "../data/places";

export const PLANNED_VISITS_KEY = "tripwise_planned_visits";

export const PLANNED_VISITS_SEEDED_KEY = "tripwise_planned_visits_seeded";

export const VISITED_PLACES_KEY = "tripwise_visited_places";

export const HOTEL_REVIEWS_KEY = "tripwise_hotel_reviews";

export const CURRENT_USER_KEY = "tripwise_current_user";

export const USERS_KEY = "tripwise_users";

export const VISITED_TRIPS_KEY = "tripwise_visited_trips";

export const SETTINGS_KEY = "tripwise_settings";

// Default pre-seeded login accounts (including asd123@gmail.com and rajvansh@tripwise.com)
export const SEEDED_DEFAULT_USERS = [
  {
    name: "User",
    email: "asd123@gmail.com",
    password: "asdfg",
  },
  {
    name: "Rajvansh",
    email: "rajvansh@tripwise.com",
    password: "tripwise123",
  },
];

// Default demo reviews for hotels
export const DEFAULT_HOTEL_REVIEWS = [
  {
    id: "rev_1",
    placeId: 1,
    hotelName: "Hotel Snow View",
    userEmail: "rajvansh@tripwise.com",
    userName: "Rajvansh",
    rating: 5,
    text: "Unbeatable mountain panorama and heated rooms. The morning sunrise from the balcony was surreal!",
    date: "15/08/2026",
  },
  {
    id: "rev_2",
    placeId: 31,
    hotelName: "Tea Valley Resort",
    userEmail: "traveler@tripwise.com",
    userName: "Aarav Sharma",
    rating: 4,
    text: "Surrounded by lush green tea plantations. Very serene stay and great authentic South Indian breakfast.",
    date: "10/08/2026",
  },
];

export const DEFAULT_SETTINGS = {
  theme: "light", // "light" | "dark"
  crowdAlerts: true,
  tripReminders: true,
  dealAlerts: false,
  currency: "INR", // "INR" | "USD" | "EUR" | "GBP"
  tempUnit: "C", // "C" | "F"
  defaultTravelMode: "Car", // "Car" | "Train" | "Flight" | "Bus"
  defaultBudget: "Mid-Range", // "Budget" | "Mid-Range" | "Luxury"
};

export function seedDefaultUser() {
  let users = SEEDED_DEFAULT_USERS;
  let saved = localStorage.getItem(USERS_KEY);
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        users = parsed;
        // Ensure asd123@gmail.com is present in users
        if (!users.some((u) => u.email === "asd123@gmail.com")) {
          users.push(SEEDED_DEFAULT_USERS[0]);
        }
      }
    } catch (e) {
      users = SEEDED_DEFAULT_USERS;
    }
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

// Generate live, randomized crowd levels on every app load (20% to ~95% of maxVisitors)
export function randomizePlaceCrowds(placesList) {
  return placesList.map((p) => {
    const ratio = 0.2 + Math.random() * 0.75;
    const visitors = Math.max(1, Math.min(p.maxVisitors, Math.round(p.maxVisitors * ratio)));
    return {
      ...p,
      currentVisitors: visitors,
    };
  });
}

export function loadInitialPlaces() {
  // Clear any legacy saved visitor count so crowds re-randomize fresh
  try {
    localStorage.removeItem("tripwise_visitor_counts");
  } catch (e) {
    /* ignore */
  }
  return randomizePlaceCrowds(initialPlaces);
}

export function loadPlannedVisits() {
  let saved = localStorage.getItem(PLANNED_VISITS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function loadVisitedTrips() {
  let saved = localStorage.getItem(VISITED_TRIPS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  let sample = [
    {
      placeId: 28,
      name: "Goa",
      icon: "🏖️",
      date: "15 Jan 2024",
      hotelStayed: { name: "Sea Breeze Resort", price: "₹4,200/night" },
      review: { rating: 4, text: "Loved the beach vibe, hotel was clean and close to the shore." },
      receipt: { amount: "₹8,400", paymentId: "TXN10293", date: "15 Jan 2024" },
    },
    {
      placeId: 22,
      name: "Jaipur",
      icon: "🏰",
      date: "8 Mar 2025",
      hotelStayed: { name: "Heritage Haveli", price: "₹3,000/night" },
      review: { rating: 5, text: "Beautiful architecture and great service throughout the stay." },
      receipt: { amount: "₹6,000", paymentId: "TXN20481", date: "8 Mar 2025" },
    },
    {
      placeId: 31,
      name: "Munnar",
      icon: "🍃",
      date: "20 Jun 2026",
      hotelStayed: { name: "Tea County Resort", price: "₹3,500/night" },
      review: { rating: 4, text: "Peaceful stay surrounded by tea gardens, would visit again." },
      receipt: { amount: "₹7,000", paymentId: "TXN30567", date: "20 Jun 2026" },
    },
  ];
  localStorage.setItem(VISITED_TRIPS_KEY, JSON.stringify(sample));
  return sample;
}

export function loadVisitedPlaces() {
  let saved = localStorage.getItem(VISITED_PLACES_KEY);
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      /* ignore */
    }
  }
  const defaultVisited = [
    { placeId: 28, name: "Goa", dateVisited: "15 Jan 2024", userEmail: "asd123@gmail.com" },
    { placeId: 22, name: "Jaipur", dateVisited: "8 Mar 2025", userEmail: "asd123@gmail.com" },
    { placeId: 31, name: "Munnar", dateVisited: "20 Jun 2026", userEmail: "asd123@gmail.com" },
  ];
  localStorage.setItem(VISITED_PLACES_KEY, JSON.stringify(defaultVisited));
  return defaultVisited;
}

export function loadHotelReviews() {
  let saved = localStorage.getItem(HOTEL_REVIEWS_KEY);
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      /* ignore */
    }
  }
  localStorage.setItem(HOTEL_REVIEWS_KEY, JSON.stringify(DEFAULT_HOTEL_REVIEWS));
  return DEFAULT_HOTEL_REVIEWS;
}

export function loadCurrentUser() {
  let saved = localStorage.getItem(CURRENT_USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function loadSettings() {
  let saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      /* ignore */
    }
  }
  return DEFAULT_SETTINGS;
}

// ---------------- Favourites / Wishlist Storage ----------------
export const FAVOURITES_KEY = "tripwise_favourites";

// Returns user-specific or guest key for favourites
export function getFavouritesStorageKey(userEmail) {
  if (userEmail && typeof userEmail === "string" && userEmail.trim()) {
    return `${FAVOURITES_KEY}_${userEmail.trim().toLowerCase()}`;
  }
  return `${FAVOURITES_KEY}_guest`;
}

// Safely loads favourites with { places: [], hotels: [] } structure
export function loadFavourites(userEmail) {
  const key = getFavouritesStorageKey(userEmail);
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        places: Array.isArray(parsed?.places) ? parsed.places : [],
        hotels: Array.isArray(parsed?.hotels) ? parsed.hotels : [],
      };
    }
  } catch (e) {
    // Return empty state if data is broken or unparseable
  }
  return { places: [], hotels: [] };
}

// Safely saves favourites to localStorage
export function saveFavourites(favourites, userEmail) {
  const key = getFavouritesStorageKey(userEmail);
  try {
    const data = {
      places: Array.isArray(favourites?.places) ? favourites.places : [],
      hotels: Array.isArray(favourites?.hotels) ? favourites.hotels : [],
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    /* ignore storage quota errors */
  }
}