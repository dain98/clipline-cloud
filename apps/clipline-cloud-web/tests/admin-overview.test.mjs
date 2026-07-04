import test from "node:test";
import assert from "node:assert/strict";
import { storageMeterFraction, storageWarningLabel, summarizeJobsHealth } from "../src/pages/admin/overview.js";

// storageMeterFraction: pure port of the meter shown behind the Storage
// StatCard. The overview endpoint (apps/clipline-cloud-server/src/admin.rs
// :98-120) only reports a warning threshold, not a hard cap, so there is no
// meter at all when the admin hasn't configured one.

test("storageMeterFraction returns null when no warning threshold is configured", () => {
  assert.equal(
    storageMeterFraction({ total_storage_bytes: 500, global_storage_warning_threshold_bytes: null }),
    null
  );
  assert.equal(
    storageMeterFraction({ total_storage_bytes: 500, global_storage_warning_threshold_bytes: 0 }),
    null
  );
});

test("storageMeterFraction divides usage by the configured threshold", () => {
  assert.equal(
    storageMeterFraction({ total_storage_bytes: 50, global_storage_warning_threshold_bytes: 100 }),
    0.5
  );
});

test("storageMeterFraction clamps to 1 once usage meets or exceeds the threshold", () => {
  assert.equal(
    storageMeterFraction({ total_storage_bytes: 150, global_storage_warning_threshold_bytes: 100 }),
    1
  );
  assert.equal(
    storageMeterFraction({ total_storage_bytes: 100, global_storage_warning_threshold_bytes: 100 }),
    1
  );
});

// storageWarningLabel: pure port of legacy storageWarningLabel (src/app.js
// :3061-3066) used in the overview key-value grid.

test("storageWarningLabel reports Disabled when no threshold is configured", () => {
  assert.equal(storageWarningLabel({ global_storage_warning_threshold_bytes: null }), "Disabled");
});

test("storageWarningLabel reports below/at-or-above the formatted threshold", () => {
  const below = storageWarningLabel({
    global_storage_warning_threshold_bytes: 1024,
    global_storage_warning: false,
  });
  const above = storageWarningLabel({
    global_storage_warning_threshold_bytes: 1024,
    global_storage_warning: true,
  });
  assert.equal(below, "Below 1.0 KiB");
  assert.equal(above, "At or above 1.0 KiB");
});

// summarizeJobsHealth: pure helper backing the Jobs StatCard. Dead jobs and
// failed uploads (apps/clipline-cloud-server/src/admin.rs :359-391) are the
// two admin lists that represent something stuck that needs operator
// attention; recent-errors is just history of transient retries so it does
// not count against "healthy".

test("summarizeJobsHealth reports healthy with a zero count when nothing failed", () => {
  assert.deepEqual(summarizeJobsHealth({ deadJobs: [], failedUploads: [] }), {
    failedCount: 0,
    healthy: true,
  });
});

test("summarizeJobsHealth defaults missing lists to empty", () => {
  assert.deepEqual(summarizeJobsHealth({}), { failedCount: 0, healthy: true });
  assert.deepEqual(summarizeJobsHealth(), { failedCount: 0, healthy: true });
});

test("summarizeJobsHealth sums dead jobs and failed uploads and reports unhealthy", () => {
  assert.deepEqual(
    summarizeJobsHealth({ deadJobs: [{ id: "1" }, { id: "2" }], failedUploads: [{ id: "3" }] }),
    { failedCount: 3, healthy: false }
  );
});
