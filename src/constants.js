const localAPI = "http://localhost:8080/api";
const cloudAPI = "https://synapticz-backend-go-1037996227658.asia-southeast1.run.app/api";

export const fetchURL = cloudAPI;

export const protectedRoutePrefixes = [
    "/profile",
    "/edit-profile",
    "/history",
    "/test",
    "/admin-dashboard",
    "/create-quizzes",
    "/edit-quiz"
];
