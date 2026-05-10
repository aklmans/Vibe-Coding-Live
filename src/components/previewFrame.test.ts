import assert from "node:assert/strict";
import test from "node:test";

import { calculatePreviewScale } from "./OverlayBuilderApp";

test("preview scale is derived from current native dimensions", () => {
  const container = { w: 1504, h: 742 };

  assert.equal(
    calculatePreviewScale(container, 1920, 1080),
    Math.min(container.w / 1920, container.h / 1080),
  );
  assert.equal(
    calculatePreviewScale(container, 3840, 2160),
    Math.min(container.w / 3840, container.h / 2160),
  );
});
