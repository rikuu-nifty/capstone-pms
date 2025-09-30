// pages/audit-trail/FiltersModal.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface FiltersModalProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: AuditLogFilters) => void;
    initialFilters?: AuditLogFilters;
}

export type AuditLogFilters = {
    from?: string;
    to?: string;
    actor_id?: string;
    action?: string;
    subject_type?: string;
};

export default function FiltersModal({ open, onClose, onApply, initialFilters }: FiltersModalProps) {
    const [filters, setFilters] = useState<AuditLogFilters>({});

    // Set defaults when modal first opens
    useEffect(() => {
        if (open) {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);

            setFilters({
                from: initialFilters?.from || sevenDaysAgo.toISOString().split('T')[0],
                to: initialFilters?.to || today.toISOString().split('T')[0],
                actor_id: initialFilters?.actor_id || '',
                action: initialFilters?.action || '',
                subject_type: initialFilters?.subject_type || '',
            });
        }
    }, [open, initialFilters]);

    function handleApply() {
        onApply(filters);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Filter Audit Logs</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-sm font-medium">From</label>
                        <Input type="date" value={filters.from || ''} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">To</label>
                        <Input type="date" value={filters.to || ''} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Actor ID</label>
                        <Input
                            placeholder="Enter Actor/User ID"
                            value={filters.actor_id || ''}
                            onChange={(e) => setFilters({ ...filters, actor_id: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Action</label>
                        <select
                            className="w-full rounded border px-2 py-2"
                            value={filters.action || ''}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        >
                            <option value="">All Actions</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                            <option value="login_success">Login Success</option>
                            <option value="login_failed">Login Failed</option>
                            <option value="logout">Logout</option>
                            <option value="role_changed">Role Changed</option>
                            <option value="form_approved">Form Approved</option>
                            <option value="form_rejected">Form Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Subject Type</label>
                        <Input
                            placeholder="Enter Subject Type (e.g. User, Transfer)"
                            value={filters.subject_type || ''}
                            onChange={(e) => setFilters({ ...filters, subject_type: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
