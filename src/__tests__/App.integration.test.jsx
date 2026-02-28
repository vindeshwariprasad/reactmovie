import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import homeSliceReducer from "../store/homeSlice";
import App from "../App";

// Mock the API
vi.mock("../utils/api", () => ({
    fetchdatafromapi: vi.fn(),
}));

import { fetchdatafromapi } from "../utils/api";

// Mock react-player to avoid DOM issues in tests
vi.mock("react-player/youtube", () => ({
    default: () => <div data-testid="react-player">Player</div>,
}));

const mockConfigResponse = {
    images: {
        secure_base_url: "https://image.tmdb.org/t/p/",
    },
};

const mockGenresResponse = (type) => ({
    genres: [
        { id: 28, name: "Action" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
    ],
});

const mockTopRatedResponse = {
    results: [
        {
            id: 1,
            title: "The Shawshank Redemption",
            poster_path: "/poster1.jpg",
            backdrop_path: "/backdrop1.jpg",
            vote_average: 9.3,
            genre_ids: [18],
            release_date: "1994-09-23",
        },
        {
            id: 2,
            title: "The Godfather",
            poster_path: "/poster2.jpg",
            backdrop_path: "/backdrop2.jpg",
            vote_average: 9.2,
            genre_ids: [18, 28],
            release_date: "1972-03-14",
        },
    ],
    total_results: 2,
    total_pages: 1,
};

const mockTrendingResponse = {
    results: [
        {
            id: 10,
            title: "Trending Movie",
            poster_path: "/trending.jpg",
            vote_average: 7.5,
            genre_ids: [28],
            release_date: "2024-06-01",
        },
    ],
    total_pages: 1,
};

const mockPopularResponse = {
    results: [
        {
            id: 20,
            title: "Popular Movie",
            poster_path: "/popular.jpg",
            vote_average: 8.0,
            genre_ids: [35],
            release_date: "2024-03-15",
        },
    ],
    total_pages: 1,
};

const mockSearchResponse = {
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
            name: "Person Result",
            media_type: "person",
        },
    ],
    total_results: 2,
    total_pages: 1,
};

const mockMovieDetailsResponse = {
    id: 1,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years.",
    poster_path: "/poster1.jpg",
    backdrop_path: "/backdrop1.jpg",
    vote_average: 9.3,
    release_date: "1994-09-23",
    runtime: 142,
    status: "Released",
    tagline: "Fear can hold you prisoner. Hope can set you free.",
    genres: [{ id: 18, name: "Drama" }],
};

const mockVideosResponse = {
    results: [
        {
            id: "v1",
            key: "6hB3S9bIaco",
            name: "Official Trailer",
            type: "Trailer",
        },
    ],
};

const mockCreditsResponse = {
    cast: [
        {
            id: 500,
            name: "Tim Robbins",
            character: "Andy Dufresne",
            profile_path: "/tim.jpg",
        },
        {
            id: 501,
            name: "Morgan Freeman",
            character: "Ellis Boyd Redding",
            profile_path: null,
        },
    ],
    crew: [
        { id: 600, name: "Frank Darabont", job: "Director" },
        { id: 601, name: "Frank Darabont", job: "Screenplay" },
    ],
};

const mockSimilarResponse = {
    results: [
        {
            id: 200,
            title: "The Green Mile",
            poster_path: "/green.jpg",
            vote_average: 8.5,
            genre_ids: [18],
            release_date: "1999-12-10",
        },
    ],
    total_pages: 1,
};

const mockRecommendationsResponse = {
    results: [
        {
            id: 300,
            title: "Forrest Gump",
            poster_path: "/forrest.jpg",
            vote_average: 8.8,
            genre_ids: [18, 35],
            release_date: "1994-07-06",
        },
    ],
    total_pages: 1,
};

const mockDiscoverResponse = {
    results: [
        {
            id: 400,
            title: "Discover Movie",
            poster_path: "/discover.jpg",
            vote_average: 7.0,
            genre_ids: [28],
            release_date: "2024-01-01",
        },
    ],
    total_results: 1,
    total_pages: 1,
};

const setupApiMocks = () => {
    fetchdatafromapi.mockImplementation((url, params) => {
        if (url === "/configuration") return Promise.resolve(mockConfigResponse);
        if (url.includes("/genre/tv/list")) return Promise.resolve(mockGenresResponse("tv"));
        if (url.includes("/genre/movie/list")) return Promise.resolve(mockGenresResponse("movie"));
        if (url.includes("/movie/top_rated")) return Promise.resolve(mockTopRatedResponse);
        if (url.includes("/trending/movie/day")) return Promise.resolve(mockTrendingResponse);
        if (url.includes("/trending/movie/week")) return Promise.resolve(mockTrendingResponse);
        if (url.includes("/movie/popular")) return Promise.resolve(mockPopularResponse);
        if (url.includes("/tv/popular")) return Promise.resolve(mockPopularResponse);
        if (url.includes("/tv/top_rated")) return Promise.resolve(mockTopRatedResponse);
        if (url.includes("/search/multi")) return Promise.resolve(mockSearchResponse);
        if (url.match(/\/movie\/\d+\/videos/)) return Promise.resolve(mockVideosResponse);
        if (url.match(/\/movie\/\d+\/credits/)) return Promise.resolve(mockCreditsResponse);
        if (url.match(/\/movie\/\d+\/similar/)) return Promise.resolve(mockSimilarResponse);
        if (url.match(/\/movie\/\d+\/recommendations/)) return Promise.resolve(mockRecommendationsResponse);
        if (url.match(/\/movie\/\d+$/)) return Promise.resolve(mockMovieDetailsResponse);
        if (url.includes("/discover/")) return Promise.resolve(mockDiscoverResponse);
        return Promise.resolve({ results: [] });
    });
};

