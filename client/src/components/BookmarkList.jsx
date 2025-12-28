import React from 'react'
import { API } from '../api'

export default function BookmarkList({ items = [], onRefresh, onPin, onArchive, onEdit }) {
  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url)
      alert('Copied URL')
    } catch (err) {
      alert('Copy failed')
    }
  }

  if (!items.length) return <div className="text-sm text-slate-500">No bookmarks yet</div>

  return (
    <div>
      {items.map(b => (
        <div key={b._id} className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-3">
              <img
                className="w-4 h-4"
                src={(() => {
                  // Avoid using gstatic's faviconV2 URLs (they sometimes 404).
                    // Avoid any faviconV2/gstatic proxy URLs (t2/t3 ...) which sometimes 404.
                    if (b.favicon && !b.favicon.includes('faviconV2') && !b.favicon.includes('gstatic.com')) return b.favicon
                  try {
                    const host = new URL(b.url).hostname
                    return 'https://www.google.com/s2/favicons?domain=' + host
                  } catch (e) {
                    return '/favicon.svg'
                  }
                })()}
                alt="f"
                width={16}
                height={16}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/favicon.svg' }}
              />
              <a className="text-blue-600 font-medium dark:text-blue-300" href={`${API}/r/${b._id}`} target="_blank" rel="noreferrer">{b.title}</a>
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-auto flex gap-2">
              <button className="btn btn-ghost" onClick={() => onEdit && onEdit(b)}>Edit</button>
              <button className="btn btn-ghost" onClick={() => copyUrl(b.url)}>Copy</button>
              <button className="btn btn-ghost" onClick={() => onPin && onPin(b._id, !b.pinned)}>{b.pinned ? 'Unpin' : 'Pin'}</button>
              <button className="btn btn-ghost" onClick={() => onArchive && onArchive(b._id, !b.archived)}>{b.archived ? 'Unarchive' : 'Archive'}</button>
            </div>
          </div>
          {b.description && <div className="text-sm text-slate-600 mt-2">{b.description}</div>}
          <div className="mt-2">{(b.tags || []).map(t => <span key={t} className="inline-block mr-2 text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{t}</span>)}</div>
        </div>
      ))}
    </div>
  )
}
