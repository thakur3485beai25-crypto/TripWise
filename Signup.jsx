import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";

export default function Signup() {
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