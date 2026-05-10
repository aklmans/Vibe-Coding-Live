import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "./route";

test("GET /api/sessions/current reports unconfigured database without DATABASE_URL", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;

  try {
    const response = await GET(
      new Request(
        "http://localhost/api/sessions/current?locale=en&dateKey=2026-05-10",
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
