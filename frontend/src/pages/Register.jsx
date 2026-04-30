import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, PageShell, SectionHeader } from "../ui";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell maxWidth="520px" style={{ paddingTop: "40px" }}>
      <Card variant="panel" padding="26px" style={{ width: "100%" }}>
        <SectionHeader title="Create account" />
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "12px",
            marginTop: "6px",
          }}
        >
          Sign up to access your dashboard and workout summary.
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
              htmlFor="register-name"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
            >
              Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              htmlFor="register-email"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
            >
              Email
            </label>
            <input
              id="register-email"
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
              htmlFor="register-password"
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
            >
              Password
            </label>
            <input
              id="register-password"
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
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>

        <div
          style={{
            marginTop: "16px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-2)" }}>
            Sign in
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
