export function SourceBadge({ sourceType }: { sourceType: 'verified' | 'general' }) {
  if (sourceType === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
        ✓ Verified from our database
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
      ⚠ General guidance — please verify
    </span>
  )
}
