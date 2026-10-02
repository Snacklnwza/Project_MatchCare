import { supabase } from './supabase'

export const CAREGIVER_PAGE_SIZE = 20

export async function searchCaregivers(filters, page) {
  const { data, error } = await supabase.rpc('search_caregivers', {
    p_province: filters.province || null,
    p_district: filters.district || null,
    p_skill_id: filters.skillId ? Number(filters.skillId) : null,
    p_min_experience: filters.minExperience === '' ? null : Number(filters.minExperience),
    p_max_experience: filters.maxExperience === '' ? null : Number(filters.maxExperience),
    p_offset: page * CAREGIVER_PAGE_SIZE,
    p_limit: CAREGIVER_PAGE_SIZE + 1,
  })
  if (error) throw error
  return data ?? []
}
