const categories = [
  ['movement', 'การเคลื่อนไหวและย้ายตัว', /เดิน|รถเข็น|ไม้เท้า|บันได|ย้ายตัว|พยุง|พลิก|กายภาพ|เคลื่อนไหว/],
  ['food', 'อาหารและโภชนาการ', /อาหาร|สายยาง|น้ำดื่ม/],
  ['observation', 'เฝ้าสังเกตอาการและดูแลตามแผน', /เสมหะ|ยา|ความดัน|อุณหภูมิ|สังเกตอาการ|ปฐมพยาบาล|โรงพยาบาล/],
  ['communication', 'การสื่อสารและความจำ', /สื่อสาร|ได้ยิน|มองเห็น|ความจำ|หลงลืม|พูดคุย|เป็นเพื่อน/],
  ['daily', 'กิจวัตรประจำวันและความสะอาด', /อาบน้ำ|เช็ดตัว|แต่งตัว|ห้องน้ำ|ผ้าอ้อม|สะอาด|ช่องปาก|เสื้อผ้า|เครื่องนอน|ของใช้|ติดเตียง/],
]

export function skillCategory(name) {
  const match = categories.find(([, , pattern]) => pattern.test(name))
  return match ? { id: match[0], name: match[1] } : { id: 'other', name: 'การเดินทางและการดูแลอื่น ๆ' }
}

export function groupSkills(skills) {
  const groups = [...categories.map(([id, name]) => ({ id, name, skills: [] })),
    { id: 'other', name: 'การเดินทางและการดูแลอื่น ๆ', skills: [] }]
  for (const skill of skills) groups.find(group => group.id === skillCategory(skill.name).id).skills.push(skill)
  return groups.filter(group => group.skills.length)
}
