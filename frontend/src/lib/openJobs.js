import { supabase } from './supabase'

export const JOB_PAGE_SIZE = 20

export async function searchOpenJobs(filters, page) {
  const { data, error } = await supabase.rpc('search_open_jobs', {
    p_province: filters.province || null,
    p_district: filters.district || null,
    p_work_date: filters.workDate || null,
    p_pay_unit: filters.payUnit || null,
    p_min_pay: filters.minimumPay === '' ? null : Number(filters.minimumPay),
    p_max_pay: filters.maximumPay === '' ? null : Number(filters.maximumPay),
    p_skill_id: filters.skillId === '' ? null : Number(filters.skillId),
    p_offset: page * JOB_PAGE_SIZE,
    p_limit: JOB_PAGE_SIZE + 1,
  })
  if (error) throw error
  return data ?? []
}

export async function loadJobSkillOptions() {
  const { data, error } = await supabase
    .from('skills')
    .select('id, name')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getOpenJobDetails(jobId) {
  const { data, error } = await supabase.rpc('get_open_job_details', {
    p_job_id: jobId,
  })
  if (error) throw error
  return data
}
