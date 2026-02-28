import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Rating from "./Rating";

describe("Rating", () => {
    it("should render the rating value", () => {
        render(<Rating rating="7.5" />);
        expect(screen.getByText("7.5")).toBeInTheDocument();
    });

    it("should render with low rating value", () => {
        render(<Rating rating="3.2" />);
        expect(screen.getByText("3.2")).toBeInTheDocument();
    });

    it("should render with perfect rating", () => {
        render(<Rating rating="10.0" />);
        expect(screen.getByText("10.0")).toBeInTheDocument();
    });

    it("should have circleRating class", () => {
        const { container } = render(<Rating rating="8.0" />);
        expect(container.querySelector(".circleRating")).toBeInTheDocument();
    });
});
