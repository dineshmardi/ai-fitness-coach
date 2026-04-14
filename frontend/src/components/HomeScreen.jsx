export default function HomeScreen({ startManual, openBuilder, openDashboard }) {

    return (

        <div
            style={{
                position: "relative",
                maxWidth: "900px",
                width: "100%"
            }}
        >

            {/* glow background */}

            <div
                style={{
                    position: "absolute",
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle,#4ade80 0%,transparent 70%)",
                    filter: "blur(120px)",
                    opacity: 0.15,
                    top: "-200px",
                    left: "-200px",
                    zIndex: 0
                }}
            />

            <h1
                style={{
                    fontSize: "52px",
                    fontWeight: "700",
                    marginBottom: "40px",
                    letterSpacing: "1px",
                    position: "relative",
                    zIndex: 1
                }}
            >
                AI Fitness Coach
            </h1>

            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    position: "relative",
                    zIndex: 1
                }}
            >

                <button
                    onClick={startManual}
                    style={{
                        padding: "14px 28px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg,#2b2b2b,#1a1a1a)",
                        color: "white",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                    }}
                >
                    Manual Workout
                </button>

                <button
                    onClick={openBuilder}
                    style={{
                        padding: "14px 28px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg,#2b2b2b,#1a1a1a)",
                        color: "white",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                    }}
                >
                    Guided Workout
                </button>

                <button
                    onClick={openDashboard}
                    style={{
                        padding: "14px 28px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg,#2b2b2b,#1a1a1a)",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                    }}
                >
                    Dashboard
                </button>



            </div>

        </div>

    );

}