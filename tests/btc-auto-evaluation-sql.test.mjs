import assert from 'node:assert/strict'
import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'

test('covering evaluation index preserves hourly samples, null outcomes and validation windows', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(`CREATE TABLE btc_auto_signal_history (
    id INTEGER PRIMARY KEY, signal_model_version TEXT, observed_at TEXT,
    baseline_action TEXT, ensemble_action TEXT, ensemble_regime TEXT,
    baseline_path_1h_pct REAL, ensemble_path_1h_pct REAL, baseline_score REAL)`)
  const insert = db.prepare('INSERT INTO btc_auto_signal_history VALUES (?,?,?,?,?,?,?,?,?)')
  for (let i = 0; i < 2400; i++) {
    insert.run(
      i,
      i % 13 ? 'v2' : 'old',
      new Date(i * 300000).toISOString(),
      i % 4 ? 'long' : 'wait',
      i % 3 ? 'short' : 'long',
      ['trending', 'ranging', 'volatile'][i % 3],
      i % 7 ? ((i % 9) - 4) / 10 : null,
      i % 11 ? ((i % 7) - 3) / 10 : null,
      i % 100,
    )
  }
  const source = fs.readFileSync(new URL('../worker/btc-auto-trading.ts', import.meta.url), 'utf8')
  const queries = ['strategyComparison', 'scoreThresholdStudy', 'consensusStudy'].map(
    (name) => source.slice(source.indexOf(`const ${name} =`)).match(/`(WITH[\s\S]*?)`/)[1],
  )
  const params = [
    { 1: 'v2', 2: null, 3: 0.1 },
    { 1: 'v2', 2: 60, 3: 70, 4: 0.1 },
    { 1: 'v2', 2: 0.1 },
  ]
  const originalQueries = queries.map((q) =>
    q
      .replace('hourly AS NOT MATERIALIZED', 'hourly AS')
      .replace(
        'SELECT observed_at, baseline_path_1h_pct, ensemble_path_1h_pct\n       FROM',
        'SELECT * FROM',
      )
      .replace(
        'SELECT observed_at, baseline_action, ensemble_action, baseline_path_1h_pct\n       FROM',
        'SELECT * FROM',
      )
      .replace(
        'SELECT observed_at, baseline_score, baseline_path_1h_pct, ROW_NUMBER()',
        'SELECT *, ROW_NUMBER()',
      ),
  )
  const before = originalQueries.map((q, i) => db.prepare(q).get(params[i]))
  db.exec(
    fs.readFileSync(
      new URL('../worker/migrations/0036_btc_auto_evaluation_covering_index.sql', import.meta.url),
      'utf8',
    ),
  )
  queries.forEach((q, i) => {
    assert.deepEqual(db.prepare(q).get(params[i]), before[i])
    const plan = db.prepare('EXPLAIN QUERY PLAN ' + q).all(params[i])
    assert.ok(
      plan.some((row) => row.detail.includes('COVERING INDEX btc_auto_signal_evaluation_idx')),
    )
  })
  const baseline = JSON.parse(
    fs.readFileSync(
      new URL('./fixtures/btc-evaluation-before-single-pass.json', import.meta.url),
      'utf8',
    ),
  )
  // Same timestamp must still contribute at most one hourly sample.
  db.exec(
    'UPDATE btc_auto_signal_history SET observed_at = (SELECT observed_at FROM btc_auto_signal_history WHERE id = 121) WHERE id = 122',
  )
  for (const limit of [2400, 288, 120, 0]) {
    db.prepare('DELETE FROM btc_auto_signal_history WHERE id >= ?').run(limit)
    for (const model of ['v2', 'old', 'missing']) {
      for (const regime of [null, 'trending', 'ranging', 'volatile', 'missing']) {
        for (const cost of [0, 0.1, 1]) {
          const args = { 1: model, 2: regime, 3: cost }
          assert.deepEqual(
            db.prepare(queries[0]).get(args),
            db.prepare(baseline.strategyComparison).get(args),
          )
          const consensusArgs = { 1: model, 2: cost }
          assert.deepEqual(
            db.prepare(queries[2]).get(consensusArgs),
            db.prepare(baseline.consensusStudy).get(consensusArgs),
          )
        }
      }
    }
  }
  db.close()
})
