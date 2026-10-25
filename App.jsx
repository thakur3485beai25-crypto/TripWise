import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import MyTrips from "./pages/MyTrips";
import PlanTrip from "./pages/PlanTrip";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Favourites from "./pages/Favourites";
import Toast from "./components/Toast";

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
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/account" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Toast />
      </BrowserRouter>
    </AppProvider>
  );
}

 