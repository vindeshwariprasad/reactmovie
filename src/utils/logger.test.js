import { describe, it, expect, vi, beforeEach } from "vitest";

describe("logger", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("should call console.error in development mode", async () => {
        vi.stubEnv("DEV", true);
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const { default: logger } = await import("./logger");
        logger.error("test error");

        expect(consoleSpy).toHaveBeenCalledWith("test error");
        consoleSpy.mockRestore();
        vi.unstubAllEnvs();
    });

    it("should call console.warn in development mode", async () => {
        vi.stubEnv("DEV", true);
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const { default: logger } = await import("./logger");
        logger.warn("test warning");

        expect(consoleSpy).toHaveBeenCalledWith("test warning");
        consoleSpy.mockRestore();
        vi.unstubAllEnvs();
    });
});
