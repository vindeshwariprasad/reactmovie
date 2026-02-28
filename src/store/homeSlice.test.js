import { describe, it, expect } from "vitest";
import homeSliceReducer, { getApiConfiguration, getGenres } from "./homeSlice";

describe("homeSlice", () => {
    const initialState = {
        url: {},
        genres: {},
    };

    it("should return the initial state", () => {
        expect(homeSliceReducer(undefined, { type: "unknown" })).toEqual(
            initialState
        );
    });

    it("should handle getApiConfiguration", () => {
        const urlPayload = {
            backdrop: "https://image.tmdb.org/t/p/original",
            poster: "https://image.tmdb.org/t/p/original",
            profile: "https://image.tmdb.org/t/p/original",
        };

        const state = homeSliceReducer(initialState, getApiConfiguration(urlPayload));

        expect(state.url).toEqual(urlPayload);
        expect(state.genres).toEqual({});
    });

    it("should handle getGenres", () => {
        const genresPayload = {
            28: { id: 28, name: "Action" },
            35: { id: 35, name: "Comedy" },
        };

        const state = homeSliceReducer(initialState, getGenres(genresPayload));

        expect(state.genres).toEqual(genresPayload);
        expect(state.url).toEqual({});
    });

    it("should handle both actions sequentially", () => {
        const urlPayload = { poster: "https://image.tmdb.org/t/p/original" };
        const genresPayload = { 28: { id: 28, name: "Action" } };

        let state = homeSliceReducer(initialState, getApiConfiguration(urlPayload));
        state = homeSliceReducer(state, getGenres(genresPayload));

        expect(state.url).toEqual(urlPayload);
        expect(state.genres).toEqual(genresPayload);
    });
});
