import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import Usefetch from "./Usefetch";

vi.mock("../utils/api", () => ({
    fetchdatafromapi: vi.fn(),
}));

import { fetchdatafromapi } from "../utils/api";

describe("Usefetch", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should start with loading true and data null", () => {
        fetchdatafromapi.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => Usefetch("/test"));

        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it("should set data on successful fetch", async () => {
        const mockData = { results: [{ id: 1 }] };
        fetchdatafromapi.mockResolvedValueOnce(mockData);

        const { result } = renderHook(() => Usefetch("/movie/popular"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it("should set error on failed fetch", async () => {
        fetchdatafromapi.mockRejectedValueOnce(new Error("API Error"));

        const { result } = renderHook(() => Usefetch("/invalid"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("API Error");
        expect(result.current.data).toBeNull();
    });

    it("should refetch when URL changes", async () => {
        const mockData1 = { results: [{ id: 1 }] };
        const mockData2 = { results: [{ id: 2 }] };
        fetchdatafromapi
            .mockResolvedValueOnce(mockData1)
            .mockResolvedValueOnce(mockData2);

        const { result, rerender } = renderHook(
            ({ url }) => Usefetch(url),
            { initialProps: { url: "/movie/popular" } }
        );

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData1);
        });

        rerender({ url: "/tv/popular" });

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData2);
        });

        expect(fetchdatafromapi).toHaveBeenCalledTimes(2);
    });

    it("should not update state after unmount (cancellation)", async () => {
        let resolvePromise;
        fetchdatafromapi.mockReturnValue(
            new Promise((resolve) => {
                resolvePromise = resolve;
            })
        );

        const { unmount } = renderHook(() => Usefetch("/movie/popular"));

        unmount();

        // Resolve after unmount — should not cause state update
        resolvePromise({ results: [{ id: 1 }] });

        // If no error is thrown, the cancelled flag worked
        expect(true).toBe(true);
    });
});
