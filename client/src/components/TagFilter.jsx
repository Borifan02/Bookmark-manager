import React from 'react'

export default function TagFilter({ tags = [], selected = new Set(), onToggle }) {
  return (
    <div className="mb-3">
      {tags.map(t => {
        const active = selected.has(t.tag)
        return (
          <button
            key={t.tag}
            onClick={() => onToggle(t.tag)}
            className={`inline-block mr-2 mb-2 px-2 py-1 rounded text-sm ${active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}
          >
            {t.tag} {t.count ? `(${t.count})` : ''}
          </button>
        )
      })}
    </div>
  )
}
