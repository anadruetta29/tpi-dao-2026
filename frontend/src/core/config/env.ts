export const ENV = {
    API_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:8000"),
    STORAGE_SESSION_KEY: "tpi_dao_session"
} as const;
