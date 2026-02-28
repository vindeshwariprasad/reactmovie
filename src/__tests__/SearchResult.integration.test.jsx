import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import homeSliceReducer from "../store/homeSlice";
import SearchResult from "../pages/seearchResult/SearchResult";

vi.mock("../utils/api", () => ({
    fetchdatafromapi: vi.fn(),
}));

import { fetchdatafromapi } from "../utils/api";

const createTestStore = () =>
    configureStore({
        reducer: { home: homeSliceReducer },
        preloadedState: {
            home: {
                url: { poster: "https://image.tmdb.org/t/p/original" },
                genres: {
                    28: { id: 28, name: "Action" },
                    18: { id: 18, name: "Drama" },
                },
            },
        },
    });

const mockSearchResults = {
    results: [
        {
            id: 100,
            title: "Batman Begins",
            media_type: "movie",
            poster_path: "/batman.jpg",
            vote_average: 8.2,
            genre_ids: [28],
            release_date: "2005-06-15",
        },
        {
            id: 101,
            title: "The Batman",
            media_type: "movie",
            poster_path: "/batman2.jpg",
            vote_average: 7.8,
            genre_ids: [28, 18],
            release_date: "2022-03-04",
        },
        {
            id: 102,
            name: "Bruce Wayne",
            media_type: "person",
        },
    ],
    total_results: 3,
    total_pages: 1,
};

const renderSearchResult = (query = "batman") => {
    return render(
        <Provider store={createTestStore()}>
            <MemoryRouter initialEntries={[`/search/${query}`]}>
                <Routes>
                    <Route path="/search/:query" element={<SearchResult />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe("SearchResult Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch search results based on query parameter", async () => {
        fetchdatafromapi.mockResolvedValueOnce(mockSearchResults);
        renderSearchResult("batman");

        await waitFor(() => {
            expect(fetchdatafromapi).toHaveBeenCalledWith(
                expect.stringContaining("/search/multi?query=batman")
            );
        });
    });

    it("should display search results count", async () => {
        fetchdatafromapi.mockResolvedValueOnce(mockSearchResults);
        renderSearchResult("batman");

        await waitFor(() => {
            expect(
                screen.getByText("Search results of 'batman'")
            ).toBeInTheDocument();
        });
    });

    it("should render movie cards for results", async () => {
        fetchdatafromapi.mockResolvedValueOnce(mockSearchResults);
        renderSearchResult("batman");

        await waitFor(() => {
            expect(screen.getByText("Batman Begins")).toBeInTheDocument();
            expect(screen.getByText("The Batman")).toBeInTheDocument();
        });
    });

    it("should filter out person results", async () => {
        fetchdatafromapi.mockResolvedValueOnce(mockSearchResults);
        renderSearchResult("batman");

        await waitFor(() => {
            expect(screen.getByText("Batman Begins")).toBeInTheDocument();
        });
        expect(screen.queryByText("Bruce Wayne")).not.toBeInTheDocument();
    });

    it("should show no results message when no results found", async () => {
        fetchdatafromapi.mockResolvedValueOnce({
            results: [],
            total_results: 0,
            total_pages: 0,
        });
        renderSearchResult("xyznonexistent");

        await waitFor(() => {
            expect(
                screen.getByText("Sorry, Results not found!")
            ).toBeInTheDocument();
        });
    });

    it("should show loading spinner initially", () => {
        fetchdatafromapi.mockReturnValue(new Promise(() => {}));
        const { container } = renderSearchResult("batman");
        expect(container.querySelector(".loadingSpinner")).toBeInTheDocument();
    });

    it("should use singular 'result' for single result", async () => {
        fetchdatafromapi.mockResolvedValueOnce({
            results: [
                {
                    id: 100,
                    title: "Batman Begins",
                    media_type: "movie",
                    poster_path: "/batman.jpg",
                    vote_average: 8.2,
                    genre_ids: [28],
                    release_date: "2005-06-15",
                },
            ],
            total_results: 1,
            total_pages: 1,
        });
        renderSearchResult("batman");

        await waitFor(() => {
            expect(
                screen.getByText("Search result of 'batman'")
            ).toBeInTheDocument();
        });
    });
});
