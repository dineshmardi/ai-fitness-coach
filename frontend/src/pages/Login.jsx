import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, PageShell, SectionHeader } from "../ui";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      login(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell maxWidth="520px" style={{ paddingTop: "40px" }}>
      <Card variant="panel" padding="26px" style={{ width: "100%" }}>
        <SectionHeader title="Sign in" />
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "12px",
            marginTop: "6px",
          }}
        >
          Access your dashboard and workout summary.
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>
            <label
              htmlFor="login-email"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(8, 12, 14, 0.8)",
                color: "var(--text)",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(8, 12, 14, 0.8)",
                color: "var(--text)",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#f87171", fontSize: "12px" }}>{error}</div>
          )}

          <Button variant="primary" size="lg" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div
          style={{
            marginTop: "16px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          New here?{" "}
          <Link to="/register" style={{ color: "var(--accent-2)" }}>
            Create an account
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
