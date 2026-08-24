import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams, useParams, Navigate } from "react-router-dom";
import "./styles.css";

/* ================================================================
   TripWise — single-file React app
   Sections below, in order:
   1. Data (destinations, recommended hotels, categories, regions)
   2. Assistant logic (local FAQ-style matcher)
   3. App context (auth, planned visits, visited places, hotel reviews)
   4. Components (Navbar, PlaceCard, HotelCard, PlaceModal, AssistantWidget)
   5. Pages (Home, Explore, MyTrips, Account, Login, Signup)
   6. App (routes) + render
   ================================================================ */

/* ---------------- 1. DATA ---------------- */

const categories = ["All", "Hill Station", "Plains", "Beach", "Desert", "Forest"];
const regions = ["All", "North", "South", "East", "West", "Northeast", "Islands"];

const initialPlaces = [
  { id: 1, name: "Manali", region: "North", category: "Hill Station", icon: "🏔️", artColor: "#e2d9f2", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun", weather: "Cold", desc: "A riverside town in the Beas valley, popular for snow activities and easy access to Solang Valley and Rohtang Pass.", hotels: [{ name: "Hotel Snow View", price: "₹2000/night" }, { name: "Mountain Inn", price: "₹1500/night" }], maxVisitors: 100, currentVisitors: 62 },
  { id: 2, name: "Shimla", region: "North", category: "Hill Station", icon: "⛰️", artColor: "#d9e4f2", image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Dec - Jan", weather: "Cold", desc: "The former British summer capital, known for Mall Road, colonial architecture, and toy train rides.", hotels: [{ name: "Ridge View Hotel", price: "₹2200/night" }, { name: "Colonial Heights", price: "₹3000/night" }], maxVisitors: 120, currentVisitors: 118 },
  { id: 3, name: "Dharamshala", region: "North", category: "Hill Station", icon: "🏞️", artColor: "#d9f0e8", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Sep - Nov", weather: "Moderate", desc: "Home to the Dalai Lama's residence in McLeodganj, blending Tibetan culture with pine-covered hills.", hotels: [{ name: "Norbulingka Stay", price: "₹1800/night" }, { name: "Pine Ridge Cottage", price: "₹2100/night" }], maxVisitors: 90, currentVisitors: 30 },
  { id: 4, name: "Spiti Valley", region: "North", category: "Desert", icon: "🏜️", artColor: "#f2e8d9", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80", bestTime: "May - Sep", weather: "Extreme Cold", desc: "A remote high-altitude cold desert with monasteries, moonscape terrain, and dramatic mountain scenery.", hotels: [{ name: "Spiti Homestay Co-op", price: "₹1200/night" }, { name: "Key Monastery Guesthouse", price: "₹900/night" }], maxVisitors: 40, currentVisitors: 12 },
  { id: 5, name: "Kasol", region: "North", category: "Hill Station", icon: "🏕️", artColor: "#d9ecf2", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Sep - Nov", weather: "Moderate", desc: "A backpacker hub on the Parvati River, known for riverside cafes and a laid-back mountain-village vibe.", hotels: [{ name: "Riverside Camps", price: "₹800/night" }, { name: "Parvati Valley Hostel", price: "₹600/night" }], maxVisitors: 70, currentVisitors: 65 },
  { id: 6, name: "Dalhousie", region: "North", category: "Hill Station", icon: "🌲", artColor: "#dcecd6", image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Oct - Nov", weather: "Cold", desc: "A quiet colonial-era hill town spread across five hills, with pine forests and old churches.", hotels: [{ name: "Pine Grove Resort", price: "₹1900/night" }, { name: "Church View Cottage", price: "₹1600/night" }], maxVisitors: 80, currentVisitors: 22 },
  { id: 7, name: "Chail", region: "North", category: "Hill Station", icon: "🌄", artColor: "#f2ead9", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Sep - Nov", weather: "Moderate", desc: "A peaceful retreat near Shimla with the world's highest cricket ground and dense deodar forests.", hotels: [{ name: "Chail Palace Wing", price: "₹3200/night" }, { name: "Deodar Cottage", price: "₹1400/night" }], maxVisitors: 60, currentVisitors: 18 },
  { id: 8, name: "McLeodganj", region: "North", category: "Hill Station", icon: "🕉️", artColor: "#e6d9f2", image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Sep - Nov", weather: "Moderate", desc: "Perched above Dharamshala, known for Tibetan monasteries, Bhagsu Waterfall, and a strong cafe culture.", hotels: [{ name: "Bhagsu View Hotel", price: "₹1700/night" }, { name: "Monastery Lane Stay", price: "₹1300/night" }], maxVisitors: 85, currentVisitors: 85 },
  { id: 9, name: "Rishikesh", region: "North", category: "Forest", icon: "🕊️", artColor: "#d9f2e2", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80", bestTime: "Sep - Apr", weather: "Moderate", desc: "The yoga capital on the Ganges, framed by forested foothills, river rafting, and suspension bridges.", hotels: [{ name: "Ganga Beach Camp", price: "₹1400/night" }, { name: "Ashram Riverside Stay", price: "₹900/night" }], maxVisitors: 90, currentVisitors: 48 },
  { id: 10, name: "Haridwar", region: "North", category: "Plains", icon: "🛕", artColor: "#f2e0d9", image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "A sacred plains city on the Ganges, famous for the evening Ganga Aarti at Har Ki Pauri.", hotels: [{ name: "Ganga Ghat Hotel", price: "₹1300/night" }, { name: "Pilgrim Rest House", price: "₹700/night" }], maxVisitors: 110, currentVisitors: 70 },
  { id: 11, name: "Nainital", region: "North", category: "Hill Station", icon: "🛶", artColor: "#d9e6f2", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Sep - Nov", weather: "Cool", desc: "A lake-side hill station in Kumaon, built around the crescent-shaped Naini Lake.", hotels: [{ name: "Lake Palace Hotel", price: "₹2300/night" }, { name: "Mall Road Inn", price: "₹1500/night" }], maxVisitors: 95, currentVisitors: 80 },
  { id: 12, name: "Mussoorie", region: "North", category: "Hill Station", icon: "☁️", artColor: "#e6ecf2", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Jun, Sep - Nov", weather: "Cool", desc: "The 'Queen of the Hills' near Dehradun, known for Mall Road, waterfalls, and Himalayan views.", hotels: [{ name: "Cloud's End Resort", price: "₹2500/night" }, { name: "Camel's Back Cottage", price: "₹1700/night" }], maxVisitors: 100, currentVisitors: 55 },
  { id: 13, name: "Auli", region: "North", category: "Hill Station", icon: "🎿", artColor: "#f0f2f5", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Mar", weather: "Snowy", desc: "A ski resort town in the Garhwal Himalayas with wide snow slopes and cable car views of Nanda Devi.", hotels: [{ name: "Ski Slope Resort", price: "₹2800/night" }, { name: "Auli Ropeway Lodge", price: "₹2000/night" }], maxVisitors: 45, currentVisitors: 20 },
  { id: 14, name: "Leh", region: "North", category: "Desert", icon: "🏔️", artColor: "#e8e0d9", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80", bestTime: "May - Sep", weather: "Cold, Dry", desc: "A high-altitude cold desert capital of Ladakh, gateway to Pangong Lake and Khardung La pass.", hotels: [{ name: "Ladakh Heights Hotel", price: "₹2600/night" }, { name: "Old Town Guesthouse", price: "₹1100/night" }], maxVisitors: 65, currentVisitors: 30 },
  { id: 15, name: "Srinagar", region: "North", category: "Hill Station", icon: "🚣", artColor: "#d9f2ec", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80", bestTime: "Apr - Oct", weather: "Cool", desc: "The summer capital of Kashmir, famous for houseboats and shikara rides on Dal Lake.", hotels: [{ name: "Dal Lake Houseboat", price: "₹2400/night" }, { name: "Shalimar Garden Inn", price: "₹1800/night" }], maxVisitors: 85, currentVisitors: 40 },
  { id: 16, name: "Gulmarg", region: "North", category: "Hill Station", icon: "🎿", artColor: "#eef2d9", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", bestTime: "Dec - Feb, Apr - Jun", weather: "Snowy", desc: "A meadow-turned-ski-resort in Kashmir with Asia's highest cable car, the Gulmarg Gondola.", hotels: [{ name: "Gondola View Resort", price: "₹3000/night" }, { name: "Meadow Lodge", price: "₹2000/night" }], maxVisitors: 55, currentVisitors: 25 },
  { id: 17, name: "Amritsar", region: "North", category: "Plains", icon: "🛕", artColor: "#f2e6d9", image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "Home to the Golden Temple, with a bustling old city and the daily Wagah Border ceremony nearby.", hotels: [{ name: "Golden Temple View Hotel", price: "₹2000/night" }, { name: "Heritage Street Inn", price: "₹1300/night" }], maxVisitors: 130, currentVisitors: 95 },
  { id: 18, name: "Jaipur", region: "North", category: "Plains", icon: "🏰", artColor: "#f2d9d9", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "The 'Pink City', known for Amber Fort, Hawa Mahal, and vibrant bazaars of old Rajasthan.", hotels: [{ name: "City Palace View Hotel", price: "₹2700/night" }, { name: "Pink City Haveli", price: "₹1600/night" }], maxVisitors: 140, currentVisitors: 100 },
  { id: 19, name: "Jodhpur", region: "North", category: "Desert", icon: "🏯", artColor: "#dce6f2", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm, Dry", desc: "The 'Blue City' on the edge of the Thar Desert, dominated by the towering Mehrangarh Fort.", hotels: [{ name: "Blue City Haveli", price: "₹2300/night" }, { name: "Fort View Guesthouse", price: "₹1400/night" }], maxVisitors: 90, currentVisitors: 50 },
  { id: 20, name: "Udaipur", region: "North", category: "Plains", icon: "🏞️", artColor: "#d9f2f0", image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "The 'City of Lakes', known for Lake Pichola, City Palace, and romantic lakeside architecture.", hotels: [{ name: "Lake Pichola Resort", price: "₹3200/night" }, { name: "Old City Haveli", price: "₹1700/night" }], maxVisitors: 100, currentVisitors: 68 },
  { id: 21, name: "Delhi", region: "North", category: "Plains", icon: "🏛️", artColor: "#ede0f2", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "India's capital, layered with Mughal monuments, colonial buildings, and modern city life.", hotels: [{ name: "Connaught Place Hotel", price: "₹2600/night" }, { name: "Old Delhi Inn", price: "₹1500/night" }], maxVisitors: 200, currentVisitors: 150 },
  { id: 22, name: "Agra", region: "North", category: "Plains", icon: "🕌", artColor: "#f2ecd9", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "Home to the Taj Mahal, along with Agra Fort and Fatehpur Sikri from the Mughal era.", hotels: [{ name: "Taj View Hotel", price: "₹2900/night" }, { name: "Heritage Agra Inn", price: "₹1500/night" }], maxVisitors: 160, currentVisitors: 155 },
  { id: 23, name: "Varanasi", region: "North", category: "Plains", icon: "🪔", artColor: "#f2d9df", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "One of the world's oldest living cities, known for its Ganges ghats and evening Ganga Aarti.", hotels: [{ name: "Ghat View Guesthouse", price: "₹1600/night" }, { name: "Old City Haveli", price: "₹1100/night" }], maxVisitors: 150, currentVisitors: 120 },
  { id: 24, name: "Mumbai", region: "West", category: "Beach", icon: "🌇", artColor: "#d9e2f2", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Feb", weather: "Warm, Humid", desc: "India's coastal megacity, home to the Gateway of India, Marine Drive, and Bollywood.", hotels: [{ name: "Marine Drive Hotel", price: "₹3500/night" }, { name: "Colaba Backpackers", price: "₹1400/night" }], maxVisitors: 180, currentVisitors: 140 },
  { id: 63, name: "Goa", region: "West", category: "Beach", icon: "🏖️", artColor: "#d6ecf0", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Feb", weather: "Warm, Humid", desc: "India's most popular coastal getaway, with palm-lined beaches, Portuguese-era architecture, and lively nightlife.", hotels: [{ name: "Palm Coast Resort", price: "₹3500/night" }, { name: "Beachside Shack Stay", price: "₹1900/night" }], maxVisitors: 150, currentVisitors: 132 },
  { id: 25, name: "Lonavala", region: "West", category: "Hill Station", icon: "🌧️", artColor: "#d9f2e6", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Jun - Sep, Oct - Feb", weather: "Cool, Misty", desc: "A monsoon hill retreat near Pune and Mumbai, known for waterfalls and the Bhaja and Karla caves.", hotels: [{ name: "Valley View Resort", price: "₹2000/night" }, { name: "Hilltop Cottage", price: "₹1300/night" }], maxVisitors: 90, currentVisitors: 60 },
  { id: 26, name: "Mahabaleshwar", region: "West", category: "Hill Station", icon: "🍓", artColor: "#e6f2d9", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Jun", weather: "Cool", desc: "A hill station in the Sahyadris known for strawberry farms and panoramic Western Ghats viewpoints.", hotels: [{ name: "Strawberry Hill Resort", price: "₹2200/night" }, { name: "Panorama Point Inn", price: "₹1500/night" }], maxVisitors: 80, currentVisitors: 35 },
  { id: 27, name: "Ajanta & Ellora", region: "West", category: "Plains", icon: "🗿", artColor: "#f2ead9", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Mar", weather: "Warm", desc: "UNESCO-listed rock-cut cave complexes near Aurangabad with ancient Buddhist and Hindu carvings.", hotels: [{ name: "Cave Heritage Hotel", price: "₹1900/night" }, { name: "Aurangabad Inn", price: "₹1200/night" }], maxVisitors: 70, currentVisitors: 25 },
  { id: 28, name: "Rann of Kutch", region: "West", category: "Desert", icon: "🏜️", artColor: "#f2f0e0", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Feb", weather: "Warm, Dry", desc: "A vast white salt desert in Gujarat that hosts the annual Rann Utsav festival under the full moon.", hotels: [{ name: "White Desert Camp", price: "₹2500/night" }, { name: "Kutch Tent City", price: "₹1800/night" }], maxVisitors: 60, currentVisitors: 45 },
  { id: 29, name: "Gir Forest", region: "West", category: "Forest", icon: "🦁", artColor: "#e6f2d0", image: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80", bestTime: "Dec - Mar", weather: "Warm", desc: "The last wild home of the Asiatic lion, a dry deciduous forest reserve in Gujarat.", hotels: [{ name: "Sasan Gir Lodge", price: "₹2700/night" }, { name: "Forest Trail Camp", price: "₹1600/night" }], maxVisitors: 50, currentVisitors: 18 },
  { id: 30, name: "Diu", region: "West", category: "Beach", icon: "🏖️", artColor: "#d9eef2", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "A quiet coastal town with Portuguese-era forts and uncrowded beaches on the Gujarat coast.", hotels: [{ name: "Diu Fort View Hotel", price: "₹1800/night" }, { name: "Nagoa Beach Resort", price: "₹1400/night" }], maxVisitors: 55, currentVisitors: 20 },
  { id: 31, name: "Munnar", region: "South", category: "Hill Station", icon: "🍃", artColor: "#dcead0", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80", bestTime: "Sep - May", weather: "Cool", desc: "A Kerala hill station wrapped in rolling tea plantations and misty Western Ghats peaks.", hotels: [{ name: "Tea Valley Resort", price: "₹2400/night" }, { name: "Misty Hills Homestay", price: "₹1500/night" }], maxVisitors: 75, currentVisitors: 40 },
  { id: 32, name: "Ooty", region: "South", category: "Hill Station", icon: "🌸", artColor: "#e6dced", image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Jun", weather: "Cool", desc: "The 'Queen of Hill Stations' in Tamil Nadu, known for the Nilgiri toy train and botanical gardens.", hotels: [{ name: "Nilgiri Heights", price: "₹2100/night" }, { name: "Botanical View Inn", price: "₹1600/night" }], maxVisitors: 95, currentVisitors: 50 },
  { id: 33, name: "Kodaikanal", region: "South", category: "Hill Station", icon: "🌫️", artColor: "#d9e6ea", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Sep - May", weather: "Cool", desc: "A misty hill station around a star-shaped lake, known for pine forests and Pillar Rocks.", hotels: [{ name: "Lake View Cottage", price: "₹2000/night" }, { name: "Pine Forest Resort", price: "₹1500/night" }], maxVisitors: 70, currentVisitors: 30 },
  { id: 34, name: "Coorg", region: "South", category: "Hill Station", icon: "☕", artColor: "#e0ecd6", image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Cool", desc: "Karnataka's coffee country, with misty hills, spice plantations, and waterfalls.", hotels: [{ name: "Coffee Estate Homestay", price: "₹2100/night" }, { name: "Western Ghats Resort", price: "₹1700/night" }], maxVisitors: 65, currentVisitors: 28 },
  { id: 35, name: "Alleppey", region: "South", category: "Plains", icon: "🚤", artColor: "#d9f2ea", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Feb", weather: "Warm", desc: "The 'Venice of the East', known for houseboat cruises through Kerala's palm-fringed backwaters.", hotels: [{ name: "Backwater Houseboat Stay", price: "₹2800/night" }, { name: "Palm Grove Homestay", price: "₹1400/night" }], maxVisitors: 85, currentVisitors: 60 },
  { id: 36, name: "Kovalam", region: "South", category: "Beach", icon: "🏖️", artColor: "#d9eaf2", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Mar", weather: "Warm, Humid", desc: "A crescent-shaped beach town in Kerala with a lighthouse and Ayurvedic wellness resorts.", hotels: [{ name: "Lighthouse Beach Resort", price: "₹2600/night" }, { name: "Ayurveda Coastal Inn", price: "₹1600/night" }], maxVisitors: 75, currentVisitors: 40 },
  { id: 37, name: "Varkala", region: "South", category: "Beach", icon: "🌊", artColor: "#d9e6f2", image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Mar", weather: "Warm, Humid", desc: "A cliffside beach town in Kerala where red laterite cliffs drop straight to the Arabian Sea.", hotels: [{ name: "Cliff Edge Resort", price: "₹2200/night" }, { name: "Papanasam Beach Stay", price: "₹1300/night" }], maxVisitors: 60, currentVisitors: 25 },
  { id: 38, name: "Bandipur National Park", region: "South", category: "Forest", icon: "🐘", artColor: "#e2f0d4", image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Warm", desc: "A tiger reserve in Karnataka's Western Ghats foothills, known for elephant and deer sightings.", hotels: [{ name: "Jungle Lodge Bandipur", price: "₹2400/night" }, { name: "Safari Camp Stay", price: "₹1500/night" }], maxVisitors: 45, currentVisitors: 15 },
  { id: 39, name: "Hampi", region: "South", category: "Plains", icon: "🗿", artColor: "#f2e6d0", image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Feb", weather: "Warm", desc: "The ruined capital of the Vijayanagara Empire, scattered with boulder-strewn temple ruins.", hotels: [{ name: "Boulder View Homestay", price: "₹1600/night" }, { name: "Heritage Ruins Inn", price: "₹1000/night" }], maxVisitors: 65, currentVisitors: 35 },
  { id: 40, name: "Mysore", region: "South", category: "Plains", icon: "🏰", artColor: "#f2e0e6", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "Known for the illuminated Mysore Palace and the annual Dasara festival celebrations.", hotels: [{ name: "Palace View Hotel", price: "₹2000/night" }, { name: "Heritage Mysore Inn", price: "₹1300/night" }], maxVisitors: 90, currentVisitors: 50 },
  { id: 41, name: "Pondicherry", region: "South", category: "Beach", icon: "🥐", artColor: "#e0eaf2", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm, Humid", desc: "A former French colony with a promenade, colorful colonial streets, and a calm beachfront.", hotels: [{ name: "French Quarter Hotel", price: "₹2500/night" }, { name: "Promenade Beach Inn", price: "₹1500/night" }], maxVisitors: 80, currentVisitors: 45 },
  { id: 42, name: "Chennai", region: "South", category: "Beach", icon: "🏛️", artColor: "#dce6f2", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Feb", weather: "Warm, Humid", desc: "A coastal metropolis with Marina Beach, temple architecture, and deep-rooted Tamil culture.", hotels: [{ name: "Marina Bay Hotel", price: "₹2800/night" }, { name: "T Nagar Inn", price: "₹1600/night" }], maxVisitors: 150, currentVisitors: 100 },
  { id: 43, name: "Hyderabad", region: "South", category: "Plains", icon: "🕌", artColor: "#f2e6e6", image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Feb", weather: "Warm", desc: "A city of pearls and biryani, home to the Charminar and centuries of Deccan history.", hotels: [{ name: "Charminar View Hotel", price: "₹2300/night" }, { name: "Old City Inn", price: "₹1400/night" }], maxVisitors: 130, currentVisitors: 85 },
  { id: 44, name: "Araku Valley", region: "South", category: "Hill Station", icon: "☕", artColor: "#e6f2dc", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Cool", desc: "A coffee-growing hill valley in Andhra Pradesh, reached by a scenic train through the Eastern Ghats.", hotels: [{ name: "Coffee Hills Resort", price: "₹1800/night" }, { name: "Valley View Cottage", price: "₹1200/night" }], maxVisitors: 50, currentVisitors: 20 },
  { id: 45, name: "Darjeeling", region: "East", category: "Hill Station", icon: "🍵", artColor: "#e0ecda", image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - May, Oct - Nov", weather: "Cool", desc: "A Himalayan tea town famous for its toy train, tea gardens, and Kanchenjunga sunrise views.", hotels: [{ name: "Tea Garden View Hotel", price: "₹2300/night" }, { name: "Mall Road Inn", price: "₹1500/night" }], maxVisitors: 90, currentVisitors: 70 },
  { id: 46, name: "Kolkata", region: "East", category: "Plains", icon: "🎭", artColor: "#f2e0d4", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "India's cultural capital of the east, known for colonial architecture, art, and street food.", hotels: [{ name: "Park Street Hotel", price: "₹2600/night" }, { name: "Old Kolkata Inn", price: "₹1400/night" }], maxVisitors: 150, currentVisitors: 100 },
  { id: 47, name: "Sundarbans", region: "East", category: "Forest", icon: "🐯", artColor: "#d8f0da", image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80", bestTime: "Sep - Mar", weather: "Warm, Humid", desc: "The world's largest mangrove forest, home to the Royal Bengal Tiger, explored by boat.", hotels: [{ name: "Mangrove Eco Lodge", price: "₹2200/night" }, { name: "River Delta Camp", price: "₹1500/night" }], maxVisitors: 40, currentVisitors: 15 },
  { id: 48, name: "Puri", region: "East", category: "Beach", icon: "🛕", artColor: "#d9e6f2", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Feb", weather: "Warm, Humid", desc: "A pilgrim beach town in Odisha, home to the Jagannath Temple and the annual Rath Yatra.", hotels: [{ name: "Golden Beach Resort", price: "₹1900/night" }, { name: "Temple Town Inn", price: "₹1200/night" }], maxVisitors: 100, currentVisitors: 65 },
  { id: 49, name: "Bhubaneswar", region: "East", category: "Plains", icon: "🛕", artColor: "#f2ecd9", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "The 'Temple City' of Odisha, dotted with centuries-old Kalinga-style stone temples.", hotels: [{ name: "Temple City Hotel", price: "₹1700/night" }, { name: "Heritage Odisha Inn", price: "₹1100/night" }], maxVisitors: 80, currentVisitors: 30 },
  { id: 50, name: "Shillong", region: "Northeast", category: "Hill Station", icon: "🎸", artColor: "#e6e0f2", image: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Cool", desc: "The 'Scotland of the East', a Meghalaya hill town with waterfalls and a strong music culture.", hotels: [{ name: "Ward's Lake View Hotel", price: "₹1900/night" }, { name: "Police Bazar Inn", price: "₹1200/night" }], maxVisitors: 70, currentVisitors: 45 },
  { id: 51, name: "Cherrapunji", region: "Northeast", category: "Forest", icon: "🌧️", artColor: "#d9ecd4", image: "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Wet, Humid", desc: "One of the wettest places on Earth, known for living root bridges woven from rubber tree roots.", hotels: [{ name: "Living Root Bridge Homestay", price: "₹1400/night" }, { name: "Rainforest Cottage", price: "₹1000/night" }], maxVisitors: 35, currentVisitors: 10 },
  { id: 52, name: "Gangtok", region: "Northeast", category: "Hill Station", icon: "🏔️", artColor: "#dee6f2", image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - May, Oct - Dec", weather: "Cool", desc: "Sikkim's capital, framed by Kanchenjunga views, monasteries, and cable car rides.", hotels: [{ name: "MG Marg Hotel", price: "₹2200/night" }, { name: "Monastery View Lodge", price: "₹1500/night" }], maxVisitors: 65, currentVisitors: 35 },
  { id: 53, name: "Tawang", region: "Northeast", category: "Hill Station", icon: "🏯", artColor: "#e6eaf2", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80", bestTime: "Mar - Oct", weather: "Cold", desc: "A remote Arunachal Pradesh town home to one of the largest Buddhist monasteries in India.", hotels: [{ name: "Monastery Gate Hotel", price: "₹2000/night" }, { name: "Himalayan Border Inn", price: "₹1300/night" }], maxVisitors: 30, currentVisitors: 8 },
  { id: 54, name: "Kaziranga National Park", region: "Northeast", category: "Forest", icon: "🦏", artColor: "#e4f0d6", image: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80", bestTime: "Nov - Apr", weather: "Warm", desc: "An Assam grassland reserve holding the world's largest population of one-horned rhinoceros.", hotels: [{ name: "Rhino Camp Lodge", price: "₹2500/night" }, { name: "Brahmaputra Riverside Stay", price: "₹1600/night" }], maxVisitors: 45, currentVisitors: 20 },
  { id: 55, name: "Majuli", region: "Northeast", category: "Plains", icon: "🎭", artColor: "#f2eed4", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "The world's largest river island on the Brahmaputra, known for Assamese monasteries and mask-making.", hotels: [{ name: "River Island Homestay", price: "₹1100/night" }, { name: "Satra Village Cottage", price: "₹800/night" }], maxVisitors: 25, currentVisitors: 6 },
  { id: 56, name: "Kohima", region: "Northeast", category: "Hill Station", icon: "🎋", artColor: "#e6f2e0", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Cool", desc: "Nagaland's capital, known for WWII war memorials and the vibrant annual Hornbill Festival.", hotels: [{ name: "War Cemetery View Hotel", price: "₹1700/night" }, { name: "Naga Heritage Inn", price: "₹1100/night" }], maxVisitors: 35, currentVisitors: 12 },
  { id: 57, name: "Port Blair", region: "Islands", category: "Beach", icon: "🏝️", artColor: "#d4eef2", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Warm, Humid", desc: "The gateway to the Andaman Islands, with the Cellular Jail memorial and turquoise coastal waters.", hotels: [{ name: "Cellular Jail View Hotel", price: "₹2600/night" }, { name: "Corbyn's Cove Resort", price: "₹1800/night" }], maxVisitors: 55, currentVisitors: 25 },
  { id: 58, name: "Havelock Island", region: "Islands", category: "Beach", icon: "🐚", artColor: "#cfeaf2", image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Warm, Humid", desc: "Home to Radhanagar Beach, ranked among Asia's best, with clear water for snorkeling and diving.", hotels: [{ name: "Radhanagar Beach Resort", price: "₹3200/night" }, { name: "Coral Reef Cottage", price: "₹2000/night" }], maxVisitors: 40, currentVisitors: 30 },
  { id: 59, name: "Lakshadweep", region: "Islands", category: "Beach", icon: "🌴", artColor: "#d4f0ec", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - May", weather: "Warm, Humid", desc: "A cluster of coral islands off Kerala's coast with lagoons, reefs, and limited daily permits.", hotels: [{ name: "Lagoon View Cottage", price: "₹3500/night" }, { name: "Coral Island Stay", price: "₹2400/night" }], maxVisitors: 20, currentVisitors: 18 },
  { id: 60, name: "Khajuraho", region: "North", category: "Plains", icon: "🛕", artColor: "#f2e6da", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Mar", weather: "Warm", desc: "A Madhya Pradesh temple town famous for intricately carved medieval Hindu and Jain temples.", hotels: [{ name: "Temple Complex Hotel", price: "₹1900/night" }, { name: "Heritage Khajuraho Inn", price: "₹1200/night" }], maxVisitors: 50, currentVisitors: 20 },
  { id: 61, name: "Pachmarhi", region: "North", category: "Forest", icon: "🌳", artColor: "#dcf0d6", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Jun", weather: "Cool", desc: "The 'Satpura Queen', a forested hill station in Madhya Pradesh with waterfalls and caves.", hotels: [{ name: "Satpura Forest Lodge", price: "₹1800/night" }, { name: "Pachmarhi Hill Resort", price: "₹1300/night" }], maxVisitors: 40, currentVisitors: 14 },
  { id: 62, name: "Ranthambore", region: "North", category: "Forest", icon: "🐅", artColor: "#eef0d4", image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80", bestTime: "Oct - Jun", weather: "Warm", desc: "A Rajasthan tiger reserve set among ancient fort ruins and dry deciduous forest.", hotels: [{ name: "Tiger Trail Resort", price: "₹2800/night" }, { name: "Fort Edge Camp", price: "₹1700/night" }], maxVisitors: 45, currentVisitors: 22 }
];

// Recommended Hotels linked to real destinations
const recommendedHotels = [
  {
    id: "rec_1",
    name: "The Himalayan",
    destinationId: 1, // Manali
    destinationName: "Manali",
    location: "Manali, Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: "1,420 reviews",
    pricePerNight: "₹6,500 / night",
    badge: "Luxury Mountain Resort",
    category: "Hill Station",
    region: "North",
  },
  {
    id: "rec_2",
    name: "Snow Valley Resort",
    destinationId: 1, // Manali
    destinationName: "Manali",
    location: "Manali, Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewCount: "1,180 reviews",
    pricePerNight: "₹4,200 / night",
    badge: "Valley View",
    category: "Hill Station",
    region: "North",
  },
  {
    id: "rec_3",
    name: "Clarkes Hotel",
    destinationId: 2, // Shimla
    destinationName: "Shimla",
    location: "Shimla, Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: "980 reviews",
    pricePerNight: "₹6,800 / night",
    badge: "Colonial Heritage",
    category: "Hill Station",
    region: "North",
  },
  {
    id: "rec_4",
    name: "Fortune Park Moksha",
    destinationId: 3, // Dharamshala
    destinationName: "Dharamshala",
    location: "Dharamshala, Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewCount: "1,150 reviews",
    pricePerNight: "₹5,900 / night",
    badge: "Pine Ridge Stay",
    category: "Hill Station",
    region: "North",
  },
  {
    id: "rec_5",
    name: "Cidade de Goa",
    destinationId: 28, // Goa
    destinationName: "Goa",
    location: "Vainguinim Beach, Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewCount: "2,100 reviews",
    pricePerNight: "₹5,200 / night",
    badge: "Beachfront Resort",
    category: "Beach",
    region: "West",
  },
  {
    id: "rec_6",
    name: "Taj Fort Aguada Resort",
    destinationId: 28, // Goa
    destinationName: "Goa",
    location: "Sinquerim, Goa",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: "3,400 reviews",
    pricePerNight: "₹12,500 / night",
    badge: "Ocean Heritage",
    category: "Beach",
    region: "West",
  },
  {
    id: "rec_7",
    name: "Heritage Haveli",
    destinationId: 22, // Jaipur
    destinationName: "Jaipur",
    location: "Pink City, Jaipur",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: "860 reviews",
    pricePerNight: "₹3,000 / night",
    badge: "Royal Haveli",
    category: "Plains",
    region: "North",
  },
  {
    id: "rec_8",
    name: "Rambagh Palace",
    destinationId: 22, // Jaipur
    destinationName: "Jaipur",
    location: "Bhawani Singh Rd, Jaipur",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: "4,200 reviews",
    pricePerNight: "₹24,000 / night",
    badge: "Grand Palace",
    category: "Plains",
    region: "North",
  },
  {
    id: "rec_9",
    name: "Taj Lake Palace",
    destinationId: 23, // Udaipur
    destinationName: "Udaipur",
    location: "Lake Pichola, Udaipur",
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: "5,100 reviews",
    pricePerNight: "₹28,000 / night",
    badge: "Floating Palace",
    category: "Plains",
    region: "West",
  },
  {
    id: "rec_10",
    name: "Trident Udaipur",
    destinationId: 23, // Udaipur
    destinationName: "Udaipur",
    location: "Haridas Ji Ki Magri, Udaipur",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: "1,950 reviews",
    pricePerNight: "₹8,500 / night",
    badge: "Lakeside Luxury",
    category: "Plains",
    region: "West",
  },
  {
    id: "rec_11",
    name: "Tea County Resort",
    destinationId: 31, // Munnar
    destinationName: "Munnar",
    location: "Munnar, Kerala",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    reviewCount: "1,320 reviews",
    pricePerNight: "₹3,500 / night",
    badge: "Tea Garden Valley",
    category: "Hill Station",
    region: "South",
  },
  {
    id: "rec_12",
    name: "Blanket Hotel & Spa",
    destinationId: 31, // Munnar
    destinationName: "Munnar",
    location: "Attukad Waterfalls, Munnar",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: "1,640 reviews",
    pricePerNight: "₹6,200 / night",
    badge: "Waterfall View",
    category: "Hill Station",
    region: "South",
  },
  {
    id: "rec_13",
    name: "Savoy - IHCL SeleQtions",
    destinationId: 30, // Ooty
    destinationName: "Ooty",
    location: "Sylks Rd, Ooty, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: "1,120 reviews",
    pricePerNight: "₹7,800 / night",
    badge: "Nilgiri Estate",
    category: "Hill Station",
    region: "South",
  },
  {
    id: "rec_14",
    name: "Aloha On The Ganges",
    destinationId: 13, // Rishikesh
    destinationName: "Rishikesh",
    location: "Tapovan, Rishikesh",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewCount: "2,400 reviews",
    pricePerNight: "₹6,900 / night",
    badge: "Ganga Riverside",
    category: "Hill Station",
    region: "North",
  },
  {
    id: "rec_15",
    name: "BrijRama Palace",
    destinationId: 18, // Varanasi
    destinationName: "Varanasi",
    location: "Darbhanga Ghat, Varanasi",
    image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewCount: "1,890 reviews",
    pricePerNight: "₹14,500 / night",
    badge: "Historic Ghat Palace",
    category: "Plains",
    region: "North",
  },
  {
    id: "rec_16",
    name: "The Oberoi Amarvilas",
    destinationId: 19, // Agra
    destinationName: "Agra",
    location: "Taj East Gate Rd, Agra",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviewCount: "6,200 reviews",
    pricePerNight: "₹32,000 / night",
    badge: "Taj Mahal Facing",
    category: "Plains",
    region: "North",
  },
  {
    id: "rec_17",
    name: "The Khyber Himalayan Resort",
    destinationId: 4, // Gulmarg / Srinagar
    destinationName: "Srinagar",
    location: "Gulmarg, Jammu & Kashmir",
    image: "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: "2,800 reviews",
    pricePerNight: "₹16,500 / night",
    badge: "Snow Pine Retreat",
    category: "Hill Station",
    region: "North",
  },
  {
    id: "rec_18",
    name: "Barefoot at Havelock",
    destinationId: 58, // Havelock Island
    destinationName: "Havelock Island",
    location: "Beach No. 7, Radhanagar",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewCount: "940 reviews",
    pricePerNight: "₹9,500 / night",
    badge: "Eco Rainforest Stay",
    category: "Beach",
    region: "Islands",
  },
  {
    id: "rec_19",
    name: "The Oberoi Vanyavilas",
    destinationId: 62, // Ranthambore
    destinationName: "Ranthambore",
    location: "Ranthambhore Rd, Sawai Madhopur",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: "1,500 reviews",
    pricePerNight: "₹22,000 / night",
    badge: "Jungle Safari Luxury",
    category: "Forest",
    region: "North",
  },
  {
    id: "rec_20",
    name: "Evolve Back Kabini",
    destinationId: 32, // Coorg / Kabini
    destinationName: "Coorg",
    location: "Bheeramballi, Karnataka",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewCount: "2,200 reviews",
    pricePerNight: "₹18,500 / night",
    badge: "Backwater Wildlife Lodge",
    category: "Forest",
    region: "South",
  },
];

// Previous Trips with Bill Receipts for My Trips
const DEFAULT_PREVIOUS_TRIPS = [
  {
    id: "trip_1",
    placeId: 28,
    destinationName: "Goa",
    destinationRegion: "West India",
    destinationCategory: "Beach",
    icon: "🏖️",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
    checkIn: "15 Jan 2024",
    checkOut: "18 Jan 2024",
    nights: 2,
    hotelName: "Sea Breeze Resort",
    roomType: "Deluxe Ocean View Room",
    pricePerNight: 4200,
    hotelCharge: 8400,
    serviceFee: 500,
    taxes: 1068,
    totalPaid: 9968,
    paymentMethod: "UPI / NetBanking",
    invoiceNumber: "INV-2024-TXN10293",
    bookingStatus: "Completed & Visited",
    review: {
      rating: 4,
      text: "Loved the beach vibe, hotel was clean and close to the shore.",
    },
    receipt: {
      amount: "₹8,400",
      paymentId: "TXN10293",
      date: "15 Jan 2024",
    },
  },
  {
    id: "trip_2",
    placeId: 22,
    destinationName: "Jaipur",
    destinationRegion: "North India",
    destinationCategory: "Plains",
    icon: "🏰",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80",
    checkIn: "8 Mar 2025",
    checkOut: "10 Mar 2025",
    nights: 2,
    hotelName: "Heritage Haveli",
    roomType: "Royal Heritage Suite",
    pricePerNight: 3000,
    hotelCharge: 6000,
    serviceFee: 400,
    taxes: 768,
    totalPaid: 7168,
    paymentMethod: "Credit Card (Visa)",
    invoiceNumber: "INV-2025-TXN20481",
    bookingStatus: "Completed & Visited",
    review: {
      rating: 5,
      text: "Beautiful architecture and great service throughout the stay.",
    },
    receipt: {
      amount: "₹6,000",
      paymentId: "TXN20481",
      date: "8 Mar 2025",
    },
  },
  {
    id: "trip_3",
    placeId: 31,
    destinationName: "Munnar",
    destinationRegion: "South India",
    destinationCategory: "Hill Station",
    icon: "🍃",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&auto=format&fit=crop&q=80",
    checkIn: "20 Jun 2026",
    checkOut: "22 Jun 2026",
    nights: 2,
    hotelName: "Tea County Resort",
    roomType: "Valley View Cottage",
    pricePerNight: 3500,
    hotelCharge: 7000,
    serviceFee: 450,
    taxes: 894,
    totalPaid: 8344,
    paymentMethod: "UPI (GooglePay)",
    invoiceNumber: "INV-2026-TXN30567",
    bookingStatus: "Completed & Visited",
    review: {
      rating: 4,
      text: "Peaceful stay surrounded by tea gardens, would visit again.",
    },
    receipt: {
      amount: "₹7,000",
      paymentId: "TXN30567",
      date: "20 Jun 2026",
    },
  },
];

/* ---------------- 2. ASSISTANT LOGIC ---------------- */

const formatPlaceNames = (list) => {
  let names = list.map((p) => p.name);
  if (names.length === 0) return "somewhere on our list";
  if (names.length === 1) return names[0];
  if (names.length === 2) return names[0] + " and " + names[1];
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
};

const cheapestPrice = (place) =>
  Math.min(...place.hotels.map((h) => parseInt(h.price.replace(/[^\d]/g, ""), 10)));

const sortByLowestCrowd = (list) =>
  [...list].sort((a, b) => a.currentVisitors / a.maxVisitors - b.currentVisitors / b.maxVisitors);

const sortByCheapest = (list) => [...list].sort((a, b) => cheapestPrice(a) - cheapestPrice(b));

function buildIntents(places) {
  const pickByCategory = (cat, n) =>
    sortByLowestCrowd(places.filter((p) => p.category === cat)).slice(0, n);

  const pickByRegion = (region, n) =>
    sortByLowestCrowd(places.filter((p) => p.region === region)).slice(0, n);

  return [
    {
      keywords: ["who are you", "are you ai", "are you real", "real ai", "just a bot", "gimmick"],
      respond: () =>
        "I'm TripWise's built-in trip matcher, not a real AI — I compare your message against a set of known trip questions and pull matching spots straight from our destination list.",
    },
    {
      keywords: ["hi", "hello", "hey", "yo"],
      respond: () =>
        "Hey! Tell me what you're after — cold, beach, desert, forest, quiet, budget, or a region like South India — and I'll match it to spots on TripWise.",
    },
    {
      keywords: ["thank", "thanks", "thankyou"],
      respond: () => "You're welcome — happy planning!",
    },
    {
      keywords: ["snow", "ski", "skiing"],
      respond: () => {
        let list = places.filter((p) => /snow/i.test(p.weather));
        list = sortByLowestCrowd(list.length ? list : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For snow, try " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["cold", "chilly", "winter", "himalaya"],
      respond: () => {
        let list = places.filter((p) => /cold/i.test(p.weather));
        list = sortByLowestCrowd(list.length ? list : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For a cold-weather trip, try " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["beach", "sea", "coast", "swim"],
      respond: () =>
        "For a coastal trip, try " +
        formatPlaceNames(pickByCategory("Beach", 3)) +
        " — good picks with lower crowds right now.",
    },
    {
      keywords: ["island", "andaman"],
      respond: () => "For island getaways, try " + formatPlaceNames(pickByRegion("Islands", 3)) + ".",
    },
    {
      keywords: ["desert", "dune", "arid", "rann"],
      respond: () => "For desert landscapes, try " + formatPlaceNames(pickByCategory("Desert", 3)) + ".",
    },
    {
      keywords: ["forest", "jungle", "wildlife", "tiger", "safari", "lion", "national park"],
      respond: () => "For forests and wildlife, try " + formatPlaceNames(pickByCategory("Forest", 3)) + ".",
    },
    {
      keywords: ["hill", "mountain", "trek", "hill station"],
      respond: () => "For hills and mountains, try " + formatPlaceNames(pickByCategory("Hill Station", 3)) + ".",
    },
    {
      keywords: ["quiet", "peaceful", "not crowded", "less crowd", "uncrowded", "empty", "calm"],
      respond: () =>
        "Right now the least-crowded spots on TripWise are " +
        formatPlaceNames(sortByLowestCrowd(places).slice(0, 3)) +
        ".",
    },
    {
      keywords: ["cheap", "budget", "affordable", "low cost", "inexpensive"],
      respond: () => {
        let list = sortByCheapest(places).slice(0, 3);
        return (
          "For a budget trip, try " +
          formatPlaceNames(list) +
          " — rooms start around ₹" +
          cheapestPrice(list[0]) +
          "/night there."
        );
      },
    },
    {
      keywords: ["north india", "north"],
      respond: () => "In North India, consider " + formatPlaceNames(pickByRegion("North", 3)) + ".",
    },
    {
      keywords: ["south india", "south"],
      respond: () => "In South India, consider " + formatPlaceNames(pickByRegion("South", 3)) + ".",
    },
    {
      keywords: ["east india", "east"],
      respond: () => "In East India, consider " + formatPlaceNames(pickByRegion("East", 3)) + ".",
    },
    {
      keywords: ["west india", "west"],
      respond: () => "In West India, consider " + formatPlaceNames(pickByRegion("West", 3)) + ".",
    },
    {
      keywords: ["northeast"],
      respond: () => "In Northeast India, consider " + formatPlaceNames(pickByRegion("Northeast", 3)) + ".",
    },
    {
      keywords: ["family", "kids", "children"],
      respond: () =>
        "For a family trip, calmer, lower-crowd spots tend to work best — try " +
        formatPlaceNames(sortByLowestCrowd(places).slice(0, 3)) +
        ".",
    },
    {
      keywords: ["honeymoon", "romantic", "couple"],
      respond: () =>
        "For a romantic trip, try " +
        formatPlaceNames(pickByCategory("Hill Station", 2).concat(pickByCategory("Beach", 1))) +
        ".",
    },
    {
      keywords: ["weekend trip", "weekend", "short trip", "quick getaway", "2 days", "3 days"],
      respond: () =>
        "For a quick weekend getaway, accessible scenic spots like " +
        formatPlaceNames(sortByLowestCrowd(pickByCategory("Hill Station", 2).concat(pickByCategory("Beach", 2))).slice(0, 3)) +
        " are great choices.",
    },
    {
      keywords: ["long trip", "one week", "extended trip", "long vacation", "week long"],
      respond: () =>
        "For an extended vacation or week-long journey, immersive destinations like " +
        formatPlaceNames(sortByLowestCrowd(places.filter((p) => ["North", "Northeast", "South"].includes(p.region))).slice(0, 3)) +
        " offer plenty to explore.",
    },
    {
      keywords: ["solo trip", "traveling alone", "backpacking", "solo", "backpacker", "solo travel"],
      respond: () => {
        let soloSpots = places.filter((p) => [5, 3, 19, 37, 41, 1].includes(p.id));
        let list = sortByLowestCrowd(soloSpots.length ? soloSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For solo travel and backpacking, vibrant and traveler-friendly spots like " + formatPlaceNames(list) + " are top favorites.";
      },
    },
    {
      keywords: ["trekking", "adventure", "camping", "rafting", "paragliding", "hike", "hiking", "trek"],
      respond: () => {
        let adventureSpots = places.filter((p) => [9, 13, 1, 4, 5, 16].includes(p.id));
        let list = sortByLowestCrowd(adventureSpots.length ? adventureSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For thrill-seekers and adventure activities like rafting, skiing, or trekking, check out " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["monsoon", "rainy season", "rain", "mist", "monsoons", "raining"],
      respond: () => {
        let monsoonSpots = places.filter((p) => [25, 31, 34, 50, 51].includes(p.id));
        let list = sortByLowestCrowd(monsoonSpots.length ? monsoonSpots : places.filter((p) => p.category === "Forest" || p.category === "Hill Station")).slice(0, 3);
        return "During the monsoons, misty waterfalls and lush green hills come alive in places like " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["summer", "hot weather escape", "beat the heat", "hot summer", "escape heat"],
      respond: () => {
        let coldSpots = places.filter((p) => /cold/i.test(p.weather) || /cool/i.test(p.weather));
        let list = sortByLowestCrowd(coldSpots.length ? coldSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "To escape the summer heat, cool mountain retreats like " + formatPlaceNames(list) + " are ideal.";
      },
    },
    {
      keywords: ["photography", "scenic", "instagram", "views", "photo", "photogenic", "picturesque", "viewpoint"],
      respond: () => {
        let scenicSpots = places.filter((p) => [4, 15, 20, 28, 31, 37, 39, 58].includes(p.id));
        let list = sortByLowestCrowd(scenicSpots.length ? scenicSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For incredible photography and dramatic scenic views, you can't beat " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["wildlife", "safari", "tiger", "lion", "rhino", "animals", "national park", "jungle safari"],
      respond: () => {
        let wildlifeSpots = places.filter((p) => [29, 38, 47, 54, 62].includes(p.id));
        let list = sortByLowestCrowd(wildlifeSpots.length ? wildlifeSpots : pickByCategory("Forest", 3)).slice(0, 3);
        return "For wildlife safaris and spotting tigers, lions, or rhinos, head to " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["heritage", "historical", "fort", "temple", "ruins", "monuments", "history", "palace", "architecture"],
      respond: () => {
        let heritageSpots = places.filter((p) => [18, 19, 22, 27, 39, 40, 49, 60].includes(p.id));
        let list = sortByLowestCrowd(heritageSpots.length ? heritageSpots : pickByCategory("Plains", 3)).slice(0, 3);
        return "For rich heritage, centuries-old forts, and ancient temple architecture, consider visiting " + formatPlaceNames(list) + ".";
      },
    },
    {
      keywords: ["nightlife", "party", "clubs", "night out", "evening vibe", "clubbing"],
      respond: () => {
        let partySpots = places.filter((p) => [63, 24, 21, 5, 41].includes(p.id));
        let list = partySpots.length ? partySpots.slice(0, 3) : pickByCategory("Beach", 2);
        return "For lively nightlife, beach shacks, and evening entertainment, " + formatPlaceNames(list) + " are the top destinations.";
      },
    },
    {
      keywords: ["road trip", "driving", "self-drive", "drive", "scenic drive", "roadtrip"],
      respond: () => {
        let roadSpots = places.filter((p) => [1, 4, 14, 25, 34, 44].includes(p.id));
        let list = sortByLowestCrowd(roadSpots.length ? roadSpots : pickByCategory("Hill Station", 3)).slice(0, 3);
        return "For unforgettable road trips and scenic highway routes, destinations like " + formatPlaceNames(list) + " provide thrilling drives.";
      },
    },
  ];
}

const ASSISTANT_FALLBACK =
  'I couldn\'t match that to anything in my list yet. Try asking things like "somewhere cold", "quiet beaches", "budget hill stations", or "places in South India".';

function matchAssistantIntent(userQuestion, intents) {
  let q = userQuestion.toLowerCase();
  let best = null;
  let bestScore = 0;

  intents.forEach((intent) => {
    let score = intent.keywords.filter((kw) => q.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  });

  return best;
}

async function askTripAssistant(userQuestion, places) {
  await new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 350));

  let intents = buildIntents(places);
  let intent = matchAssistantIntent(userQuestion, intents);
  if (!intent) return ASSISTANT_FALLBACK;

  try {
    return intent.respond();
  } catch (e) {
    return ASSISTANT_FALLBACK;
  }
}

/* ---------------- 3. APP CONTEXT ---------------- */

const PLANNED_VISITS_KEY = "tripwise_planned_visits";
const PLANNED_VISITS_SEEDED_KEY = "tripwise_planned_visits_seeded";
const VISITED_PLACES_KEY = "tripwise_visited_places";
const HOTEL_REVIEWS_KEY = "tripwise_hotel_reviews";
const CURRENT_USER_KEY = "tripwise_current_user";
const USERS_KEY = "tripwise_users";

// Default pre-seeded login accounts (including asd123@gmail.com and rajvansh@tripwise.com)
const SEEDED_DEFAULT_USERS = [
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
const DEFAULT_HOTEL_REVIEWS = [
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

const AppContext = createContext(null);

function seedDefaultUser() {
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
function randomizePlaceCrowds(placesList) {
  return placesList.map((p) => {
    const ratio = 0.2 + Math.random() * 0.75;
    const visitors = Math.max(1, Math.min(p.maxVisitors, Math.round(p.maxVisitors * ratio)));
    return {
      ...p,
      currentVisitors: visitors,
    };
  });
}

function loadInitialPlaces() {
  // Clear any legacy saved visitor count so crowds re-randomize fresh
  try {
    localStorage.removeItem("tripwise_visitor_counts");
  } catch (e) {
    /* ignore */
  }
  return randomizePlaceCrowds(initialPlaces);
}

function loadPlannedVisits() {
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

const VISITED_TRIPS_KEY = "tripwise_visited_trips";

function loadVisitedTrips() {
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

function loadVisitedPlaces() {
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

function loadHotelReviews() {
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

function loadCurrentUser() {
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

const SETTINGS_KEY = "tripwise_settings";

const DEFAULT_SETTINGS = {
  theme: "light", // "light" | "dark"
  crowdAlerts: true,
  tripReminders: true,
  dealAlerts: false,
  currency: "INR", // "INR" | "USD" | "EUR" | "GBP"
  tempUnit: "C", // "C" | "F"
  defaultTravelMode: "Car", // "Car" | "Train" | "Flight" | "Bus"
  defaultBudget: "Mid-Range", // "Budget" | "Mid-Range" | "Luxury"
};

function loadSettings() {
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

function getCrowdLevel(place) {
  let percent = (place.currentVisitors / place.maxVisitors) * 100;
  if (percent >= 90) return "high";
  if (percent >= 50) return "medium";
  return "low";
}

function getCrowdLabel(level) {
  if (level === "high") return "High";
  if (level === "medium") return "Medium";
  return "Low";
}

function AppProvider({ children }) {
  const [places, setPlaces] = useState(() => loadInitialPlaces());
  const [plannedVisits, setPlannedVisits] = useState(() => loadPlannedVisits());
  const [visitedTrips, setVisitedTrips] = useState(() => loadVisitedTrips());
  const [visitedPlaces, setVisitedPlaces] = useState(() => loadVisitedPlaces());
  const [hotelReviews, setHotelReviews] = useState(() => loadHotelReviews());
  const [currentUser, setCurrentUserState] = useState(() => loadCurrentUser());
  const [settings, setSettingsState] = useState(() => loadSettings());

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

  const planVisit = useCallback((placeId, extraDetails = {}) => {
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
    }

    return !!plannedPlace;
  }, []);

  const removeVisit = useCallback((index) => {
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
      }
      let next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  const markAsVisited = useCallback(
    (placeId, fromPlannedIndex = null) => {
      const targetPlace = places.find((p) => p.id === placeId);
      if (!targetPlace) return;

      const userEmail = currentUser ? currentUser.email : "guest";

      setVisitedPlaces((prev) => {
        const exists = prev.some(
          (v) => v.placeId === placeId && (v.userEmail === userEmail || !v.userEmail)
        );
        if (exists) return prev;
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
    [places, currentUser]
  );

  const removeVisitedPlace = useCallback(
    (placeId) => {
      const userEmail = currentUser ? currentUser.email : "guest";
      setVisitedPlaces((prev) =>
        prev.filter((v) => !(v.placeId === placeId && (v.userEmail === userEmail || !v.userEmail)))
      );
    },
    [currentUser]
  );

  const addHotelReview = useCallback(
    ({ placeId, hotelName, rating, text }) => {
      if (!currentUser) {
        return { ok: false, error: "Please log in to submit a review." };
      }
      if (!rating || rating < 1) {
        return { ok: false, error: "Please select a star rating." };
      }
      if (!text || text.trim() === "") {
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
      return { ok: true };
    },
    [currentUser]
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
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUserState(null);
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
  };

  const value = {
    places,
    plannedVisits,
    visitedTrips,
    visitedPlaces,
    hotelReviews,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}

/* ---------------- 4. COMPONENTS ---------------- */

function Navbar({ extraLink }) {
  const { currentUser, logout, deleteAccount, settings, updateSettings, visitedPlaces, visitedTrips, places } = useApp();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [dropdownView, setDropdownView] = useState("main"); // "main" | "visited"
  const dropdownRef = useRef(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
    setDropdownView("main");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    setAccountMenuOpen(false);
    setDropdownView("main");
    navigate("/");
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
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

  return (
    <nav className="mainNavbar">
      <Link to="/" className="brandLogo">
        <svg
          className="brandLogoIcon"
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="14" stroke="#FFFBEB" strokeWidth="2" strokeOpacity="0.85" strokeDasharray="3 3" />
          <path d="M16 5C11.58 5 8 8.58 8 13C8 18.25 16 27 16 27C16 27 24 18.25 24 13C24 8.58 20.42 5 16 5Z" fill="#FFFBEB" />
          <circle cx="16" cy="13" r="3.5" fill="#0F766E" />
          <polygon points="16,7.5 18.5,13 16,12 13.5,13" fill="#F4A11E" />
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

      <div className="navLinks">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        {currentUser && <Link to="/my-trips">My Trips</Link>}
        {extraLink && <a onClick={extraLink.onClick}>{extraLink.label}</a>}

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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ display: "block" }}
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>
              {accountMenuOpen && (
                <div
                  className={`accountDropdown open ${dropdownView === "visited" ? "dropdownVisitedPanel" : ""}`}
                  id="accountDropdown"
                >
                  {dropdownView === "main" ? (
                    <>
                      <div className="dropdownInfoBlock">
                        <div className="dropdownInfoLabel">My Info</div>
                        <div className="dropdownInfoName">{currentUser.name}</div>
                        <div className="dropdownInfoEmail">{currentUser.email}</div>
                      </div>

                      <button
                        type="button"
                        className="dropdownItem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate("/my-trips");
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🎒</span>
                          <span>Previous Trips</span>
                        </span>
                        <span className="visitedBadgeCount">{DEFAULT_PREVIOUS_TRIPS.length}</span>
                      </button>

                      <button
                        type="button"
                        className="dropdownItem"
                        onClick={() => setDropdownView("visited")}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>📍</span>
                          <span>Visited Places</span>
                        </span>
                        <span className="visitedBadgeCount">{userVisited.length}</span>
                      </button>

                      <div className="dropdownSectionLabel">Settings</div>
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
                        <span>Delete Account</span>
                        <span>🗑️</span>
                      </button>
                      <button type="button" className="dropdownItem logout" onClick={handleLogout}>
                        <span>Log Out</span>
                        <span>↪</span>
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
                          <span>📍 Visited</span>
                          <span className="visitedBadgeCount">{userVisited.length}</span>
                        </span>
                        <button
                          type="button"
                          className="dropdownBackBtn"
                          style={{ padding: "2px 6px", fontSize: "12px" }}
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setDropdownView("main");
                          }}
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
              <Link to="/login" className="navSignupBtn">
                Log In
              </Link>{" "}
              <Link to="/signup" className="navSignupBtn">
                Sign Up
              </Link>
            </>
          )}
        </span>
      </div>
    </nav>
  );
}

function PlaceCard({ place, onView }) {
  const [imgError, setImgError] = useState(false);
  const level = getCrowdLevel(place);
  const percent = Math.min(100, Math.round((place.currentVisitors / place.maxVisitors) * 100));

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

function HotelCard({ hotel, onViewDestination }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="hotelCard" onClick={() => onViewDestination(hotel.destinationId)}>
      <div className="hotelCardArt">
        {hotel.badge && <span className="hotelBadge">{hotel.badge}</span>}
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
        <div className="hotelLocationTag">
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
              onViewDestination(hotel.destinationId);
            }}
          >
            View Hotel →
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceModal({ placeId, onClose }) {
  const { places, currentUser } = useApp();
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
      navigate(`/plan-trip/${place.id}`);
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

const INITIAL_MESSAGE = {
  sender: "bot",
  text: 'Hi! Tell me what kind of trip you\'re looking for — like "somewhere cold and quiet in June" — and I\'ll suggest a place from the list.',
};

function AssistantWidget({ open, onClose }) {
  const { places } = useApp();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (question === "" || sending) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { sender: "loading", text: "Thinking..." }]);

    try {
      const reply = await askTripAssistant(question, places);
      setMessages((prev) => [...prev.filter((m) => m.sender !== "loading"), { sender: "bot", text: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== "loading"),
        { sender: "bot", text: "Something went wrong reaching the assistant. Please try again." },
      ]);
    }

    setSending(false);
  };

  return (
    <div className={`assistantPanel${open ? " open" : ""}`}>
      <div className="assistantHead">
        <span>TripWise Assistant</span>
        <button className="closeBtn" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="assistantMessages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`assistantMsg ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="assistantInputRow">
        <input
          type="text"
          placeholder="Describe the trip you want..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button disabled={sending} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ---------------- 5. PAGES ---------------- */

const featuredIds = [13, 1, 28, 30, 29, 39];

const featuredHotels = [
  { name: "Sterling Manali", placeName: "Manali", price: "₹3,800/night", rating: 4.5 },
  { name: "Cidade de Goa", placeName: "Goa", price: "₹5,200/night", rating: 4.6 },
];

function Home() {
  const { places } = useApp();
  const [modalPlaceId, setModalPlaceId] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const featuredPlaces = featuredIds.map((id) => places.find((p) => p.id === id)).filter(Boolean);

  return (
    <>
      <Navbar />

      <header className="hero homeHero">
        <div className="eyebrow">India &middot; Live Crowd-Aware Tourism</div>
        <h1>Know before you go — and how crowded it'll be.</h1>
        <p>
          From hill stations to deserts, beaches to forests — check the best season, compare
          hotels, and plan your visit against each spot's daily footfall limit.
        </p>

        <div className="heroBtns" style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
          <Link to="/explore" className="heroPrimary">
            Explore all 63 destinations &rarr;
          </Link>
          <button type="button" className="heroSecondary" onClick={() => setAssistantOpen(true)}>
            💬 Ask TripWise
          </button>
        </div>
      </header>

      <section className="sectionWrap" id="featuredSection">
        <div className="sectionHead">
          <h2>Featured Destinations</h2>
          <div className="count mono">
            <Link to="/explore" className="seeAllLink">
              See all 63 &rarr;
            </Link>
          </div>
        </div>
        <div className="cardGrid" id="featuredGrid">
          {featuredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onView={setModalPlaceId} />
          ))}
        </div>
      </section>

      <section className="sectionWrap hotelsSection" id="hotelsSection">
        <div className="sectionHead">
          <h2>Recommended Hotels</h2>
          <div className="count mono">Handpicked stays across top spots</div>
        </div>
        <div className="hotelGrid">
          {recommendedHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onViewDestination={(destId) => setModalPlaceId(destId)}
            />
          ))}
        </div>
      </section>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>

      {modalPlaceId !== null && (
        <PlaceModal placeId={modalPlaceId} onClose={() => setModalPlaceId(null)} />
      )}

      <button className="assistantToggle" onClick={() => setAssistantOpen(true)}>
        💬 Ask TripWise
      </button>
      <AssistantWidget open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}

function Explore() {
  const { places } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeRegion, setActiveRegion] = useState("All");
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [modalPlaceId, setModalPlaceId] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Pagination states - 2 rows (6 items) by default
  const [visibleDestCount, setVisibleDestCount] = useState(6);
  const [visibleHotelCount, setVisibleHotelCount] = useState(6);

  // Synchronize when query parameter changes
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Reset pagination whenever search term or filters change
  useEffect(() => {
    setVisibleDestCount(6);
    setVisibleHotelCount(6);
  }, [searchTerm, activeCategory, activeRegion]);

  const filtered = useMemo(() => {
    return places.filter((place) => {
      const matchesCategory = activeCategory === "All" || place.category === activeCategory;
      const matchesRegion = activeRegion === "All" || place.region === activeRegion;
      const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [places, activeCategory, activeRegion, searchTerm]);

  const displayedPlaces = useMemo(() => {
    return filtered.slice(0, visibleDestCount);
  }, [filtered, visibleDestCount]);

  const filteredHotels = useMemo(() => {
    return recommendedHotels.filter((hotel) => {
      const matchesCategory = activeCategory === "All" || hotel.category === activeCategory;
      const matchesRegion = activeRegion === "All" || hotel.region === activeRegion;
      const matchesSearch =
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.destinationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesRegion && matchesSearch;
    });
  }, [activeCategory, activeRegion, searchTerm]);

  const displayedHotels = useMemo(() => {
    return filteredHotels.slice(0, visibleHotelCount);
  }, [filteredHotels, visibleHotelCount]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <Navbar extraLink={{ label: "Ask TripWise", onClick: () => setAssistantOpen(true) }} />

      <header className="hero exploreHero">
        <div className="eyebrow">India &middot; Tourism Guide</div>
        <h1>Explore every destination.</h1>
        <p>Search by name, or filter by terrain and region — from the Himalayas to the islands.</p>

        <div className="searchBar">
          <input
            type="text"
            placeholder="Search a place... e.g. Munnar, Jaipur, Manali"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button type="button">Search</button>
        </div>

        <div className="filterRow">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filterChip${cat === activeCategory ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="filterRow regionRow">
          {regions.map((reg) => (
            <button
              key={reg}
              className={`filterChip regionChip${reg === activeRegion ? " active" : ""}`}
              onClick={() => setActiveRegion(reg)}
            >
              {reg}
            </button>
          ))}
        </div>
      </header>

      <section className="sectionWrap exploreCardsSection" id="placesSection">
        <div className="sectionHead">
          <h2>All Destinations</h2>
          <div className="count mono">
            {filtered.length === 0
              ? "0 spots"
              : `Showing ${displayedPlaces.length} of ${filtered.length} spots`}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="emptyState">No places match your search. Try a different name or filter.</div>
        ) : (
          <>
            <div className="cardGrid">
              {displayedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onView={setModalPlaceId} />
              ))}
            </div>

            {visibleDestCount < filtered.length && (
              <div className="showMoreWrap">
                <button
                  type="button"
                  className="showMoreBtn"
                  onClick={() => setVisibleDestCount((prev) => prev + 6)}
                >
                  Show More Destinations ↓
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* RECOMMENDED HOTELS & STAYS SECTION */}
      <section className="sectionWrap hotelsSection" id="exploreHotelsSection">
        <div className="sectionHead">
          <h2>Recommended Hotels & Stays</h2>
          <div className="count mono">
            {filteredHotels.length === 0
              ? "0 stays"
              : `Showing ${displayedHotels.length} of ${filteredHotels.length} stays`}
          </div>
        </div>
        {filteredHotels.length === 0 ? (
          <div className="emptyState">No hotels match your current search or filter.</div>
        ) : (
          <>
            <div className="hotelGrid">
              {displayedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onViewDestination={(destId) => setModalPlaceId(destId)}
                />
              ))}
            </div>

            {visibleHotelCount < filteredHotels.length && (
              <div className="showMoreWrap">
                <button
                  type="button"
                  className="showMoreBtn"
                  onClick={() => setVisibleHotelCount((prev) => prev + 6)}
                >
                  Show More Hotels ↓
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>

      {modalPlaceId !== null && (
        <PlaceModal placeId={modalPlaceId} onClose={() => setModalPlaceId(null)} />
      )}

      <button className="assistantToggle" onClick={() => setAssistantOpen(true)}>
        💬 Ask TripWise
      </button>
      <AssistantWidget open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}

function HotelReviewItem({ hotel, placeId }) {
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

function MyTrips() {
  const {
    places,
    visitedPlaces,
    markAsVisited,
    removeVisitedPlace,
    currentUser,
  } = useApp();
  const [selectedPlaceToAdd, setSelectedPlaceToAdd] = useState("");

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="authWrap">
          <div className="authPromptCard">
            <div className="eyebrow" style={{ color: "var(--clay)" }}>Your Travel Journey</div>
            <h2>Log in to see your trips</h2>
            <p>
              Sign in to view destinations you've visited, access your hotel stays & receipts,
              and share reviews for hotels you've stayed at.
            </p>
            <Link to="/login" className="heroExploreBtn">
              Log In to TripWise
            </Link>
          </div>
        </div>
        <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
      </>
    );
  }

  // Filter visited places for current user
  const userVisited = visitedPlaces.filter(
    (v) => v.userEmail === currentUser.email || !v.userEmail
  );

  const previousTrips = DEFAULT_PREVIOUS_TRIPS;
  const totalExpenditure = previousTrips.reduce((acc, t) => acc + (t.totalPaid || 0), 0);

  const handleAddVisited = (e) => {
    e.preventDefault();
    if (!selectedPlaceToAdd) return;
    markAsVisited(Number(selectedPlaceToAdd));
    setSelectedPlaceToAdd("");
  };

  return (
    <>
      <Navbar />

      <header className="hero myTripsHero">
        <div className="eyebrow">Personal Travel Log</div>
        <h1>My Trips, Bookings & Receipts</h1>
        <p>Review completed itineraries, hotel stays, verified reviews, and official itemized receipts.</p>
      </header>

      <main className="myTripsWrap">
        {/* Quick Stats Grid */}
        <div className="genericStatsRow" style={{ marginBottom: "32px" }}>
          <div className="genericStatBox">
            <div className="genericStatNumber">{previousTrips.length}</div>
            <div className="genericStatLabel">Completed Trips</div>
          </div>
          <div className="genericStatBox">
            <div className="genericStatNumber">₹{totalExpenditure.toLocaleString()}</div>
            <div className="genericStatLabel">Total Spent</div>
          </div>
          <div className="genericStatBox">
            <div className="genericStatNumber">{userVisited.length}</div>
            <div className="genericStatLabel">Visited Places</div>
          </div>
        </div>

        {/* 1. COMPLETED TRIPS WITH HOTEL, REVIEWS & EXPANDABLE RECEIPTS */}
        <div className="sectionHead">
          <h2>Past Travel & Bookings</h2>
          <div className="count mono">{previousTrips.length} completed trips</div>
        </div>

        <div className="tripsList" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
          {previousTrips.map((trip) => (
            <PreviousTripCard key={trip.id} trip={trip} currentUser={currentUser} />
          ))}
        </div>

        {/* 2. VISITED DESTINATIONS & HOTEL REVIEWS */}
        <div className="sectionHead">
          <h2>Visited Destinations & Reviews</h2>
          <div className="count mono">{userVisited.length} places logged</div>
        </div>

        <form className="quickAddVisitRow" onSubmit={handleAddVisited}>
          <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--forest-dark)" }}>
            + Log a Visited Place:
          </span>
          <select
            className="quickAddSelect"
            value={selectedPlaceToAdd}
            onChange={(e) => setSelectedPlaceToAdd(e.target.value)}
          >
            <option value="">Select a destination you have visited...</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.region} &middot; {p.category})
              </option>
            ))}
          </select>
          <button type="submit" className="markVisitedBtn" disabled={!selectedPlaceToAdd}>
            Add to Visited
          </button>
        </form>

        {userVisited.length === 0 ? (
          <div className="emptyState" style={{ marginBottom: "40px" }}>
            You haven't marked any destinations as visited yet. Select a destination above to log your journey!
          </div>
        ) : (
          userVisited.map((v) => {
            const place = places.find((p) => p.id === v.placeId);
            if (!place) return null;
            return (
              <div className="visitedPlaceCard" key={v.placeId}>
                <div className="visitedPlaceHeader">
                  <div className="visitedPlaceThumb" style={{ background: place.artColor }}>
                    {place.image ? (
                      <img src={place.image} alt={place.name} />
                    ) : (
                      <span>{place.icon}</span>
                    )}
                  </div>
                  <div className="visitedPlaceInfo">
                    <h3>{place.name}</h3>
                    <div className="visitedPlaceMeta">
                      <span className="visitedBadge">✓ Visited on {v.dateVisited || "Recent"}</span>
                      <span>{place.region} &middot; {place.category}</span>
                      <span>Best Time: {place.bestTime}</span>
                    </div>
                  </div>
                  <button
                    className="removeBtn"
                    onClick={() => removeVisitedPlace(place.id)}
                    title="Remove from visited"
                  >
                    Remove
                  </button>
                </div>

                <div className="hotelsReviewContainer">
                  <h4>Nearby Hotels & Reviews</h4>
                  {place.hotels.map((hotel, idx) => (
                    <HotelReviewItem key={idx} hotel={hotel} placeId={place.id} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
    </>
  );
}

function PreviousTripCard({ trip, currentUser }) {
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

function Account() {
  const { currentUser, settings, updateSettings, updateProfile, logout, visitedPlaces } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trips"); // "trips" | "profile" | "settings" | "security"
  const [toastMsg, setToastMsg] = useState("");

  // Profile form state
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 7876604227");
  const [location, setLocation] = useState(currentUser?.location || "Chitkara University, Punjab");

  // Password change state
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passFeedback, setPassFeedback] = useState({ type: "", text: "" });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), phone: phone.trim(), location: location.trim() });
    showToast("Profile details updated successfully! ✓");
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

function PlanTrip() {
  const { places, planVisit, currentUser } = useApp();
  const { placeId } = useParams();
  const [searchParams] = useSearchParams();

  // Find pre-selected place
  const initialPlaceId = placeId ? Number(placeId) : (places.length > 0 ? places[0].id : 1);
  const [selectedPlaceId, setSelectedPlaceId] = useState(initialPlaceId);
  const [travelMode, setTravelMode] = useState("Car");
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [budgetPreset, setBudgetPreset] = useState("Mid-Range");
  const [budgetAmount, setBudgetAmount] = useState("15000");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedPlace = places.find((p) => p.id === Number(selectedPlaceId)) || places[0];

  const travelModes = [
    { id: "Car", label: "Car / Drive", icon: "🚗" },
    { id: "Train", label: "Train / Rail", icon: "🚆" },
    { id: "Flight", label: "Flight", icon: "✈️" },
    { id: "Bus", label: "Bus / Coach", icon: "🚌" },
  ];

  const budgetOptions = [
    { id: "Budget", label: "Budget (~₹5,000)", amount: "5000" },
    { id: "Mid-Range", label: "Mid-Range (~₹15,000)", amount: "15000" },
    { id: "Luxury", label: "Luxury (~₹35,000)", amount: "35000" },
  ];

  const handleBudgetPreset = (opt) => {
    setBudgetPreset(opt.id);
    setBudgetAmount(opt.amount);
  };

  const handleCustomBudgetChange = (val) => {
    setBudgetAmount(val);
    const match = budgetOptions.find((o) => o.amount === val);
    setBudgetPreset(match ? match.id : "Custom");
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="authWrap">
          <div className="authPromptCard">
            <div className="eyebrow" style={{ color: "var(--clay)" }}>Plan Your Trip</div>
            <h2>Please log in to plan a visit</h2>
            <p>You need an active TripWise account to customize your travel mode, lock in your dates, and plan trips.</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to={`/signup?redirect=plan&placeId=${selectedPlaceId}`} className="heroExploreBtn">
                Sign Up First
              </Link>
              <Link to={`/login?redirect=plan&placeId=${selectedPlaceId}`} className="viewBtn" style={{ padding: "12px 24px", fontSize: "14px", textDecoration: "none" }}>
                Log In
              </Link>
            </div>
          </div>
        </div>
        <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
      </>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPlace) return;

    const formattedBudget = `₹${Number(budgetAmount || 15000).toLocaleString()}`;
    const formattedDate = new Date(travelDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const ok = planVisit(selectedPlace.id, {
      travelMode,
      travelDate: formattedDate,
      budget: `${formattedBudget} (${budgetPreset})`,
    });

    if (ok) {
      setSuccessMsg(`Trip to ${selectedPlace.name} confirmed for ${formattedDate}!`);
    }
  };

  return (
    <>
      <Navbar />

      <header className="hero planTripHero">
        <div className="eyebrow">Trip Planning & Itinerary</div>
        <h1>Plan Your Trip</h1>
        <p>Customize your travel mode, pick your dates, and set your budget to plan the perfect getaway.</p>
      </header>

      <main className="planTripWrap">
        {successMsg ? (
          <div className="planTripCard" style={{ textAlign: "center", padding: "48px 32px" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
            <div className="planSuccessBox">{successMsg}</div>
            <p style={{ color: "#6b6353", fontSize: "15px", marginBottom: "28px" }}>
              Your visit has been successfully reserved in your TripWise schedule.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/explore" className="viewBtn" style={{ padding: "12px 24px", fontSize: "14px", textDecoration: "none" }}>
                Explore More Spots
              </Link>
              <Link to="/account" className="heroExploreBtn" style={{ padding: "12px 24px", fontSize: "14px", textDecoration: "none" }}>
                Go to My Account →
              </Link>
            </div>
          </div>
        ) : (
          <form className="planTripCard" onSubmit={handleSubmit}>
            <div className="planFormGroup">
              <label className="planFormLabel">1. Which place do you want to visit?</label>
              <select
                className="planSelect"
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(Number(e.target.value))}
              >
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.region} ({p.category})
                  </option>
                ))}
              </select>

              {selectedPlace && (
                <div className="placePreviewMini">
                  <div className="placePreviewMiniThumb" style={{ background: selectedPlace.artColor }}>
                    {selectedPlace.image ? (
                      <img src={selectedPlace.image} alt={selectedPlace.name} />
                    ) : (
                      <span>{selectedPlace.icon}</span>
                    )}
                  </div>
                  <div className="placePreviewMiniInfo">
                    <h4>{selectedPlace.name} ({selectedPlace.region} &middot; {selectedPlace.category})</h4>
                    <span>📅 Best Time: {selectedPlace.bestTime} &middot; 🌡️ Weather: {selectedPlace.weather}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="planFormGroup">
              <label className="planFormLabel">2. How will you be traveling?</label>
              <div className="travelModeGrid">
                {travelModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`travelModeChip${travelMode === mode.id ? " active" : ""}`}
                    onClick={() => setTravelMode(mode.id)}
                  >
                    <span className="modeIcon">{mode.icon}</span>
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="planFormGroup">
              <label className="planFormLabel">3. When do you want to travel?</label>
              <input
                type="date"
                className="planDateInput"
                value={travelDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                required
              />
            </div>

            <div className="planFormGroup">
              <label className="planFormLabel">4. What's your estimated budget?</label>
              <div className="budgetPresets">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`budgetChip${budgetPreset === opt.id ? " active" : ""}`}
                    onClick={() => handleBudgetPreset(opt)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                className="planCustomBudgetInput"
                placeholder="Enter custom budget in ₹ (e.g. 15000)"
                value={budgetAmount}
                min="500"
                step="500"
                onChange={(e) => handleCustomBudgetChange(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="planConfirmBtn">
              Confirm Plan →
            </button>
          </form>
        )}
      </main>

      <footer>Built as a university project — crowd numbers are simulated for demo purposes.</footer>
    </>
  );
}

function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectMode = searchParams.get("redirect");
  const redirectPlaceId = searchParams.get("placeId");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (email.trim() === "" || password === "") {
      setError("Please enter both email and password.");
      return;
    }

    const result = login({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (redirectMode === "plan" && redirectPlaceId) {
      navigate(`/plan-trip/${redirectPlaceId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />

      <div className="authWrap">
        <div className="authCard">
          <div className="eyebrow">Welcome back</div>
          <h2>Log in to TripWise</h2>
          <p className="authSub">Access your planned visits, visited places, and hotel reviews.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="loginEmail">Email</label>
            <input
              type="email"
              id="loginEmail"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="authError">{error}</div>

            <button type="submit" className="authSubmitBtn">
              Log In
            </button>
          </form>

          <p className="authSwitch">
            Don't have an account? <Link to={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}>Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function Signup() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectMode = searchParams.get("redirect");
  const redirectPlaceId = searchParams.get("placeId");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (name.trim() === "" || email.trim() === "" || password === "") {
      setError("Please fill in every field.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    const result = signup({ name: name.trim(), email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (redirectMode === "plan" && redirectPlaceId) {
      navigate(`/plan-trip/${redirectPlaceId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />

      <div className="authWrap">
        <div className="authCard">
          <div className="eyebrow">New here?</div>
          <h2>Create your TripWise account</h2>
          <p className="authSub">Save your planned visits and get personalized trip suggestions.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="signupName">Full Name</label>
            <input
              type="text"
              id="signupName"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label htmlFor="signupEmail">Email</label>
            <input
              type="email"
              id="signupEmail"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="signupPassword">Password</label>
            <input
              type="password"
              id="signupPassword"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="authError">{error}</div>

            <button type="submit" className="authSubmitBtn">
              Sign Up
            </button>
          </form>

          <p className="authSwitch">
            Already have an account? <Link to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}>Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------------- 6. APP + RENDER ---------------- */

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/plan-trip" element={<PlanTrip />} />
          <Route path="/plan-trip/:placeId" element={<PlanTrip />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/account" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
