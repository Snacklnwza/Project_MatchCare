import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const files = []
async function collect(directory) {
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) await collect(path)
    else if (/\.(jsx?|css|mjs|sql)$/.test(entry.name)) files.push(path)
  }
}
for (const directory of ['frontend/src', 'frontend/scripts', 'database', 'scripts']) {
  await collect(directory)
}
files.push('frontend/package.json', 'frontend/vite.config.js', 'frontend/index.html')
files.sort()
const sections = [
  '# MatchCare — Sprint 1 Source Snapshot',
  'สร้างใหม่ด้วย `node scripts/generate-review-snapshot.mjs` หลังแก้โค้ด เอกสารนี้เป็นสำเนาเพื่ออ่าน ไม่ใช่ไฟล์ที่นำไปรันโดยตรง',
  'อ่านผลตรวจและข้อจำกัดใน [SPRINT1_CODE_REVIEW.md](SPRINT1_CODE_REVIEW.md) ก่อน บางหน้าเป็น placeholder ของ Sprint ถัดไป',
  'รวมโค้ดแอป, config, SQL, tests และ scripts ไม่รวม .env, credentials, dependency, lockfile, ภาพ, build output และ JSON ข้อมูลพื้นที่ขนาดใหญ่ SHA-256 คำนวณหลังปรับ newline เป็น LF',
  '## รายการไฟล์\n\n' + files.map((file, index) => `${index + 1}. [${file}](../${file})`).join('\n'),
]
for (const file of files) {
  const source = (await readFile(resolve(root, file), 'utf8')).replace(/\r\n/g, '\n')
  const hash = createHash('sha256').update(source).digest('hex')
  const language = { js: 'javascript', mjs: 'javascript', jsx: 'jsx', sql: 'sql', css: 'css', json: 'json', html: 'html' }[file.split('.').at(-1)]
  const fence = '`'.repeat(Math.max(4, ...[...source.matchAll(/`+/g)].map(match => match[0].length + 1)))
  sections.push(`## ${file}\n\nSHA-256: \`${hash}\`\n\n${fence}${language}\n${source.trimEnd()}\n${fence}`)
}
await writeFile(resolve(root, 'docs/SPRINT1_SOURCE_SNAPSHOT.md'), sections.join('\n\n') + '\n')
console.log(`Generated snapshot: ${files.length} files`)
