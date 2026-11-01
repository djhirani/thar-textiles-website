CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK(kind IN ('wholesale','artisan','partnership','expert','general')),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','pending','contacted','completed')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  organization TEXT,
  location TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  product_slug TEXT,
  preferred_language TEXT NOT NULL,
  preferred_channel TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  source_url TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_enquiries_queue ON enquiries(status, kind, created_at DESC);
CREATE INDEX idx_enquiries_contact ON enquiries(email, phone);
CREATE TABLE status_events (id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE, old_status TEXT, new_status TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE internal_notes (id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE, author TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE notification_outbox (id TEXT PRIMARY KEY, enquiry_id TEXT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE, event_type TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent','sent_test','failed')), attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT NOT NULL, provider_id TEXT, last_error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(enquiry_id,event_type));
CREATE INDEX idx_outbox_due ON notification_outbox(state,next_attempt_at);
CREATE TABLE rate_limits (key_hash TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE staff_roles (email TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('triage','lead','admin')), active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE audit_events (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT, request_id TEXT NOT NULL, created_at TEXT NOT NULL);
