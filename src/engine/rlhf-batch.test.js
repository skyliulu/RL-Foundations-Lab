import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRlhfBatchContract } from './rlhf-batch.js'

test('RLHF batch contract keeps provenance, shapes, masks, and model versions aligned', () => {
  const terminated = buildRlhfBatchContract({ selectedId: 'A' })
  assert.equal(terminated.rows.length, terminated.shape.sequence)
  assert.equal(terminated.tensors.every((tensor) => tensor.version && tensor.producer), true)
  assert.equal(terminated.versions.find((item) => item.role === 'rollout / old').version, 'policy_v12')
  assert.equal(terminated.versions.find((item) => item.role === 'current policy').version, 'policy_v13')
  const terminalRow = terminated.rows.find((row) => row.terminal)
  assert.ok(terminalRow)
  assert.equal(terminalRow.bootstrap, 0)
  assert.equal(terminalRow.loss, 1)

  const truncated = buildRlhfBatchContract({ selectedId: 'B' })
  const truncatedRow = truncated.rows.find((row) => row.truncated)
  assert.ok(truncatedRow)
  assert.equal(truncatedRow.bootstrap, 1)
  assert.equal(truncatedRow.loss, 1)
  assert.equal(truncated.rows.filter((row) => row.token === 'PAD').every((row) => row.attention === 0 && row.loss === 0), true)

  const lag = buildRlhfBatchContract({ selectedId: 'A', fault: 'workerLag' })
  assert.ok(lag.ratioFactor > 1)
  assert.equal(lag.tensors.find((t) => t.name === 'old_logp').faulted, true)

  const drift = buildRlhfBatchContract({ selectedId: 'A', fault: 'refDrift' })
  assert.ok(drift.klFactor < 0.5)
  assert.equal(drift.versions.find((v) => v.role === 'reference').faulted, true)

  const maskBug = buildRlhfBatchContract({ selectedId: 'A', fault: 'maskBug' })
  assert.equal(maskBug.rows.some((r) => r.padLeak && r.loss === 1), true)
  assert.equal(maskBug.rows.find((r) => r.terminal).bootstrap, 1)
})
