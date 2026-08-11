CREATE TABLE IF NOT EXISTS technical_indicator_config_versions (
  version INTEGER PRIMARY KEY AUTOINCREMENT,
  formula_version TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_technical_indicator_config_created_at
  ON technical_indicator_config_versions(created_at DESC);

INSERT INTO technical_indicator_config_versions (
  formula_version,
  config_json,
  created_by,
  created_at
)
SELECT
  'technical-core-v1',
  '{"enabled":{"maShort":true,"maLong":true,"macd":true,"rsi":true,"bollinger":true,"atr":true,"volume":true,"crossAsset":true},"parameters":{"maShortPeriod":20,"maLongPeriod":60,"macdFastPeriod":12,"macdSlowPeriod":26,"macdSignalPeriod":9,"rsiPeriod":14,"rsiOverbought":70,"rsiOversold":30,"bollingerPeriod":20,"bollingerMultiplier":2,"atrPeriod":14,"supportResistanceWindow":60},"weights":{"trend":0.4,"momentum":0.22,"volatility":0.13,"volume":0.1,"crossAsset":0.15},"display":{"carouselIntervalMs":7000,"carouselAutoPlay":true,"defaultRange":"year"},"sourcePriority":["Massive","FRED","新浪财经","腾讯财经","DefiLlama"]}',
  NULL,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE NOT EXISTS (SELECT 1 FROM technical_indicator_config_versions);
