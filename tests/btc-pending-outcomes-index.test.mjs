import assert from 'node:assert/strict'
import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'

test('pending outcome index preserves selection and tracks completion/reopening', () => {
  const source = fs.readFileSync(new URL('../worker/btc-auto-trading.ts', import.meta.url), 'utf8')
  const query = source
    .slice(source.indexOf('const updateSignalOutcomes ='))
    .match(/`(SELECT[\s\S]*?)`/)[1]
  const columns = query
    .slice(7, query.indexOf('FROM'))
    .split(',')
    .map((value) => value.trim())
    .concat('market_source')
  const db = new DatabaseSync(':memory:')
  try {
    db.exec(
      `CREATE TABLE btc_auto_signal_history (${columns.map((name) => `${name} ${name === 'id' ? 'INTEGER PRIMARY KEY' : /action|observed_at|market_source/.test(name) ? 'TEXT' : 'REAL'}`).join(',')})`,
    )
    const insert = db.prepare(
      `INSERT INTO btc_auto_signal_history VALUES (${columns.map(() => '?').join(',')})`,
    )
    for (let i = 0; i < 1000; i++) {
      const values = Object.fromEntries(columns.map((name) => [name, 0]))
      Object.assign(values, {
        id: i,
        price: i % 17 ? 100 : 0,
        observed_at: new Date(i * 300000).toISOString(),
        market_source: i % 2 ? 'binance' : 'coinbase',
        action: i % 3 ? 'wait' : 'long',
        baseline_action: 'long',
        ensemble_action: 'short',
        shadow_stop_distance_pct: i % 11 ? 1 : null,
        shadow_target_distance_pct: 2,
      })
      if (i % 5 === 0) values.forward_24h_pct = null
      if (i % 7 === 0) values.baseline_forward_1h_pct = null
      if (i % 13 === 0) values.ensemble_path_1h_pct = null
      insert.run(...columns.map((name) => values[name]))
    }
    const args = { 1: 'binance', 2: '2026-09-18T07:00:00.000Z' }
    const before = db.prepare(query).all(args)
    db.exec(
      fs.readFileSync(
        new URL('../worker/migrations/0037_btc_auto_unresolved_outcomes.sql', import.meta.url),
        'utf8',
      ),
    )
    assert.deepEqual(db.prepare(query).all(args), before)
    assert.ok(
      db
        .prepare('EXPLAIN QUERY PLAN ' + query)
        .all(args)
        .some((row) => row.detail.includes('btc_auto_signal_unresolved_idx')),
    )
    db.exec(
      'UPDATE btc_auto_signal_history SET forward_24h_pct=0, baseline_forward_1h_pct=0, ensemble_path_1h_pct=0',
    )
    assert.equal(db.prepare(query).all(args).length, 0)
    db.exec('UPDATE btc_auto_signal_history SET baseline_forward_1h_pct=NULL WHERE id=99')
    assert.deepEqual(
      db
        .prepare(query)
        .all(args)
        .map((row) => row.id),
      [99],
    )
  } finally {
    db.close()
  }
})
