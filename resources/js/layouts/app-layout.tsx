// import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
// import { type BreadcrumbItem } from '@/types';
// import { type ReactNode } from 'react';

// interface AppLayoutProps {
//     children: ReactNode;
//     breadcrumbs?: BreadcrumbItem[];
// }

// export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
//     <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
//         {children}
//     </AppLayoutTemplate>
// );

import UnauthorizedModal from '@/components/modals/UnauthorizedModal';
import { Toaster } from '@/components/ui/sonner'; // ✅ import Toaster
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

type UnauthorizedFlash = { message: string; time: number };
type FlashMessage = { message: string; time: number; title?: string; description?: string };
type ToastFlashKey = 'success' | 'error' | 'warning' | 'info' | 'status';
type ToastKind = 'success' | 'error' | 'warning' | 'info';
type AppFlash = Partial<Record<ToastFlashKey, FlashMessage | null>> & {
    unauthorized?: UnauthorizedFlash | null;
};

const fallbackToastCopy: Record<ToastFlashKey, { kind: ToastKind; title: string; description: string }> = {
    success: {
        kind: 'success',
        title: 'Action completed',
        description: 'Your changes have been saved successfully.',
    },
    error: {
        kind: 'error',
        title: 'Action failed',
        description: 'The request could not be completed. Please try again.',
    },
    warning: {
        kind: 'warning',
        title: 'Please review',
        description: 'This action needs your attention before continuing.',
    },
    info: {
        kind: 'info',
        title: 'Information',
        description: 'Here is the latest system update.',
    },
    status: {
        kind: 'info',
        title: 'Status updated',
        description: 'The system status has been updated.',
    },
};

const toastEntityRules: Array<[RegExp, string]> = [
    [/bulk assets?|import/i, 'Bulk assets'],
    [/inventory schedule|schedule/i, 'Schedule'],
    [/transfer signator/i, 'Transfer signatory'],
    [/turnover|disposal/i, 'Turnover/Disposal record'],
    [/transfer/i, 'Transfer'],
    [/off-campus|off campus/i, 'Off-campus request'],
    [/verification form/i, 'Verification form'],
    [/form approval|step|external approval|pending review/i, 'Approval step'],
    [/equipment code/i, 'Equipment code'],
    [/asset model/i, 'Asset model'],
    [/asset/i, 'Asset'],
    [/assignment/i, 'Assignment'],
    [/building/i, 'Building'],
    [/room/i, 'Room'],
    [/unit\/department|unit or department/i, 'Unit/Department'],
    [/personnel/i, 'Personnel'],
    [/signator/i, 'Signatory'],
    [/permission/i, 'Permissions'],
    [/role/i, 'Role'],
    [/category/i, 'Category'],
    [/profile image/i, 'Profile image'],
    [/profile/i, 'Profile'],
    [/password/i, 'Password'],
    [/email|verification code/i, 'Email verification'],
    [/user/i, 'User account'],
    [/record/i, 'Record'],
];

const cleanFlashMessage = (message: string) =>
    message
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[.,]+$/, '');

const detectToastEntity = (message: string) => toastEntityRules.find(([pattern]) => pattern.test(message))?.[1] ?? 'Record';

const lowerEntity = (entity: string) => entity.charAt(0).toLowerCase() + entity.slice(1);

