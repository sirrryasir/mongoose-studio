
export const CONFIG = {
    // Default Port (Serving both UI and API)
    DEFAULT_PORT: 5555,

    // Default MongoDB URI (for local dev if .env missing)
    MONGO_URI_DEFAULT: "mongodb://localhost:27017/test",

    // Feature flags
    IS_DEV: process.env.NODE_ENV !== "production",
    VERBOSE: false, // Set to true via CLI args
};
