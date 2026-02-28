import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderHeader = () => {
    return render(
        <MemoryRouter>
            <Header />
        </MemoryRouter>
    );
};

describe("Header", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render with banner role", () => {
        renderHeader();
        expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render logo with alt text", () => {
        renderHeader();
        expect(screen.getByAltText("Movix home")).toBeInTheDocument();
    });

    it("should render Movies and TV Shows menu items", () => {
        renderHeader();
        expect(screen.getByText("Movies")).toBeInTheDocument();
        expect(screen.getByText("TV Shows")).toBeInTheDocument();
    });

    it("should navigate to home when logo is clicked", () => {
        renderHeader();
        fireEvent.click(screen.getByAltText("Movix home").closest('[role="link"]'));
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should navigate to home when Enter is pressed on logo", () => {
        renderHeader();
        fireEvent.keyDown(
            screen.getByAltText("Movix home").closest('[role="link"]'),
            { key: "Enter" }
        );
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should navigate to /explore/movie when Movies is clicked", () => {
        renderHeader();
        fireEvent.click(screen.getByText("Movies"));
        expect(mockNavigate).toHaveBeenCalledWith("/explore/movie");
    });

    it("should navigate to /explore/tv when TV Shows is clicked", () => {
        renderHeader();
        fireEvent.click(screen.getByText("TV Shows"));
        expect(mockNavigate).toHaveBeenCalledWith("/explore/tv");
    });

    it("should show search bar when search button is clicked", () => {
        renderHeader();
        const searchButtons = screen.getAllByLabelText("Open search");
        fireEvent.click(searchButtons[0]);
        expect(
            screen.getByPlaceholderText("Search for a movie or tv show....")
        ).toBeInTheDocument();
    });

    it("should navigate on Enter key in search input", () => {
        renderHeader();
        const searchButtons = screen.getAllByLabelText("Open search");
        fireEvent.click(searchButtons[0]);

        const input = screen.getByPlaceholderText(
            "Search for a movie or tv show...."
        );
        fireEvent.change(input, { target: { value: "batman" } });
        fireEvent.keyUp(input, { key: "Enter" });

        expect(mockNavigate).toHaveBeenCalledWith("/search/batman");
    });

    it("should not navigate on Enter when search query is empty", () => {
        renderHeader();
        const searchButtons = screen.getAllByLabelText("Open search");
        fireEvent.click(searchButtons[0]);

        const input = screen.getByPlaceholderText(
            "Search for a movie or tv show...."
        );
        fireEvent.keyUp(input, { key: "Enter" });

        expect(mockNavigate).not.toHaveBeenCalledWith(
            expect.stringContaining("/search/")
        );
    });

    it("should close search bar when close button is clicked", () => {
        renderHeader();
        const searchButtons = screen.getAllByLabelText("Open search");
        fireEvent.click(searchButtons[0]);

        expect(
            screen.getByPlaceholderText("Search for a movie or tv show....")
        ).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("Close search"));

        expect(
            screen.queryByPlaceholderText("Search for a movie or tv show....")
        ).not.toBeInTheDocument();
    });

    it("should have accessible search input with aria-label", () => {
        renderHeader();
        const searchButtons = screen.getAllByLabelText("Open search");
        fireEvent.click(searchButtons[0]);

        expect(
            screen.getByLabelText("Search for a movie or tv show")
        ).toBeInTheDocument();
    });

    it("should have keyboard accessible menu items", () => {
        renderHeader();
        const movies = screen.getByText("Movies");
        expect(movies).toHaveAttribute("tabindex", "0");
        expect(movies).toHaveAttribute("role", "menuitem");

        fireEvent.keyDown(movies, { key: "Enter" });
        expect(mockNavigate).toHaveBeenCalledWith("/explore/movie");
    });

    it("should render open menu button for mobile", () => {
        renderHeader();
        expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    });

    it("should toggle mobile menu", () => {
        renderHeader();
        fireEvent.click(screen.getByLabelText("Open menu"));
        expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });
});