const buildToastCopy = (
    type: ToastFlashKey,
    message: string,
    override?: Pick<FlashMessage, 'title' | 'description'>,
): { kind: ToastKind; title: string; description: string } => {
    const cleaned = cleanFlashMessage(message);
    const lower = cleaned.toLowerCase();
    const entity = detectToastEntity(cleaned);
    const subject = lowerEntity(entity);
    const fallback = fallbackToastCopy[type];

    if (override?.title || override?.description) {
        return {
            kind: fallback.kind,
            title: override.title ?? fallback.title,
            description: override.description ?? cleaned ?? fallback.description,
        };
    }

    if (!cleaned) return fallback;

    if (/not authorized|access denied|unauthorized/i.test(cleaned)) {
        return {
            kind: 'error',
            title: 'Access denied',
            description: 'You do not have permission to perform this action.',
        };
    }

    if (/not found|already active|could not|failed|invalid/i.test(cleaned)) {
        return {
            kind: 'error',
            title: /delete|deleted|remove|removed/i.test(lower) ? 'Delete failed' : 'Action failed',
            description: cleaned,
        };
    }

    if (/bulk assets?.*added|import/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Bulk upload complete',
            description: cleaned,
        };
    }

    if (/permission.*updated/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Permissions updated',
            description: 'The role access settings have been saved.',
        };
    }

    if (/password.*reset|password.*updated/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Password updated',
            description: cleaned,
        };
    }

    if (/email change request/i.test(lower)) {
        return {
            kind: 'info',
            title: 'Email change requested',
            description: cleaned,
        };
    }

    if (/email verified/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Email verified',
            description: 'Your email address has been verified successfully.',
        };
    }

    if (/verification code resent|verification-link-sent|reset link/i.test(lower)) {
        return {
            kind: 'info',
            title: 'Verification sent',
            description: cleaned,
        };
    }

    if (/approved|verified successfully/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Request approved',
            description: 'The request has been approved successfully.',
        };
    }

    if (/rejected|denied/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Request rejected',
            description: 'The request has been marked as rejected.',
        };
    }

    if (/external approval recorded/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Approval recorded',
            description: 'The external approval has been recorded successfully.',
        };
    }

    if (/pending review/i.test(lower)) {
        return {
            kind: 'info',
            title: 'Moved to pending review',
            description: 'The request has been returned to pending review.',
        };
    }

    if (/completed/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Marked as completed',
            description: 'The transaction status has been updated.',
        };
    }

    if (/archived/i.test(lower)) {
        return {
            kind: 'success',
            title: entity === 'Asset' ? 'Asset moved to Trash Bin' : 'Moved to Trash Bin',
            description: entity === 'Asset' ? 'The asset has been moved to the Trash Bin.' : 'The record has been moved to the Trash Bin.',
        };
    }

    if (/restored|reactivated/i.test(lower)) {
        return {
            kind: 'success',
            title: entity === 'Asset' ? 'Asset reactivated' : 'Record restored',
            description: entity === 'Asset' ? 'The asset is now active again.' : 'The record is now available again in the system.',
        };
    }

    if (/permanently (removed|deleted)|permanent/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Permanently deleted',
            description: 'The record has been permanently removed.',
        };
    }

    if (/deleted|removed/i.test(lower)) {
        return {
            kind: 'success',
            title: entity === 'Asset' ? 'Asset moved to Trash Bin' : 'Record moved to Trash Bin',
            description: entity === 'Asset' ? 'The asset has been moved to the Trash Bin.' : 'The record has been moved to the Trash Bin.',
        };
    }

    if (/reassigned/i.test(lower)) {
        return {
            kind: 'success',
            title: /role/i.test(lower) ? 'Role reassigned' : 'Assets reassigned',
            description: cleaned,
        };
    }

    if (/assigned/i.test(lower)) {
        return {
            kind: 'success',
            title: 'Assets assigned',
            description: 'The selected assets have been assigned successfully.',
        };
    }

    if (/updated|saved/i.test(lower)) {
        return {
            kind: 'success',
            title: entity === 'Permissions' ? 'Permissions updated' : 'Changes saved',
            description: entity === 'Permissions' ? 'The role access settings have been saved.' : `The ${subject} has been updated successfully.`,
        };
    }

    if (/created|added/i.test(lower)) {
        const title =
            entity === 'Schedule'
                ? 'Schedule created'
                : entity === 'Transfer'
                  ? 'Property Transfer request created'
                  : entity === 'Turnover/Disposal record'
                    ? 'Turnover/Disposal record created'
                    : `${entity} added`;

        return {
            kind: 'success',
            title,
            description: `The ${subject} has been ${/created/i.test(lower) ? 'created' : 'added'} successfully.`,
        };
    }

    if (type === 'status') {
        return {
            kind: 'info',
            title: 'Status updated',
            description: cleaned,
        };
    }

    return {
        kind: fallback.kind,
        title: fallback.title,
        description: cleaned || fallback.description,
    };
};

