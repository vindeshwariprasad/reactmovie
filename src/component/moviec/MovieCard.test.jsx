import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import homeSliceReducer from "../../store/homeSlice";
import MovieCard from "./MovieCard";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

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

const mockMovieData = {
    id: 123,
    title: "Test Movie",
    poster_path: "/test.jpg",
    vote_average: 7.5,
    genre_ids: [28, 35],
    release_date: "2024-01-15",
};

const renderMovieCard = (props = {}) => {
    return render(
        <Provider store={createTestStore()}>
            <MemoryRouter>
                <MovieCard
                    data={mockMovieData}
                    mediaType="movie"
                    {...props}
                />
            </MemoryRouter>
        </Provider>
    );
};

describe("MovieCard", () => {
    it("should render movie title", () => {
        renderMovieCard();
        expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });

    it("should render formatted release date", () => {
        renderMovieCard();
        expect(screen.getByText("15 Jan, 2024")).toBeInTheDocument();
    });

    it("should navigate on click", () => {
        renderMovieCard();
        fireEvent.click(screen.getByRole("link"));
        expect(mockNavigate).toHaveBeenCalledWith("/movie/123");
    });

    it("should navigate on Enter key press", () => {
        renderMovieCard();
        fireEvent.keyDown(screen.getByRole("link"), { key: "Enter" });
        expect(mockNavigate).toHaveBeenCalledWith("/movie/123");
    });

    it("should have tabIndex for keyboard accessibility", () => {
        renderMovieCard();
        expect(screen.getByRole("link")).toHaveAttribute("tabindex", "0");
    });

    it("should render rating when not from search", () => {
        renderMovieCard({ fromSearch: false });
        expect(screen.getByText("7.5")).toBeInTheDocument();
    });

    it("should not render rating when from search", () => {
        renderMovieCard({ fromSearch: true });
        expect(screen.queryByText("7.5")).not.toBeInTheDocument();
    });
});
