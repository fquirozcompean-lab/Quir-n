'use client'

interface ChipSelectorProps {
  catalog: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function ChipSelector({ catalog, selected, onChange }: ChipSelectorProps) {
  function toggle(item: string) {
    onChange(
      selected.includes(item)
        ? selected.filter(s => s !== item)
        : [...selected, item]
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {catalog.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => toggle(item)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
            selected.includes(item)
              ? 'bg-teal text-white border-teal'
              : 'bg-teal-light text-navy border-border hover:border-teal'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
