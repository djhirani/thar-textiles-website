CREATE TABLE github_oauth_states (
  state_hash TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_github_oauth_states_expiry ON github_oauth_states(expires_at);
