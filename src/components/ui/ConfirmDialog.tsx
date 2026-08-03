import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-[var(--overlay)]"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative z-10 w-full max-w-sm animate-scale-in rounded-card bg-surface p-6 shadow-lg">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-text-2">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={loading} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" disabled={loading} onClick={onConfirm}>
            {loading ? 'Excluindo...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
