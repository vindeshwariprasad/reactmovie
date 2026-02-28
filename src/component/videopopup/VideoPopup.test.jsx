import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VideoPopup from "./VideoPopup";

vi.mock("react-player/youtube", () => ({
    default: () => <div data-testid="react-player">Player</div>,
}));

describe("VideoPopup", () => {
    const defaultProps = {
        show: true,
        setShow: vi.fn(),
        videoId: "abc123",
        setVideoId: vi.fn(),
    };

    it("should have visible class when show is true", () => {
        const { container } = render(<VideoPopup {...defaultProps} />);
        expect(container.querySelector(".videoPopup")).toHaveClass("visible");
    });

    it("should not have visible class when show is false", () => {
        const { container } = render(
            <VideoPopup {...defaultProps} show={false} />
        );
        expect(container.querySelector(".videoPopup")).not.toHaveClass(
            "visible"
        );
    });

    it("should have role dialog and aria-modal", () => {
        render(<VideoPopup {...defaultProps} />);
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should call setShow and setVideoId when close button is clicked", () => {
        const setShow = vi.fn();
        const setVideoId = vi.fn();
        render(
            <VideoPopup
                {...defaultProps}
                setShow={setShow}
                setVideoId={setVideoId}
            />
        );

        fireEvent.click(screen.getByText("Close"));
        expect(setShow).toHaveBeenCalledWith(false);
        expect(setVideoId).toHaveBeenCalledWith(null);
    });

    it("should close on Escape key press", () => {
        const setShow = vi.fn();
        const setVideoId = vi.fn();
        render(
            <VideoPopup
                {...defaultProps}
                setShow={setShow}
                setVideoId={setVideoId}
            />
        );

        fireEvent.keyDown(document, { key: "Escape" });
        expect(setShow).toHaveBeenCalledWith(false);
        expect(setVideoId).toHaveBeenCalledWith(null);
    });

    it("should close when clicking the opacity layer", () => {
        const setShow = vi.fn();
        const setVideoId = vi.fn();
        const { container } = render(
            <VideoPopup
                {...defaultProps}
                setShow={setShow}
                setVideoId={setVideoId}
            />
        );

        fireEvent.click(container.querySelector(".opacityLayer"));
        expect(setShow).toHaveBeenCalledWith(false);
    });
});