// App uses BrowserRouter internally, so we need a wrapper that provides Redux only
// We render App directly since it includes its own BrowserRouter
const renderApp = (initialEntries = ["/"]) => {
    const store = configureStore({
        reducer: { home: homeSliceReducer },
    });

    // We can't use MemoryRouter with App (it has BrowserRouter).
    // Instead, we'll test individual pages with MemoryRouter for route-specific tests.
    return render(
        <Provider store={store}>
            <App />
        </Provider>
    );
};

describe("App Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupApiMocks();
    });

    describe("App Initialization", () => {
        it("should fetch API configuration on mount", async () => {
            renderApp();

            await waitFor(() => {
                expect(fetchdatafromapi).toHaveBeenCalledWith("/configuration");
            });
        });

        it("should fetch genres for both TV and movies on mount", async () => {
            renderApp();

            await waitFor(() => {
                expect(fetchdatafromapi).toHaveBeenCalledWith("/genre/tv/list");
                expect(fetchdatafromapi).toHaveBeenCalledWith("/genre/movie/list");
            });
        });

        it("should render header and footer", async () => {
            renderApp();

            expect(screen.getByRole("banner")).toBeInTheDocument();
            expect(screen.getByText("Terms Of Use")).toBeInTheDocument();
        });
    });

    describe("Home Page", () => {
        it("should render hero banner content", async () => {
            renderApp();

            await waitFor(() => {
                expect(screen.getByText("Welcome!!.")).toBeInTheDocument();
            });
        });

        it("should render trending section", async () => {
            renderApp();

            await waitFor(() => {
                expect(screen.getByText("Trending")).toBeInTheDocument();
            });
        });

        it("should render popular section", async () => {
            renderApp();

            await waitFor(() => {
                expect(screen.getByText("What's Popular")).toBeInTheDocument();
            });
        });

        it("should render top rated section", async () => {
            renderApp();

            await waitFor(() => {
                expect(screen.getByText("Top Rated")).toBeInTheDocument();
            });
        });

        it("should render switch tabs for trending (Day/Week)", async () => {
            renderApp();

            await waitFor(() => {
                expect(screen.getByText("Day")).toBeInTheDocument();
                expect(screen.getByText("Week")).toBeInTheDocument();
            });
        });
    });

    describe("Header Navigation", () => {
        it("should render Movies and TV Shows in navigation", () => {
            renderApp();
            const nav = screen.getByRole("navigation");
            expect(nav).toBeInTheDocument();
            expect(nav.textContent).toContain("Movies");
            expect(nav.textContent).toContain("TV Shows");
        });

        it("should open search bar on search icon click", async () => {
            renderApp();

            const searchButtons = screen.getAllByLabelText("Open search");
            fireEvent.click(searchButtons[0]);

            expect(
                screen.getByPlaceholderText("Search for a movie or tv show....")
            ).toBeInTheDocument();
        });
    });

    describe("Footer", () => {
        it("should render footer menu items", () => {
            renderApp();
            expect(screen.getByText("Terms Of Use")).toBeInTheDocument();
            expect(screen.getByText("Privacy-Policy")).toBeInTheDocument();
            expect(screen.getByText("About")).toBeInTheDocument();
            expect(screen.getByText("Blog")).toBeInTheDocument();
            expect(screen.getByText("FAQ")).toBeInTheDocument();
        });

        it("should render social media icons", () => {
            const { container } = renderApp();
            const socialIcons = container.querySelectorAll(".socialIcons .icon");
            expect(socialIcons.length).toBe(4);
        });
    });

    describe("Error Handling", () => {
        it("should handle API configuration failure gracefully", async () => {
            fetchdatafromapi.mockImplementation((url) => {
                if (url === "/configuration") {
                    return Promise.reject(new Error("Network Error"));
                }
                return Promise.resolve({ genres: [] });
            });

            // App uses logger.error which calls console.error in dev mode
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            renderApp();

            // Should not crash — the app still renders
            await waitFor(() => {
                expect(screen.getByRole("banner")).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });

        it("should handle genres fetch failure gracefully", async () => {
            fetchdatafromapi.mockImplementation((url) => {
                if (url === "/configuration") return Promise.resolve(mockConfigResponse);
                return Promise.reject(new Error("Genre fetch failed"));
            });

            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            renderApp();

            // Should not crash — the app still renders
            await waitFor(() => {
                expect(screen.getByRole("banner")).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });
    });
});
