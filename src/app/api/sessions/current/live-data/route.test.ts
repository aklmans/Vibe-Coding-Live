import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_STATE_BY_LOCALE } from "../../../../../types";
import { overlayStateToLiveData } from "../../../../../lib/live-data";
import { PUT } from "./route";

test("PUT /api/sessions/current/live-data is a no-op fallback without DATABASE_URL", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const liveData = overlayStateToLiveData(DEFAULT_STATE_BY_LOCALE.en, {
      id: "local",
      dateKey: "2026-05-10",
      locale: "en",
      title: "Local fallback",
      status: "draft",
      startedAt: "",
      endedAt: null,
      createdAt: "2026-05-10T00:00:00.000Z",
      updatedAt: "2026-05-10T00:00:00.000Z",
    });

    const response = await PUT(
      new Request(
        "http://localhost/api/sessions/current/live-data?locale=en&dateKey=2026-05-10",
        {
          method: "PUT",
          body: JSON.stringify({ liveData }),
        },
      ),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      liveData: null,
    });
  } finally {
    if (previous) process.env.DATABASE_URL = previous;
  }
});
