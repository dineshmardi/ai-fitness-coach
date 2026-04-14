import { useEffect, useState } from "react";
import { getWorkoutSessions } from "../api/workoutApi";
//recharts
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";

export default function Dashboard() {

    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {

        async function loadData() {
            const data = await getWorkoutSessions();
            setWorkouts(data);
        }

        loadData();

    }, []);

    const totalWorkouts = workouts.length;

    const totalCalories = workouts.reduce(
        (sum, w) => sum + (w.totalCalories || 0),
        0
    );

    const totalDuration = workouts.reduce(
        (sum, w) => sum + (w.totalDuration || 0),
        0
    );

    const exerciseCounts = {};

    workouts.forEach((w) => {
        const type = w.exercises?.[0]?.type;

        if (!type) return;

        exerciseCounts[type] = (exerciseCounts[type] || 0) + 1;
    });

    const chartData = Object.keys(exerciseCounts).map((key) => ({
        name: key,
        value: exerciseCounts[key]
    }));

    const COLORS = ["#4ade80", "#60a5fa", "#facc15"];

    return (

        <div
            style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "30px",
                textAlign: "center"
            }}
        >

            <h1>Workout Dashboard</h1>

            <h2>Total Workouts: {totalWorkouts}</h2>

            <h2>Total Calories Burned: {totalCalories}</h2>

            <h2>Total Duration: {totalDuration}s</h2>

            <h3 style={{ marginTop: "30px" }}>Workout History</h3>

            <ul style={{ textAlign: "left" }}>
                {workouts.slice(0, 10).map((w) => (

                    <li key={w._id}>
                        {w.exercises?.[0]?.type} •
                        {w.exercises?.[0]?.reps} reps •
                        {w.totalDuration}s
                    </li>

                ))}
            </ul>

            <h3 style={{ marginTop: "40px" }}>Exercise Distribution</h3>

            <PieChart width={400} height={300}>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>

                <Tooltip />
                <Legend />
            </PieChart>

        </div>

    );

}