UPDATE jobs
SET status = 'failed',
    last_error = COALESCE(last_error, 'deduplicated while enforcing active job uniqueness')
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY kind, COALESCE(target_type, ''), target_id
             ORDER BY CASE WHEN status = 'running' THEN 0 ELSE 1 END,
                      created_at ASC,
                      id ASC
           ) AS duplicate_number
    FROM jobs
    WHERE status IN ('pending', 'running') AND target_id IS NOT NULL
  ) duplicates
  WHERE duplicate_number > 1
);

UPDATE jobs
SET status = 'failed',
    last_error = COALESCE(last_error, 'deduplicated while enforcing pending global job uniqueness')
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY kind ORDER BY created_at ASC, id ASC) AS duplicate_number
    FROM jobs
    WHERE status = 'pending' AND target_id IS NULL
  ) duplicates
  WHERE duplicate_number > 1
);

CREATE UNIQUE INDEX jobs_active_target_kind_ux
  ON jobs(kind, COALESCE(target_type, ''), target_id)
  WHERE status IN ('pending', 'running') AND target_id IS NOT NULL;

CREATE UNIQUE INDEX jobs_active_global_kind_ux
  ON jobs(kind)
  WHERE status = 'pending' AND target_id IS NULL;
