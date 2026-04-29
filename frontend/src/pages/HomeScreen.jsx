import { Button, Card, PageShell, StatTile } from "../ui";

export default function HomeScreen({
  startManual,
  openBuilder,
  openDashboard,
}) {
  return (
    <PageShell maxWidth="1200px" style={{ overflow: "hidden" }}>
      <style>{`
                @media (max-width: 980px) {
                    .home-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .home-right {
                        order: 2;
                    }
                    .home-hero h1 {
                        font-size: 56px !important;
                    }
                    .home-stats {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
                @media (max-width: 620px) {
                    .home-hero h1 {
                        font-size: 46px !important;
                    }
                    .home-stats {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
      <div
        style={{
          position: "absolute",
          inset: "-80px -40px auto auto",
          width: "420px",
          height: "420px",
          background:
            "radial-gradient(circle, rgba(var(--accent-2-rgb),0.16), transparent 65%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "auto auto -140px -120px",
          width: "520px",
          height: "520px",
          background:
            "radial-gradient(circle, rgba(var(--accent-rgb),0.16), transparent 70%)",
          filter: "blur(70px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "30% -10% auto -10%",
          height: "160px",
          transform: "skewY(-4deg)",
          background:
            "linear-gradient(90deg, rgba(var(--accent-rgb),0.08), rgba(var(--accent-2-rgb),0.04), transparent)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          zIndex: 0,
        }}
      />

      <div
        className="home-grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: "36px",
          alignItems: "stretch",
          padding: "40px 20px 20px",
          zIndex: 1,
        }}
      >
        <div
          className="home-hero"
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "rgba(236,241,243,0.6)",
            }}
          >
            AI Powered Training
          </div>
          <h1
            style={{
              fontSize: "72px",
              lineHeight: 0.9,
              textTransform: "uppercase",
            }}
          >
            Train
            <span style={{ color: "var(--accent)", marginLeft: "12px" }}>
              Sharper
            </span>
            <br />
            Move
            <span style={{ color: "var(--accent-2)", marginLeft: "12px" }}>
              Faster
            </span>
          </h1>
          <p
            style={{
              fontSize: "16px",
              maxWidth: "520px",
              color: "rgba(236,241,243,0.68)",
              margin: 0,
            }}
          >
            Real-time pose coaching, automatic rep tracking, and performance
            breakdowns built for athletes who want instant feedback and zero
            friction.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <Button variant="primary" size="lg" onClick={startManual}>
              Manual Workout
            </Button>
            <Button variant="surface" size="lg" onClick={openBuilder}>
              Guided Builder
            </Button>
            <Button variant="outline" size="lg" onClick={openDashboard}>
              View Dashboard
            </Button>
          </div>

          <div
            className="home-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            {/* <StatTile label="Accuracy" value="98%" />
            <StatTile label="Avg Session" value="24 min" />
            <StatTile label="Programs" value="12" /> */}
          </div>
        </div>

        <Card
          className="home-right"
          variant="panel"
          padding="20px"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "1.6px",
              color: "rgba(236,241,243,0.55)",
            }}
          >
            Quick Start
          </div>
          {[
            {
              title: "Lower Body Blast",
              detail: "12 min · Balance + strength",
            },
            { title: "Core Precision", detail: "10 min · Stability focus" },
            { title: "Upper Power", detail: "15 min · Push + hold" },
          ].map((item) => (
            <Card
              key={item.title}
              variant="surface"
              padding="14px"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                borderRadius: "14px",
              }}
            >
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700 }}>
                  {item.title}
                </div>
                <div
                  style={{ fontSize: "12px", color: "rgba(236,241,243,0.6)" }}
                >
                  {item.detail}
                </div>
              </div>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(157,255,87,0.2), rgba(51,246,255,0.2))",
                  border: "1px solid rgba(157,255,87,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "#9dff57",
                }}
              >
                Go
              </div>
            </Card>
          ))}
          <Card
            variant="outline"
            padding="14px"
            style={{
              marginTop: "auto",
              borderRadius: "14px",
              color: "rgba(236,241,243,0.7)",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            Sync your camera to unlock live form scoring.
          </Card>
        </Card>
      </div>
    </PageShell>
  );
}
