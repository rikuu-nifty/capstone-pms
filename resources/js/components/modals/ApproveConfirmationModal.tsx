import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

type Props = {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** e.g. "PMO Head" — your existing mapping */
  actorLabel?: string | null;
  /** e.g. "Approved By (Dean/Head)" — we'll extract "Dean/Head" */
  stepLabel?: string | null;
  title?: string;
  message?: string;
};

function roleFrom(stepLabel?: string | null, actorLabel?: string | null): string {
  if (stepLabel) {
    const m = stepLabel.match(/\(([^)]+)\)/);
    if (m?.[1]) return m[1].trim();
    // fallback: strip common prefixes if no parentheses found
    const stripped = stepLabel.replace(/^(Prepared By|Approved By|Noted By)\s*/i, '').trim();
    if (stripped) return stripped;
  }
  return actorLabel ?? '—';
}

export default function ApproveConfirmationModal({
  show,
  onConfirm,
  onCancel,
  actorLabel,
  stepLabel,
  title,
  message,
}: Props) {
  const actor = roleFrom(stepLabel, actorLabel);
  const resolvedTitle = title ?? `Approve as ${actor}`;
  const resolvedMessage = message ?? 'Are you sure you want to approve this item?';

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>

        {/* Title/Desc */}
        <DialogHeader className="items-center space-y-2">
          <DialogTitle className="text-2xl font-semibold">{resolvedTitle}</DialogTitle>
          <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
            {resolvedMessage}
          </DialogDescription>
        </DialogHeader>

        {/* Footer */}
        <DialogFooter>
          <div className="flex w-full justify-center gap-4">
            <DialogClose asChild>
              <Button variant="outline" className="px-6 cursor-pointer">Cancel</Button>
            </DialogClose>
            <Button onClick={onConfirm} className="px-6 cursor-pointer">Approve</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
