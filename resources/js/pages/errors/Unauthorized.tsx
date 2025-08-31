import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ShieldAlert } from 'lucide-react'
import { type ReactNode } from 'react'

type UnauthorizedModalProps = {
    show: boolean
    onClose: () => void
    title?: string
    message?: ReactNode
    primaryActionLabel?: string
    onPrimaryAction?: () => void
}

export default function UnauthorizedModal({
    show,
    onClose,
    title = 'Unauthorized Action',
    message = 'You are not allowed to perform this action.',
    primaryActionLabel,
    onPrimaryAction,
    }: UnauthorizedModalProps) {

    return (
        <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md space-y-4 p-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <ShieldAlert className="h-16 w-16 text-red-500" />
                </div>

                {/* Title & Description */}
                <DialogHeader className="items-center space-y-2">
                    <DialogTitle className="text-2xl font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-base leading-snug text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {/* Footer */}
                <DialogFooter>
                    <div className="flex w-full justify-center gap-4">
                        <DialogClose asChild>
                            <Button variant="outline" className="px-6 cursor-pointer">
                                Close
                            </Button>
                        </DialogClose>

                        {primaryActionLabel && onPrimaryAction && (
                        <Button
                            className="px-6 cursor-pointer"
                            onClick={onPrimaryAction}
                        >
                            {primaryActionLabel}
                        </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
