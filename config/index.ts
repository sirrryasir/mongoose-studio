
export const CONFIG = {
    // Unique ports to avoid conflicts with user's running apps
    API_PORT: 5555,  // Logic/API layer
    UI_PORT: 5556,   // Web Interface

    // Default MongoDB URI (for local dev if .env missing)
    MONGO_URI_DEFAULT: "mongodb://localhost:27017/test",

    // Feature flags
    IS_DEV: process.env.NODE_ENV !== "production",
};
