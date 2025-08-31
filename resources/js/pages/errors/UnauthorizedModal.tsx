import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

type Props = {
  show: boolean
  onClose: () => void
  message?: string
}

export default function UnauthorizedModal({ show, onClose, message }: Props) {
    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <ShieldAlert className="h-6 w-6" />
                        Unauthorized
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mt-2">
                    {message ?? "You are not allowed to perform this action."}
                </p>
                <div className="flex justify-end mt-4">
                    <Button onClick={onClose} className="bg-blue-600 text-white">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
