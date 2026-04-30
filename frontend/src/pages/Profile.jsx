import { useEffect, useState } from "react";
import { Button, Card, PageShell, SectionHeader } from "../ui";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [goal, setGoal] = useState(user?.goal || "");
  const [height, setHeight] = useState(user?.height ?? "");
  const [weight, setWeight] = useState(user?.weight ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    user?.experienceLevel || "",
  );
  const [units, setUnits] = useState(user?.units || "metric");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    streak: 0,
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({
    type: "idle",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  function validateProfile() {
    const nextErrors = {};
    const phoneValue = phone.trim();

    if (phoneValue && !/^[+\d][\d\s().-]{7,20}$/.test(phoneValue)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (height !== "") {
      const heightValue = Number(height);
      const minHeight = units === "imperial" ? 20 : 50;
      const maxHeight = units === "imperial" ? 100 : 250;
      if (
        Number.isNaN(heightValue) ||
        heightValue < minHeight ||
        heightValue > maxHeight
      ) {
        nextErrors.height = `Height must be between ${minHeight} and ${maxHeight}.`;
      }
    }

    if (weight !== "") {
      const weightValue = Number(weight);
      const minWeight = units === "imperial" ? 50 : 20;
      const maxWeight = units === "imperial" ? 700 : 300;
      if (
        Number.isNaN(weightValue) ||
        weightValue < minWeight ||
        weightValue > maxWeight
      ) {
        nextErrors.weight = `Weight must be between ${minWeight} and ${maxWeight}.`;
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setName(data.name || "");
        setFullName(data.fullName || "");
        setPhone(data.phone || "");
        setGoal(data.goal || "");
        setHeight(data.height ?? "");
        setWeight(data.weight ?? "");
        setExperienceLevel(data.experienceLevel || "");
        setUnits(data.units || "metric");
        setEmail(data.email || "");
        setAvatarUrl(data.avatarUrl || "");
        if (data.stats) {
          setStats(data.stats);
        }
        updateUser(data);
      } catch (error) {
        setStatus({ type: "error", message: "Unable to load profile." });
      }
    }

    loadProfile();
  }, [token, updateUser]);

  async function handleSave(event) {
    event.preventDefault();
    if (!validateProfile()) {
      setStatus({
        type: "error",
        message: "Fix validation errors before saving.",
      });
      return;
    }
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          fullName,
          phone,
          goal,
          height: height === "" ? null : Number(height),
          weight: weight === "" ? null : Number(weight),
          experienceLevel,
          units,
          avatarUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      updateUser(data);
      setStatus({ type: "success", message: "Profile updated." });
    } catch (error) {
      const message = error?.message || "Update failed.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarFile(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setPasswordStatus({ type: "idle", message: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/profile/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Password update failed");
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStatus({ type: "success", message: "Password updated." });
    } catch (error) {
      setPasswordStatus({
        type: "error",
        message: error.message || "Update failed.",
      });
    }
  }

  return (
    <PageShell maxWidth="900px" style={{ paddingTop: "32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)" }}>
        <Card variant="panel" padding="28px" style={{ width: "100%" }}>
          <SectionHeader title="Profile" />
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
            Manage your account details.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "16px",
              marginTop: "20px",
            }}
          >
            <Card
              variant="surface"
              padding="18px"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: avatarUrl
                    ? `url(${avatarUrl}) center/cover`
                    : "linear-gradient(135deg, rgba(157, 255, 87, 0.25), rgba(51, 246, 255, 0.2))",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {!avatarUrl &&
                  (name || email || "U").trim().charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>
                  {name || "Unnamed athlete"}
                </div>
                <div
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  {email}
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "10px",
                    padding: "3px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                    display: "inline-flex",
                  }}
                >
                  Active member
                </div>
              </div>
            </Card>

            <Card variant="surface" padding="18px">
              <SectionHeader title="Activity" />
              <div
                style={{
                  marginTop: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "10px",
                }}
              >
                {[
                  { label: "Workouts", value: stats.totalWorkouts },
                  { label: "Calories", value: stats.totalCalories },
                  { label: "Duration (sec)", value: stats.totalDuration },
                  {
                    label: "Streak",
                    value: `${stats.streak} day${stats.streak === 1 ? "" : "s"}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 600 }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <form
              onSubmit={handleSave}
              style={{ display: "grid", gap: "12px" }}
            >
              <div>
                <label
                  htmlFor="profile-avatar"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Avatar image
                </label>
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "6px",
                  }}
                >
                  Upload a square image for best results.
                </div>
              </div>
              <div>
                <label
                  htmlFor="profile-full-name"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Full name
                </label>
                <input
                  id="profile-full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
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
                  htmlFor="profile-name"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Display name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
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
                  htmlFor="profile-phone"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Phone
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+1 555 123 4567"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "var(--text)",
                  }}
                />
                {fieldErrors.phone && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#f87171",
                      marginTop: "4px",
                    }}
                  >
                    {fieldErrors.phone}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="profile-email"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(8, 12, 14, 0.5)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-goal"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Goal
                </label>
                <select
                  id="profile-goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "var(--text)",
                  }}
                >
                  <option value="">Select goal</option>
                  <option value="fat_loss">Fat loss</option>
                  <option value="strength">Strength</option>
                  <option value="mobility">Mobility</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="profile-experience"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Experience level
                </label>
                <select
                  id="profile-experience"
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "var(--text)",
                  }}
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="profile-units"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Units
                </label>
                <select
                  id="profile-units"
                  value={units}
                  onChange={(event) => setUnits(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "var(--text)",
                  }}
                >
                  <option value="metric">Metric (cm, kg)</option>
                  <option value="imperial">Imperial (in, lb)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="profile-height"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Height ({units === "imperial" ? "in" : "cm"})
                </label>
                <input
                  id="profile-height"
                  type="number"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  placeholder={units === "imperial" ? "70" : "175"}
                  min={units === "imperial" ? 20 : 50}
                  max={units === "imperial" ? 100 : 250}
                  step="0.1"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "var(--text)",
                  }}
                />
                {fieldErrors.height && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#f87171",
                      marginTop: "4px",
                    }}
                  >
                    {fieldErrors.height}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="profile-weight"
                  style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                >
                  Weight ({units === "imperial" ? "lb" : "kg"})
                </label>
                <input
                  id="profile-weight"
                  type="number"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder={units === "imperial" ? "165" : "75"}
                  min={units === "imperial" ? 50 : 20}
                  max={units === "imperial" ? 700 : 300}
                  step="0.1"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(8, 12, 14, 0.8)",
                    color: "var(--text)",
                  }}
                />
                {fieldErrors.weight && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#f87171",
                      marginTop: "4px",
                    }}
                  >
                    {fieldErrors.weight}
                  </div>
                )}
              </div>

              {status.message && (
                <div
                  style={{
                    fontSize: "12px",
                    color:
                      status.type === "success" ? "var(--accent)" : "#f87171",
                  }}
                >
                  {status.message}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>

            <Card variant="surface" padding="18px">
              <SectionHeader title="Change password" />
              <form
                onSubmit={handlePasswordChange}
                style={{ display: "grid", gap: "12px", marginTop: "12px" }}
              >
                <div>
                  <label
                    htmlFor="current-password"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                  >
                    Current password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(event) =>
                      setPasswords((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
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
                    htmlFor="new-password"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                  >
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(event) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
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
                    htmlFor="confirm-password"
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(event) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
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

                {passwordStatus.message && (
                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        passwordStatus.type === "success"
                          ? "var(--accent)"
                          : "#f87171",
                    }}
                  >
                    {passwordStatus.message}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="primary" size="lg" type="submit">
                    Update password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