const notifyFlash = (type: ToastFlashKey, flash: FlashMessage) => {
    const copy = buildToastCopy(type, flash.message, flash);

    if (copy.kind === 'success') {
        toast.success(copy.title, {
            description: copy.description,
        });
        return;
    }

    if (copy.kind === 'error') {
        toast.error(copy.title, {
            description: copy.description,
        });
        return;
    }

    if (copy.kind === 'warning') {
        toast.warning(copy.title, {
            description: copy.description,
        });
        return;
    }

    if (copy.kind === 'info') {
        toast.info(copy.title, {
            description: copy.description,
        });
        return;
    }

    toast.info(copy.title, {
        description: copy.description,
    });
};

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // flash.unauthorized is set by bootstrap/app.php handler
    // const { flash } = usePage().props as { flash?: { unauthorized?: string } }
    const { flash } = usePage().props as { flash?: AppFlash };
    const unauthorizedObj = flash?.unauthorized ?? null;
    const shownFlashKeys = useRef<Set<string>>(new Set());

    const [showUnauthorized, setShowUnauthorized] = useState(false);
    const [unauthorizedMsg, setUnauthorizedMsg] = useState<string | null>(null);

    // useEffect(() => {
    //   if (unauthorizedMsg) setShowUnauthorized(true)
    // }, [unauthorizedMsg])

    useEffect(() => {
        if (unauthorizedObj) {
            setUnauthorizedMsg(unauthorizedObj.message);
            setShowUnauthorized(true);
        }
    }, [unauthorizedObj]);

    useEffect(() => {
        const types: ToastFlashKey[] = ['success', 'error', 'warning', 'info', 'status'];

        types.forEach((type) => {
            const current = flash?.[type];

            if (!current?.message) return;

            const key = `${type}:${current.time}:${current.message}`;

            if (shownFlashKeys.current.has(key)) return;

            shownFlashKeys.current.add(key);
            notifyFlash(type, current);
        });
    }, [flash]);

    useEffect(() => {
        const removeErrorListener = router.on('error', (errors) => {
            if (Object.keys(errors).length === 0) return;

            toast.error('Please review the form', {
                description: 'Some required information is missing or invalid.',
            });
        });

        const removeInvalidListener = router.on('invalid', () => {
            toast.error('Request failed', {
                description: 'The server could not complete the request. Please try again.',
            });
        });

        const removeExceptionListener = router.on('exception', () => {
            toast.error('Something went wrong', {
                description: 'The request could not be completed. Please try again.',
            });
        });

        return () => {
            removeErrorListener();
            removeInvalidListener();
            removeExceptionListener();
        };
    }, []);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}

            <UnauthorizedModal show={showUnauthorized} message={unauthorizedMsg ?? undefined} onClose={() => setShowUnauthorized(false)} />

            <Toaster
                richColors
                position="top-right"
                style={
                    {
                        '--success-bg': 'var(--toast-success-bg)',
                        '--success-text': 'var(--toast-success-text)',
                        '--success-border': 'var(--toast-success-border)',
                        '--warning-bg': 'var(--toast-warning-bg)',
                        '--warning-text': 'var(--toast-warning-text)',
                        '--warning-border': 'var(--toast-warning-border)',
                        '--error-bg': 'var(--toast-error-bg)',
                        '--error-text': 'var(--toast-error-text)',
                        '--error-border': 'var(--toast-error-border)',
                        '--info-bg': 'var(--toast-info-bg)',
                        '--info-text': 'var(--toast-info-text)',
                        '--info-border': 'var(--toast-info-border)',
                        '--normal-bg': 'var(--toast-normal-bg)',
                        '--normal-text': 'var(--toast-normal-text)',
                        '--normal-border': 'var(--toast-normal-border)',
                    } as React.CSSProperties
                }
            />
        </AppLayoutTemplate>
    );
};
