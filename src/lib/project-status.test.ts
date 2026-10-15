import { describe, expect, it } from "vitest";

import { projectStatus } from "./project-status";

describe("project status", () => {
  it("does not claim unfinished product features are implemented", () => {
    expect(projectStatus.phase).toBe("mvp-api");
    expect(projectStatus.implementedFeatures).toContain("authentication");
    expect(projectStatus.implementedFeatures).toContain("leave");
  });
});
