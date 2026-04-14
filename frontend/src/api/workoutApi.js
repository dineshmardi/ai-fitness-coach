export async function saveWorkoutSession(data) {

    try {

        const response = await fetch("http://localhost:5000/api/save-workout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        console.log("Workout saved:", result);

    } catch (error) {

        console.error("Error saving workout:", error);

    }

}

//getting data back api
export async function getWorkoutSessions() {

    try {

        const response = await fetch("http://localhost:5000/api/workouts");

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("Error fetching workouts:", error);

        return [];

    }

}