import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import homeSliceReducer from "../store/homeSlice";
import Explore from "../pages/explore/Explore";

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
                    35: { id: 35, name: "Comedy" },
                },
            },
        },
    });

const mockGenresList = {
    genres: [
        { id: 28, name: "Action" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
    ],
};

const mockDiscoverResults = {
    results: [
        {
            id: 1,
            title: "Action Movie One",
            poster_path: "/action1.jpg",
            vote_average: 7.5,
            genre_ids: [28],
            release_date: "2024-01-15",
        },
        {
            id: 2,
            title: "Comedy Movie Two",
            poster_path: "/comedy1.jpg",
            vote_average: 6.8,
            genre_ids: [35],
            release_date: "2024-03-20",
        },
    ],
    total_results: 2,
    total_pages: 1,
};

const renderExplore = (mediaType = "movie") => {
    fetchdatafromapi.mockImplementation((url) => {
        if (url.includes("/genre/")) return Promise.resolve(mockGenresList);
        if (url.includes("/discover/")) return Promise.resolve(mockDiscoverResults);
        return Promise.resolve({ results: [] });
    });

    return render(
        <Provider store={createTestStore()}>
            <MemoryRouter initialEntries={[`/explore/${mediaType}`]}>
                <Routes>
                    <Route
                        path="/explore/:mediaType"
                        element={<Explore />}
                    />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe("Explore Page Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should display 'Explore Movies' title for movie type", async () => {
        renderExplore("movie");

        await waitFor(() => {
            expect(screen.getByText("Explore Movies")).toBeInTheDocument();
        });
    });

    it("should display 'Explore TV Shows' title for tv type", async () => {
        renderExplore("tv");

        await waitFor(() => {
            expect(screen.getByText("Explore TV Shows")).toBeInTheDocument();
        });
    });

    it("should fetch discover data for the media type", async () => {
        renderExplore("movie");

        await waitFor(() => {
            expect(fetchdatafromapi).toHaveBeenCalledWith(
                "/discover/movie",
                expect.any(Object)
            );
        });
    });

    it("should render movie cards from results", async () => {
        renderExplore("movie");

        await waitFor(() => {
            expect(screen.getByText("Action Movie One")).toBeInTheDocument();
            expect(screen.getByText("Comedy Movie Two")).toBeInTheDocument();
        });
    });

    it("should show loading spinner initially", () => {
        fetchdatafromapi.mockReturnValue(new Promise(() => {}));

        const { container } = render(
            <Provider store={createTestStore()}>
                <MemoryRouter initialEntries={["/explore/movie"]}>
                    <Routes>
                        <Route
                            path="/explore/:mediaType"
                            element={<Explore />}
                        />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(container.querySelector(".loadingSpinner")).toBeInTheDocument();
    });

    it("should render genre filter dropdown", async () => {
        renderExplore("movie");

        await waitFor(() => {
            expect(screen.getByText("Select genres")).toBeInTheDocument();
        });
    });

    it("should render sort by dropdown", async () => {
        renderExplore("movie");

        await waitFor(() => {
            expect(screen.getByText("Sort by")).toBeInTheDocument();
        });
    });

    it("should show no results message when empty", async () => {
        fetchdatafromapi.mockImplementation((url) => {
            if (url.includes("/genre/")) return Promise.resolve(mockGenresList);
            if (url.includes("/discover/"))
                return Promise.resolve({
                    results: [],
                    total_results: 0,
                    total_pages: 0,
                });
            return Promise.resolve({ results: [] });
        });

        render(
            <Provider store={createTestStore()}>
                <MemoryRouter initialEntries={["/explore/movie"]}>
                    <Routes>
                        <Route
                            path="/explore/:mediaType"
                            element={<Explore />}
                        />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(
                screen.getByText("Sorry, Results not found!")
            ).toBeInTheDocument();
        });
    });

    it("should fetch genre list for the media type", async () => {
        renderExplore("movie");

        await waitFor(() => {
            expect(fetchdatafromapi).toHaveBeenCalledWith("/genre/movie/list");
        });
    });
});
