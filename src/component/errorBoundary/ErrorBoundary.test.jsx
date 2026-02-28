import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const ThrowingComponent = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error("Test error");
    }
    return <div>Child content</div>;
};

describe("ErrorBoundary", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("should render children when there is no error", () => {
        render(
            <ErrorBoundary>
                <div>Hello World</div>
            </ErrorBoundary>
        );
        expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("should render error UI when child throws", () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
        expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("should render retry button on error", () => {
        render(
            <ErrorBoundary>
                <ThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        );
        expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("should reset error state when retry is clicked", () => {
        let shouldThrow = true;
        const DynamicChild = () => {
            if (shouldThrow) throw new Error("Test error");
            return <div>Child content</div>;
        };

        render(
            <ErrorBoundary>
                <DynamicChild />
            </ErrorBoundary>
        );

        expect(screen.getByText("Something went wrong.")).toBeInTheDocument();

        shouldThrow = false;
        fireEvent.click(screen.getByText("Try Again"));

        expect(screen.getByText("Child content")).toBeInTheDocument();
    });
});
