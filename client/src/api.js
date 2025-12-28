export const API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000'

function buildQuery(params = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.tags && params.tags.length) qs.set('tags', params.tags.join(','))
  if (typeof params.archived !== 'undefined') qs.set('archived', String(params.archived))
  if (params.sort) qs.set('sort', params.sort)
  return qs.toString()
}

export async function fetchBookmarks(params = {}) {
  const q = buildQuery(params)
  const res = await fetch(`${API}/bookmarks${q ? '?' + q : ''}`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchTags() {
  const res = await fetch(`${API}/tags`)
  if (!res.ok) return []
  return res.json()
}

export async function createBookmark(payload) {
  const res = await fetch(`${API}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  let json = null
  try { json = await res.json() } catch (e) { /* ignore */ }
  if (!res.ok) {
    const err = new Error((json && json.error) || 'Request failed')
    err.status = res.status
    throw err
  }
  return json
}

export async function checkBookmarkExists(url) {
  const res = await fetch(`${API}/bookmarks/exists?url=${encodeURIComponent(url)}`)
  if (!res.ok) return { exists: false }
  return res.json()
}

export async function fetchMetadata(url) {
  const res = await fetch(`${API}/metadata`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  if (!res.ok) return null
  return res.json()
}

export async function setPinned(id, pinned = true) {
  const res = await fetch(`${API}/bookmarks/${id}/pin`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pinned })
  })
  return res.json()
}

export async function setArchived(id, archived = true) {
  const res = await fetch(`${API}/bookmarks/${id}/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archived })
  })
  return res.json()
}

export async function updateBookmark(id, payload) {
  const res = await fetch(`${API}/bookmarks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}
