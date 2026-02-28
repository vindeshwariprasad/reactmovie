import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import usePageMeta from "./usePageMeta";

describe("usePageMeta", () => {
    let originalTitle;
    let metaTag;

    beforeEach(() => {
        originalTitle = document.title;
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "description");
        metaTag.setAttribute("content", "default");
        document.head.appendChild(metaTag);
    });

    afterEach(() => {
        document.title = originalTitle;
        metaTag.remove();
    });

    it("should set default title when no title provided", () => {
        renderHook(() => usePageMeta(null));
        expect(document.title).toBe("Movix - Movie Discovery Platform");
    });

    it("should set custom title with Movix suffix", () => {
        renderHook(() => usePageMeta("Search: batman"));
        expect(document.title).toBe("Search: batman | Movix");
    });

    it("should update meta description", () => {
        renderHook(() => usePageMeta("Test", "Custom description"));
        expect(metaTag.getAttribute("content")).toBe("Custom description");
    });

    it("should reset title on unmount", () => {
        const { unmount } = renderHook(() => usePageMeta("Test Page"));
        expect(document.title).toBe("Test Page | Movix");

        unmount();
        expect(document.title).toBe("Movix - Movie Discovery Platform");
    });

    it("should use default description when none provided", () => {
        renderHook(() => usePageMeta("Test"));
        expect(metaTag.getAttribute("content")).toContain("Discover millions");
    });
});
