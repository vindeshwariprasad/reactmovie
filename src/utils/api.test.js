import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchdatafromapi } from "./api";

vi.mock("axios");

describe("fetchdatafromapi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    it("should return data on successful API call", async () => {
        const mockData = { results: [{ id: 1, title: "Test Movie" }] };
        axios.get.mockResolvedValueOnce({ data: mockData });

        const result = await fetchdatafromapi("/movie/popular");

        expect(axios.get).toHaveBeenCalledWith(
            "https://api.themoviedb.org/3/movie/popular",
            expect.objectContaining({
                headers: expect.any(Object),
            })
        );
        expect(result).toEqual(mockData);
    });

    it("should pass params to axios", async () => {
        const mockData = { results: [] };
        axios.get.mockResolvedValueOnce({ data: mockData });

        await fetchdatafromapi("/discover/movie", { page: 2 });

        expect(axios.get).toHaveBeenCalledWith(
            "https://api.themoviedb.org/3/discover/movie",
            expect.objectContaining({
                params: { page: 2 },
            })
        );
    });

    it("should throw error on failed API call", async () => {
        const networkError = new Error("Network Error");
        axios.get.mockRejectedValue(networkError);

        await expect(fetchdatafromapi("/invalid")).rejects.toThrow(
            "Network Error"
        );
    });

    it("should retry on server errors (5xx)", async () => {
        const serverError = new Error("Server Error");
        serverError.response = { status: 500 };

        const mockData = { results: [] };
        axios.get
            .mockRejectedValueOnce(serverError)
            .mockResolvedValueOnce({ data: mockData });

        const result = await fetchdatafromapi("/movie/popular");

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockData);
    });

    it("should not retry on client errors (4xx except 429)", async () => {
        const clientError = new Error("Not Found");
        clientError.response = { status: 404 };

        axios.get.mockRejectedValueOnce(clientError);

        await expect(fetchdatafromapi("/invalid")).rejects.toThrow("Not Found");
        expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it("should retry on rate limit (429)", async () => {
        const rateLimitError = new Error("Rate Limited");
        rateLimitError.response = { status: 429 };

        const mockData = { results: [] };
        axios.get
            .mockRejectedValueOnce(rateLimitError)
            .mockResolvedValueOnce({ data: mockData });

        const result = await fetchdatafromapi("/movie/popular");

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockData);
    });

    it("should throw after max retries exceeded", async () => {
        const serverError = new Error("Server Error");
        serverError.response = { status: 500 };

        axios.get.mockRejectedValue(serverError);

        await expect(fetchdatafromapi("/movie/popular")).rejects.toThrow(
            "Server Error"
        );
        // Initial attempt + 2 retries = 3 total
        expect(axios.get).toHaveBeenCalledTimes(3);
    });

    it("should retry on network errors (no response status)", async () => {
        const networkError = new Error("Network Error");
        // No .response property — simulates a network-level failure

        const mockData = { results: [] };
        axios.get
            .mockRejectedValueOnce(networkError)
            .mockResolvedValueOnce({ data: mockData });

        const result = await fetchdatafromapi("/movie/popular");

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockData);
    });
});
