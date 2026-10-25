import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";

export default function Login() {
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