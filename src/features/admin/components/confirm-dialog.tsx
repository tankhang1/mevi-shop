import type { ReactNode } from 'react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Controlled confirmation; the caller closes it after onConfirm settles so the button can show progress. */
export function ConfirmDialog({ open, title, description, confirmLabel = 'Xác nhận', danger, pending, onConfirm, onCancel }: ConfirmDialogProps) {
  return <AlertDialog open={open} onOpenChange={o => { if (!o && !pending) onCancel(); }}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription asChild><div className="text-sm text-muted-foreground">{description}</div></AlertDialogDescription>}
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending} data-testid="button-confirm-cancel">Huỷ</AlertDialogCancel>
        <button className={danger ? 'btn-danger min-h-10 px-5 text-sm' : 'btn-primary min-h-10'} disabled={pending} onClick={onConfirm} data-testid="button-confirm-ok">
          {pending ? 'Đang xử lý...' : confirmLabel}
        </button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
