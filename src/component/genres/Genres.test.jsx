import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import homeSliceReducer from "../../store/homeSlice";
import Genres from "./Genres";

const createTestStore = (genres = {}) =>
    configureStore({
        reducer: { home: homeSliceReducer },
        preloadedState: {
            home: {
                url: {},
                genres,
            },
        },
    });

const renderGenres = (data, genres) => {
    return render(
        <Provider store={createTestStore(genres)}>
            <Genres data={data} />
        </Provider>
    );
};

describe("Genres", () => {
    const mockGenres = {
        28: { id: 28, name: "Action" },
        35: { id: 35, name: "Comedy" },
        18: { id: 18, name: "Drama" },
    };

    it("should render genre names for given IDs", () => {
        renderGenres([28, 35], mockGenres);
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.getByText("Comedy")).toBeInTheDocument();
    });

    it("should skip unknown genre IDs", () => {
        renderGenres([28, 999], mockGenres);
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.queryByText("999")).not.toBeInTheDocument();
    });

    it("should render empty when data is null", () => {
        const { container } = renderGenres(null, mockGenres);
        expect(container.querySelector(".genres")).toBeInTheDocument();
        expect(container.querySelector(".genre")).not.toBeInTheDocument();
    });

    it("should render empty when genres store is empty", () => {
        const { container } = renderGenres([28, 35], {});
        expect(container.querySelector(".genre")).not.toBeInTheDocument();
    });

    it("should render multiple genres", () => {
        renderGenres([28, 35, 18], mockGenres);
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.getByText("Comedy")).toBeInTheDocument();
        expect(screen.getByText("Drama")).toBeInTheDocument();
    });
});
