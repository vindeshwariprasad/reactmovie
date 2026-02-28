import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = import.meta.env.VITE_APP_TMDB_TOKEN;

if (!TMDB_TOKEN) {
    throw new Error(
        "Missing TMDB API token. Set VITE_APP_TMDB_TOKEN in your .env file."
    );
}

const headers = {
    Authorization: "bearer " + TMDB_TOKEN,
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchdatafromapi = async (url, params) => {
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const { data } = await axios.get(BASE_URL + url, {
                headers,
                params,
            });
            return data;
        } catch (error) {
            lastError = error;
            const status = error.response?.status;
            // Don't retry on client errors (4xx) except 429 (rate limit)
            if (status && status >= 400 && status < 500 && status !== 429) {
                throw error;
            }
            if (attempt < MAX_RETRIES) {
                await wait(RETRY_DELAY * (attempt + 1));
            }
        }
    }
    throw lastError;
};