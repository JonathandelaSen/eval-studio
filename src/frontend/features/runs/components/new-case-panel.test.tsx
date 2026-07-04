import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NewCasePanel } from "./new-case-panel";

describe("NewCasePanel", () => {
  it("uses the user message as input and collects expected output as free text", () => {
    const markup = renderToStaticMarkup(
      <NewCasePanel
        suiteId="550e8400-e29b-41d4-a716-446655440000"
        mutations={{ busy: false } as never}
      />,
    );

    expect(markup).not.toContain('name="input"');
    expect(markup).toContain('name="userMessage"');
    expect(markup).toContain('name="expectedOutput"');
    expect(markup).not.toContain('&quot;answer&quot;');
  });
});
