import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import homeSliceReducer from "../../store/homeSlice";
import Coursel from "./Coursel";

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
                },
            },
        },
    });

const mockData = [
    {
        id: 1,
        title: "Movie One",
        poster_path: "/poster1.jpg",
        vote_average: 8.5,
        genre_ids: [28],
        release_date: "2024-01-15",
    },
    {
        id: 2,
        title: "Movie Two",
        poster_path: "/poster2.jpg",
        vote_average: 6.3,
        genre_ids: [28],
        release_date: "2024-06-20",
    },
];

const renderCarousel = (props = {}) => {
    return render(
        <Provider store={createTestStore()}>
            <MemoryRouter>
                <Coursel
                    data={mockData}
                    loading={false}
                    endpoint="movie"
                    title="Trending"
                    {...props}
                />
            </MemoryRouter>
        </Provider>
    );
};

describe("Coursel (Carousel)", () => {
    it("should render the title", () => {
        renderCarousel();
        expect(screen.getByText("Trending")).toBeInTheDocument();
    });

    it("should render all movie items", () => {
        renderCarousel();
        expect(screen.getByText("Movie One")).toBeInTheDocument();
        expect(screen.getByText("Movie Two")).toBeInTheDocument();
    });

    it("should render formatted dates", () => {
        renderCarousel();
        expect(screen.getByText("15 Jan, 2024")).toBeInTheDocument();
        expect(screen.getByText("20 Jun, 2024")).toBeInTheDocument();
    });

    it("should render ratings", () => {
        renderCarousel();
        expect(screen.getByText("8.5")).toBeInTheDocument();
        expect(screen.getByText("6.3")).toBeInTheDocument();
    });

    it("should show skeleton loading when loading is true", () => {
        const { container } = renderCarousel({ loading: true, data: null });
        expect(container.querySelector(".loadingSkeleton")).toBeInTheDocument();
        expect(
            container.querySelectorAll(".skeletonItem").length
        ).toBe(5);
    });

    it("should not show skeleton when data is loaded", () => {
        const { container } = renderCarousel();
        expect(
            container.querySelector(".loadingSkeleton")
        ).not.toBeInTheDocument();
    });

    it("should have navigation buttons with aria-labels", () => {
        renderCarousel();
        expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
        expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
    });

    it("should have region role with aria-label", () => {
        renderCarousel();
        expect(screen.getByRole("region")).toHaveAttribute(
            "aria-label",
            "Trending"
        );
    });

    it("should navigate on item click", () => {
        renderCarousel();
        const items = screen.getAllByRole("link");
        fireEvent.click(items[0]);
        expect(mockNavigate).toHaveBeenCalledWith("/movie/1");
    });

    it("should navigate on Enter key", () => {
        renderCarousel();
        const items = screen.getAllByRole("link");
        fireEvent.keyDown(items[0], { key: "Enter" });
        expect(mockNavigate).toHaveBeenCalledWith("/movie/1");
    });

    it("should not render title when title prop is not provided", () => {
        renderCarousel({ title: undefined });
        expect(
            screen.queryByText("Trending")
        ).not.toBeInTheDocument();
    });
});
