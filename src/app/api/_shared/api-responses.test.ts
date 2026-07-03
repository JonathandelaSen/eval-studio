import { describe, expect, it } from "vitest";
import { created, errorResponse, noContent, ok } from "./api-responses";

describe("API response helpers", () => {
  it("serializes successful reads", async () => {
    const response = ok({ value: 1 });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ value: 1 });
  });

  it("serializes successful creates", async () => {
    const response = created({ id: "project-1" });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: "project-1" });
  });

  it("returns an empty successful response", async () => {
    const response = noContent();

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("serializes the canonical error contract", async () => {
    const response = errorResponse({
      status: 400,
      code: "invalid_request",
      message: "Choose a project directory.",
      details: [{ path: "directory" }],
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "invalid_request",
        message: "Choose a project directory.",
        details: [{ path: "directory" }],
      },
    });
  });
});
