import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

process.chdir(fileURLToPath(new URL('../../', import.meta.url)))
const db = new PGlite()

// จำลองเฉพาะโครงสร้างที่ SQL ใช้ ไม่ใช่บริการ Auth/Storage HTTP จริง
const testEnvironment = `
  create role anon;
  create role authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id), name text,
    owner_id text, metadata jsonb, unique (bucket_id, name)
  );
  alter table storage.objects enable row level security;
  grant usage on schema storage to authenticated, anon;
  grant select, insert, update, delete on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[]
  language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1]
  $$;
`

async function runFile(folder, file) {
  await db.exec(fs.readFileSync(`${folder}/${file}`, 'utf8'))
  console.log('PASS', `${folder}/${file}`)
}

try {
  await db.exec(testEnvironment)
  const upgradeFrom = process.argv.find(arg => arg.startsWith('--upgrade-from='))?.split('=')[1]
  if (upgradeFrom) {
    // จำลองฐานก่อนหน้า แล้วใช้เฉพาะ migration ใหม่ เพื่อตรวจว่าฐานเดิมอัปเกรดได้จริง
    const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
    const oldSchemas = git('ls-tree', '-r', '--name-only', upgradeFrom, 'database/schema')
      .split('\n').filter(file => file.endsWith('.sql')).sort()
    if (!oldSchemas.length) throw new Error('ไม่พบ schema ใน commit ที่ระบุ')
    for (const file of oldSchemas) await db.exec(git('show', `${upgradeFrom}:${file}`))
    const oldMigrations = new Set(git('ls-tree', '-r', '--name-only', upgradeFrom, 'supabase/migrations').split('\n'))
    const migrations = fs.readdirSync('supabase/migrations').filter(file =>
      file.endsWith('.sql') && !oldMigrations.has(`supabase/migrations/${file}`)).sort()
    for (const file of migrations) await runFile('supabase/migrations', file)
  } else {
    const schemas = fs.readdirSync('database/schema')
      .filter((file) => file.endsWith('.sql')).sort()
    for (const file of schemas) await runFile('database/schema', file)
  }

  const tests = [
    'catalog_test.sql',
    'caregiver_search_test.sql',
    'matching_search_test.sql',
    'job_search_test.sql',
    'job_application_test.sql',
    'job_review_test.sql',
    'workflow_integration_test.sql',
    'sprint1_integration_test.sql',
  ]
  for (const file of tests) await runFile('database/tests', file)
} catch (error) {
  console.error('FAIL', error.message, error.detail ?? '')
  process.exitCode = 1
} finally {
  await db.close()
}
