import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, User, CheckCircle2, XCircle } from 'lucide-react';
import { AuditLog } from './index';
import { renderChanges } from './renderChanges';

// Helper to make action names friendly
function formatAction(action: string): string {
  const map: Record<string, string> = {
    login_failed: 'Login Failed',
    login_success: 'Login Success',
    logout: 'Logout',
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    form_approved: 'Form Approved',
    form_rejected: 'Form Rejected',
    role_changed: 'Role Changed',
  };

  return map[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LogCard({
  log,
  expanded,
  onToggle,
}: {
  log: AuditLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Normalize status for security logs
  const computedStatus =
    log.action === 'login_failed'
      ? 'failed'
      : log.action === 'login_success' || log.action === 'logout'
      ? 'success'
      : log.status || 'success';

  return (
    <div className="rounded-lg border p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <User className="h-6 w-6 text-blue-500" />
          <div>
            <div className="font-medium">
              {formatAction(log.action)} — {log.subject_type}
            </div>
            <div className="text-sm text-muted-foreground">
              {log.actor_name || 'System'} • {new Date(log.created_at).toLocaleString()}{' '}
              {log.unit_or_department?.name ? `• ${log.unit_or_department.name}` : ''}
            </div>
          </div>
        </div>

        {/* Custom pill-style badges */}
        {computedStatus === 'failed' ? (
          <div className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
            <XCircle className="h-4 w-4" />
            Failed
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Success
          </div>
        )}
      </div>

      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={onToggle} className="flex items-center gap-1">
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> Hide changes
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> View changes
            </>
          )}
        </Button>

        {expanded && (
          <div className="mt-2 rounded-md border bg-gray-50 p-3 text-sm">
            {renderChanges(log)}
          </div>
        )}
      </div>
    </div>
  );
}
