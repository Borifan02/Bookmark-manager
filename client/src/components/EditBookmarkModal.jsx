import React, { useState, useEffect } from 'react'

export default function EditBookmarkModal({ bookmark, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', url: '', description: '', tags: '' })

  useEffect(() => {
    if (bookmark) {
      setForm({
        title: bookmark.title || '',
        url: bookmark.url || '',
        description: bookmark.description || '',
        tags: (bookmark.tags || []).join(', ')
      })
    }
  }, [bookmark])

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    onSave(payload)
  }

  if (!bookmark) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white dark:bg-slate-800 rounded p-4 z-10 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Edit Bookmark</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input className="w-full border rounded px-2 py-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <input className="w-full border rounded px-2 py-1" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="URL" required />
          <input className="w-full border rounded px-2 py-1" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" />
          <textarea className="w-full border rounded px-2 py-1" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
