const TOKEN_KEY = "aiFitnessCoach.authToken";
const API_BASE_URL = import.meta.env.VITE_API_URL;

function getAuthHeader() {
    const token = window.localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function saveWorkoutSession(data) {

    try {

        const response = await fetch(`${API_BASE_URL}/api/save-workout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeader()
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

        const response = await fetch(`${API_BASE_URL}/api/workouts`, {
            headers: {
                ...getAuthHeader()
            }
        });

        if (response.status === 401) {
            const error = new Error("Unauthorized");
            error.status = 401;
            throw error;
        }

        if (!response.ok) {
            const error = new Error("Failed to fetch workouts");
            error.status = response.status;
            throw error;
        }

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("Error fetching workouts:", error);

        throw error;

    }

}