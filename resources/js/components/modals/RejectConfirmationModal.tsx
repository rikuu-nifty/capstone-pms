import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';

type Props = {
  show: boolean;
  onConfirm: (notes?: string) => void;
  onCancel: () => void;
  /** e.g. "PMO Head" — your existing mapping */
  actorLabel?: string | null;
  /** e.g. "Approved By (Dean/Head)" — we'll extract "Dean/Head" */
  stepLabel?: string | null;
  title?: string;
  message?: string;
  defaultNotes?: string;
  requireNotes?: boolean; // set true if you want to force a reason
};

function roleFrom(stepLabel?: string | null, actorLabel?: string | null): string {
  if (stepLabel) {
    const m = stepLabel.match(/\(([^)]+)\)/);
    if (m?.[1]) return m[1].trim();
    // fallback: strip common prefixes if no parentheses found
    const stripped = stepLabel.replace(/^(Prepared By|Approved By|Noted By|Issued By)\s*/i, '').trim();
    if (stripped) return stripped;
  }
  return actorLabel ?? '—';
}

export default function RejectConfirmationModal({
  show,
  onConfirm,
  onCancel,
  actorLabel,
  stepLabel,
  title,
  message,
  defaultNotes = '',
  requireNotes = false,
}: Props) {
  const [notes, setNotes] = useState(defaultNotes);
  const actor = roleFrom(stepLabel, actorLabel);

  useEffect(() => {
    if (show) setNotes(defaultNotes);
  }, [show, defaultNotes]);

  const resolvedTitle = title ?? `Reject as ${actor}`;
  const resolvedMessage = message ?? 'Are you sure you want to reject this item?';

  const handleConfirm = () => {
    if (requireNotes && !notes.trim()) {
      alert('Please provide a brief reason for rejection.');
      return;
    }
    onConfirm(notes.trim() || undefined);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>

        {/* Title/Desc */}
        <DialogHeader className="items-center space-y-2">
          <DialogTitle className="text-2xl font-semibold">{resolvedTitle}</DialogTitle>
          <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
            {resolvedMessage}
          </DialogDescription>
        </DialogHeader>

        {/* Notes */}
        <div className="text-left">
          <Label htmlFor="reject-notes" className="text-sm">
            Reason / Notes {requireNotes && '(required)'}
          </Label>
          <Textarea
            id="reject-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why is this being rejected?"
          />
        </div>

        {/* Footer */}
        <DialogFooter>
          <div className="flex w-full justify-center gap-4">
            <DialogClose asChild>
              <Button variant="outline" className="px-6 cursor-pointer">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirm} className="px-6 cursor-pointer">
              Reject
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
