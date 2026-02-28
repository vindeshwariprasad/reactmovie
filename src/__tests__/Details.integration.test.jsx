import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import homeSliceReducer from "../store/homeSlice";
import Details from "../pages/details/Details";

vi.mock("../utils/api", () => ({
    fetchdatafromapi: vi.fn(),
}));

vi.mock("react-player/youtube", () => ({
    default: () => <div data-testid="react-player">Player</div>,
}));

import { fetchdatafromapi } from "../utils/api";

const createTestStore = () =>
    configureStore({
        reducer: { home: homeSliceReducer },
        preloadedState: {
            home: {
                url: {
                    backdrop: "https://image.tmdb.org/t/p/original",
                    poster: "https://image.tmdb.org/t/p/original",
                    profile: "https://image.tmdb.org/t/p/original",
                },
                genres: {
                    18: { id: 18, name: "Drama" },
                    28: { id: 28, name: "Action" },
                },
            },
        },
    });

const mockMovieDetails = {
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

const mockVideos = {
    results: [
        {
            id: "v1",
            key: "6hB3S9bIaco",
            name: "Official Trailer",
            type: "Trailer",
        },
    ],
};

const mockCredits = {
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

const mockSimilar = {
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

const mockRecommendations = {
    results: [
        {
            id: 300,
            title: "Forrest Gump",
            poster_path: "/forrest.jpg",
            vote_average: 8.8,
            genre_ids: [18],
            release_date: "1994-07-06",
        },
    ],
    total_pages: 1,
};

const setupMocks = () => {
    fetchdatafromapi.mockImplementation((url) => {
        if (url === "/movie/1/videos") return Promise.resolve(mockVideos);
        if (url === "/movie/1/credits") return Promise.resolve(mockCredits);
        if (url === "/movie/1") return Promise.resolve(mockMovieDetails);
        if (url === "/movie/1/similar") return Promise.resolve(mockSimilar);
        if (url === "/movie/1/recommendations") return Promise.resolve(mockRecommendations);
        return Promise.resolve({ results: [] });
    });
};

const renderDetails = (path = "/movie/1") => {
    return render(
        <Provider store={createTestStore()}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/:mediaType/:id" element={<Details />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe("Details Page Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    describe("Data Fetching", () => {
        it("should fetch videos and credits based on route params", async () => {
            renderDetails();

            await waitFor(() => {
                expect(fetchdatafromapi).toHaveBeenCalledWith("/movie/1/videos");
                expect(fetchdatafromapi).toHaveBeenCalledWith("/movie/1/credits");
            });
        });

        it("should fetch movie details for the details banner", async () => {
            renderDetails();

            await waitFor(() => {
                expect(fetchdatafromapi).toHaveBeenCalledWith("/movie/1");
            });
        });
    });

    describe("Movie Details Display", () => {
        it("should display movie title with year", async () => {
            renderDetails();

            await waitFor(() => {
                expect(
                    screen.getByText(/The Shawshank Redemption/)
                ).toBeInTheDocument();
            });
        });

        it("should display movie overview", async () => {
            renderDetails();

            await waitFor(() => {
                expect(
                    screen.getByText("Two imprisoned men bond over a number of years.")
                ).toBeInTheDocument();
            });
        });

        it("should display tagline", async () => {
            renderDetails();

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Fear can hold you prisoner. Hope can set you free."
                    )
                ).toBeInTheDocument();
            });
        });

        it("should display runtime in hours and minutes", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("2h 22m")).toBeInTheDocument();
            });
        });

        it("should display movie status", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Released")).toBeInTheDocument();
            });
        });

        it("should display release date formatted", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("23 Sep, 1994")).toBeInTheDocument();
            });
        });
    });

    describe("Cast Section", () => {
        it("should display Top Cast heading", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Top Cast")).toBeInTheDocument();
            });
        });

        it("should display cast member names", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Tim Robbins")).toBeInTheDocument();
                expect(screen.getByText("Morgan Freeman")).toBeInTheDocument();
            });
        });

        it("should display character names", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Andy Dufresne")).toBeInTheDocument();
                expect(
                    screen.getByText("Ellis Boyd Redding")
                ).toBeInTheDocument();
            });
        });
    });

    describe("Crew Section", () => {
        it("should display director and writer sections", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText(/Director/)).toBeInTheDocument();
                expect(screen.getByText(/Writer/)).toBeInTheDocument();
                // Frank Darabont appears as both director and writer
                const darabontElements = screen.getAllByText("Frank Darabont");
                expect(darabontElements.length).toBe(2);
            });
        });
    });

    describe("Videos Section", () => {
        it("should display Official Videos heading", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Official Videos")).toBeInTheDocument();
            });
        });

        it("should display video titles", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Official Trailer")).toBeInTheDocument();
            });
        });
    });

    describe("Similar & Recommendations", () => {
        it("should display Similar Movies section", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Similar Movies")).toBeInTheDocument();
            });
        });

        it("should display Recommendations section", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Recommendations")).toBeInTheDocument();
            });
        });

        it("should display similar movie titles", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("The Green Mile")).toBeInTheDocument();
            });
        });

        it("should display recommended movie titles", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Forrest Gump")).toBeInTheDocument();
            });
        });
    });

    describe("Watch Trailer Interaction", () => {
        it("should show Watch Trailer button", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Watch Trailer")).toBeInTheDocument();
            });
        });

        it("should open video popup when Watch Trailer is clicked", async () => {
            renderDetails();

            await waitFor(() => {
                expect(screen.getByText("Watch Trailer")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("Watch Trailer"));

            // The VideoPopup should now be visible (has "visible" class)
            await waitFor(() => {
                const dialogs = screen.getAllByRole("dialog");
                const visibleDialog = dialogs.find((d) =>
                    d.classList.contains("visible")
                );
                expect(visibleDialog).toBeDefined();
            });
        });
    });
});
