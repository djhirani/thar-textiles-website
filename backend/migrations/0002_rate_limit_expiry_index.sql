CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry ON rate_limits(expires_at);
