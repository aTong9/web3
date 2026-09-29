CREATE TABLE IF NOT EXISTS kol_subscriptions (
  owner_user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'failed',
  status_message TEXT NOT NULL DEFAULT '',
  checked_at TEXT,
  last_success_at TEXT,
  failure_count INTEGER NOT NULL DEFAULT 0,
  next_check_at TEXT,
  PRIMARY KEY (owner_user_id, id),
  UNIQUE (owner_user_id, feed_url)
);

CREATE TABLE IF NOT EXISTS kol_items (
  owner_user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  published_at TEXT,
  published_label TEXT,
  stocks_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_user_id, subscription_id, id),
  UNIQUE (owner_user_id, subscription_id, url),
  FOREIGN KEY (owner_user_id, subscription_id)
    REFERENCES kol_subscriptions(owner_user_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS kol_items_recent_idx
  ON kol_items(owner_user_id, subscription_id, published_at DESC);
