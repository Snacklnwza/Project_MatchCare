import assert from 'node:assert/strict'
import test from 'node:test'
import { cropPlacement } from '../src/lib/avatarCrop.js'

test('ภาพแนวนอนครอบเต็มกรอบและเลื่อนไปได้ถึงขอบทั้งสองด้าน', () => {
  const left = cropPlacement(320, 640, 320, 1, 1, 0)
  const right = cropPlacement(320, 640, 320, 1, -1, 0)
  assert.equal(Math.abs(left.x), 0)
  assert.deepEqual([left.width, left.height], [640, 320])
  assert.equal(right.x, -320)
})

test('ภาพแนวตั้งขยายแล้วเลื่อนขึ้นลงโดยไม่เหลือช่องว่าง', () => {
  const top = cropPlacement(320, 320, 640, 1.5, 0, 1)
  const bottom = cropPlacement(320, 320, 640, 1.5, 0, -1)
  assert.equal(Math.abs(top.y), 0)
  assert.equal(bottom.y + bottom.height, 320)
  assert.ok(top.width >= 320 && top.height >= 320)
})
