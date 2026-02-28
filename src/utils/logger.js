const isDev = import.meta.env.DEV;

const logger = {
    error: (...args) => {
        if (isDev) {
            console.error(...args);
        }
        // In production, send to monitoring service (Sentry, DataDog, etc.)
    },
    warn: (...args) => {
        if (isDev) {
            console.warn(...args);
        }
    },
};

export default logger;
