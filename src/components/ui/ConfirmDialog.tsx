import { AnimatedModal } from './AnimatedModal'
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
  return (
    <AnimatedModal
      open={open}
      role="alertdialog"
      ariaLabel={title}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-4"
      panelClassName="w-full max-w-sm rounded-card border border-border bg-surface p-6 shadow-lg"
      onBackdropClick={loading ? undefined : onCancel}
    >
      <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-text-2">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={loading} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" disabled={loading} onClick={onConfirm}>
          {loading ? 'Excluindo...' : confirmLabel}
        </Button>
      </div>
    </AnimatedModal>
  )
}
