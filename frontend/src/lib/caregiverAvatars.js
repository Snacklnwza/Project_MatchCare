import { supabase } from './supabase'

const bucket = supabase.storage.from('caregiver-avatars')
const extensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function avatarSelectionError(file) {
  return !file || !extensions[file.type] || file.size < 1 || file.size > 10485760
    ? 'เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB'
    : ''
}

export async function signedAvatarUrl(path) {
  if (!path) return ''
  const { data, error } = await bucket.createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function loadCaregiverAvatarUrls(ids) {
  if (!ids.length) return {}
  const { data: paths, error: pathError } = await supabase.rpc(
    'get_caregiver_avatar_paths', { p_caregiver_ids: ids },
  )
  if (pathError) throw pathError
  if (!paths?.length) return {}

  const { data: urls, error: urlError } = await bucket.createSignedUrls(
    paths.map((item) => item.avatar_path), 3600,
  )
  if (urlError) throw urlError
  return Object.fromEntries(paths.flatMap((item, index) =>
    urls[index]?.signedUrl ? [[item.caregiver_id, urls[index].signedUrl]] : [],
  ))
}

export async function saveOwnAvatar(caregiverId, file, oldPath) {
  const extension = extensions[file?.type]
  if (!extension || file.size < 1 || file.size > 2097152) {
    throw new Error('เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 2 MB')
  }
  const path = `${caregiverId}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await bucket.upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data, error: saveError } = await supabase
    .from('caregiver_profiles')
    .update({ avatar_path: path })
    .eq('caregiver_id', caregiverId)
    .select('avatar_path')
    .single()
  if (saveError) {
    await bucket.remove([path])
    throw saveError
  }
  const { error: cleanupError } = oldPath
    ? await bucket.remove([oldPath]) : { error: null }
  return { path: data.avatar_path, cleanupFailed: Boolean(cleanupError) }
}

export async function removeOwnAvatar(caregiverId, path) {
  const { error: saveError } = await supabase
    .from('caregiver_profiles')
    .update({ avatar_path: null })
    .eq('caregiver_id', caregiverId)
    .select('avatar_path')
    .single()
  if (saveError) throw saveError
  const { error: removeError } = await bucket.remove([path])
  return { cleanupFailed: Boolean(removeError) }
}
