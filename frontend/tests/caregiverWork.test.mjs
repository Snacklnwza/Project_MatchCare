import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeCaregiverWork, workGroup, workMatches } from '../src/lib/caregiverWork.js'
import { groupSkills, skillCategory } from '../src/lib/skillCategories.js'

test('รวมคำเชิญและใบสมัครโดยเก็บแหล่งที่มาและไม่แสดงคำขอซ้ำ', () => {
  const rows = mergeCaregiverWork([{ request_id: 2 }, { request_id: '2' }], [{ request_id: 3 }])
  assert.deepEqual(rows.map(row => [row.request_id, row.request_type]), [[3, 'application'], ['2', 'invitation']])
})

test('แยกสถานะงานโดยไม่ถือคำขอที่ถูกปฏิเสธว่าเป็นงานที่ได้รับ', () => {
  for (const [status, job_status, expected] of [
    ['pending', 'open', 'waiting'], ['accepted', 'matched', 'matched'],
    ['accepted', 'in_progress', 'in_progress'], ['accepted', 'completion_pending', 'in_progress'],
    ['accepted', 'completed', 'ended'], ['accepted', 'cancelled', 'ended'],
    ['rejected', 'open', 'ended'], ['pending', 'closed', 'ended'], ['not_selected', 'matched', 'ended'],
  ]) {
    const row = { status, job_status }
    assert.equal(workGroup(row), expected)
    assert.equal(workMatches(row, 'current'), expected !== 'ended')
    assert.equal(workMatches(row, expected), true)
    assert.equal(workMatches(row, 'all'), true)
  }
})

test('จัดทุกทักษะเพียงหมวดเดียวและรองรับทักษะใหม่', () => {
  const skills = ['ช่วยอาบน้ำ', 'ช่วยใช้รถเข็น', 'ให้อาหารทางสายยาง', 'วัดความดันโลหิต', 'ฝึกความจำ', 'ทักษะใหม่']
    .map((name, id) => ({ id, name }))
  const groups = groupSkills(skills)
  assert.equal(groups.flatMap(group => group.skills).length, skills.length)
  assert.equal(new Set(groups.flatMap(group => group.skills).map(skill => skill.id)).size, skills.length)
  assert.deepEqual(skills.map(skill => skillCategory(skill.name).id), ['daily', 'movement', 'food', 'observation', 'communication', 'other'])
})
