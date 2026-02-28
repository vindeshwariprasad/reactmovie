import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SwitchTabs from "./SwitchTabs";

describe("SwitchTabs", () => {
    it("should render all tab items", () => {
        render(
            <SwitchTabs data={["Day", "Week"]} onTabChange={vi.fn()} />
        );
        expect(screen.getByText("Day")).toBeInTheDocument();
        expect(screen.getByText("Week")).toBeInTheDocument();
    });

    it("should have first tab active by default", () => {
        render(
            <SwitchTabs data={["Movies", "TV Shows"]} onTabChange={vi.fn()} />
        );
        expect(screen.getByText("Movies")).toHaveClass("active");
        expect(screen.getByText("TV Shows")).not.toHaveClass("active");
    });

    it("should call onTabChange when tab is clicked", () => {
        const onTabChange = vi.fn();
        render(
            <SwitchTabs data={["Day", "Week"]} onTabChange={onTabChange} />
        );

        fireEvent.click(screen.getByText("Week"));
        expect(onTabChange).toHaveBeenCalledWith("Week", 1);
    });

    it("should call onTabChange with correct tab name and index", () => {
        const onTabChange = vi.fn();
        render(
            <SwitchTabs
                data={["Movies", "TV Shows"]}
                onTabChange={onTabChange}
            />
        );

        fireEvent.click(screen.getByText("TV Shows"));
        expect(onTabChange).toHaveBeenCalledWith("TV Shows", 1);

        fireEvent.click(screen.getByText("Movies"));
        expect(onTabChange).toHaveBeenCalledWith("Movies", 0);
    });

    it("should render the moving background element", () => {
        const { container } = render(
            <SwitchTabs data={["Day", "Week"]} onTabChange={vi.fn()} />
        );
        expect(container.querySelector(".movingBg")).toBeInTheDocument();
    });

    it("should update moving background position on tab click", () => {
        const { container } = render(
            <SwitchTabs data={["Day", "Week"]} onTabChange={vi.fn()} />
        );

        fireEvent.click(screen.getByText("Week"));

        const movingBg = container.querySelector(".movingBg");
        expect(movingBg.style.left).toBe("100px");
    });
});
