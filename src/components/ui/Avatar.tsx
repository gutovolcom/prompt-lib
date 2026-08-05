interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
}

export function Avatar({ name, avatarUrl, size = 32 }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar de ${name}`}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      aria-label={`Avatar de ${name}`}
      className="flex items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-text-2 ring-1 ring-border"
      style={{ width: size, height: size }}
    >
      {initials || '?'}
    </div>
  )
}
