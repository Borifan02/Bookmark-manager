import React, { useEffect, useState } from 'react'
import { fetchBookmarks, createBookmark, fetchTags, fetchMetadata, setPinned, setArchived, checkBookmarkExists, updateBookmark } from './api'
import BookmarkList from './components/BookmarkList'
import TagFilter from './components/TagFilter'
import EditBookmarkModal from './components/EditBookmarkModal'

export default function App() {
  const [bookmarks, setBookmarks] = useState([])
  const [form, setForm] = useState({ title: '', url: '', description: '', tags: '' })
  const [tagsList, setTagsList] = useState([])
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recentlyAdded')
  const [urlValid, setUrlValid] = useState(true)
  const [duplicateInfo, setDuplicateInfo] = useState(null)
  const debounceRef = React.useRef(null)
  const checkDupRef = React.useRef(null)
  const [editing, setEditing] = useState(null)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    load()
    loadTags()
    // initialize theme from localStorage or system preference
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
      if (stored === 'dark') document.documentElement.classList.add('dark')
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        setTheme('dark')
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  async function load(params = {}) {
    const p = { ...params }
    if (!('search' in p)) p.search = search
    if (!('tags' in p)) p.tags = Array.from(selectedTags)
    if (!('sort' in p)) p.sort = sort
    const res = await fetchBookmarks(p)
    setBookmarks(res || [])
  }

  async function loadTags() {
    const t = await fetchTags()
    setTagsList(t || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!urlValid) return alert('Please enter a valid URL')
    if (duplicateInfo) return alert('A bookmark with this URL already exists')
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    payload.url = normalizeUrl(payload.url)
    try {
      await createBookmark(payload)
    } catch (err) {
      // if duplicate, show friendly message, otherwise alert
      if (err && err.message && err.message.toLowerCase().includes('already exists')) {
        return alert('A bookmark with this URL already exists')
      }
      return alert('Error: ' + (err && err.message ? err.message : 'Unknown error'))
    }
    setForm({ title: '', url: '', description: '', tags: '' })
    setDuplicateInfo(null)
    load()
    loadTags()
  }

  async function fetchMetaForUrl() {
    if (!form.url) return
    const m = await fetchMetadata(form.url)
    if (m) setForm(prev => ({ ...prev, title: prev.title || m.title || '', favicon: m.favicon || '' }))
  }

  async function handlePin(id, pinned) {
    await setPinned(id, pinned)
    load()
  }

  async function handleArchive(id, archived) {
    await setArchived(id, archived)
    load()
    loadTags()
  }

  function toggleTag(tag) {
    const s = new Set(selectedTags)
    if (s.has(tag)) s.delete(tag)
    else s.add(tag)
    setSelectedTags(s)
    load({ tags: Array.from(s) })
  }

  function onSearchChange(v) {
    setSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load({ search: v })
    }, 350)
  }

  // URL validation + duplicate detection
  async function onUrlChange(v) {
    setForm(prev => ({ ...prev, url: v }))
    const normalized = normalizeUrl(v)
    try {
      new URL(normalized)
      setUrlValid(true)
    } catch (e) {
      setUrlValid(false)
    }

    if (checkDupRef.current) clearTimeout(checkDupRef.current)
    checkDupRef.current = setTimeout(async () => {
      if (!v) return setDuplicateInfo(null)
      try {
        const res = await checkBookmarkExists(normalized)
        setDuplicateInfo(res.exists ? res.bookmark : null)
      } catch (e) {
        setDuplicateInfo(null)
      }
    }, 400)
  }

  function normalizeUrl(u) {
    if (!u) return u
    try {
      const parsed = new URL(u)
      return parsed.toString()
    } catch (e) {
      try {
        const parsed = new URL('http://' + u)
        return parsed.toString()
      } catch (e2) {
        return u
      }
    }
  }

  function onSortChange(v) {
    setSort(v)
    load({ sort: v })
  }

  function openEdit(bm) {
    setEditing(bm)
  }

  function closeEdit() {
    setEditing(null)
  }

  async function handleEditSave(payload) {
    if (!editing) return
    payload.url = normalizeUrl(payload.url)
    const res = await updateBookmark(editing._id, payload)
    if (res && res.error) return alert('Error: ' + res.error)
    closeEdit()
    load()
    loadTags()
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  async function seedSampleBookmarks() {
    const samples = [
      { title: 'Example', url: 'https://example.com', description: 'Example site', tags: ['example', 'sample'] },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Documentation for web developers', tags: ['docs', 'web'] }
    ]
    for (const s of samples) {
      try {
        const norm = normalizeUrl(s.url)
        const exists = await checkBookmarkExists(norm)
        if (exists && exists.exists) continue
        await createBookmark({ ...s, tags: s.tags })
      } catch (e) {
        // ignore individual errors
      }
    }
    await load()
    await loadTags()
  }

  return (
    <div className="app-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Bookmark Manager (Demo)</h1>
        <div>
          <div
            role="switch"
            tabIndex={0}
            aria-checked={theme === 'dark'}
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); } }}
            className={`w-14 h-8 p-1 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mb-4 form-row">
        <input className="border rounded px-2 py-1 flex-1" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <input className="border rounded px-2 py-1" placeholder="URL" value={form.url} onChange={e => onUrlChange(e.target.value)} required />
          <button type="button" onClick={fetchMetaForUrl} className="btn btn-ghost">Fetch</button>
        </div>
        <div className="w-full sm:w-auto">
          {!urlValid && <div className="text-sm text-red-600 mt-1">Invalid URL format</div>}
          {urlValid && duplicateInfo && <div className="text-sm text-yellow-700 mt-1">Duplicate detected</div>}
        </div>
        <input className="border rounded px-2 py-1" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <button type="submit" className="btn btn-primary" disabled={!urlValid || !!duplicateInfo}>Add</button>
      </form>

      <div className="mb-3">
        <input className="border rounded px-2 py-1 w-full" placeholder="Search by title..." value={search} onChange={e => onSearchChange(e.target.value)} />
      </div>

      <TagFilter tags={tagsList} selected={selectedTags} onToggle={toggleTag} />

      <div className="mb-3 flex gap-4 items-center">
        <div>
          <label className="mr-2">
            <input type="checkbox" onChange={e => load({ archived: e.target.checked })} /> <span className="ml-2">Show archived</span>
          </label>
        </div>
        <div>
          <label className="mr-2">Sort:</label>
          <select className="border rounded px-2 py-1" value={sort} onChange={e => onSortChange(e.target.value)}>
            <option value="recentlyAdded">Recently added</option>
            <option value="mostVisited">Most visited</option>
            <option value="recentlyVisited">Recently visited</option>
          </select>
        </div>
      </div>

      {duplicateInfo && (
        <div className="p-2 bg-red-50 border border-red-200 mb-3 rounded">
          A bookmark for this URL already exists: <a className="text-blue-600 underline" href={duplicateInfo.url} target="_blank" rel="noreferrer">{duplicateInfo.title || duplicateInfo.url}</a>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="p-6 border border-dashed rounded text-center text-slate-600">
          <p className="mb-3">No bookmarks found yet.</p>
          <p className="mb-4 text-sm">You can add a bookmark using the form above, or seed the app with sample bookmarks for demo purposes.</p>
          <div className="flex justify-center gap-2">
            <button className="btn btn-primary" onClick={seedSampleBookmarks}>Seed sample bookmarks</button>
            <button className="btn btn-ghost" onClick={() => load()}>Refresh</button>
          </div>
        </div>
      ) : (
        <BookmarkList items={bookmarks} onRefresh={() => load()} onPin={handlePin} onArchive={handleArchive} onEdit={openEdit} />
      )}

      <EditBookmarkModal bookmark={editing} onClose={closeEdit} onSave={handleEditSave} />
    </div>
  )
}
