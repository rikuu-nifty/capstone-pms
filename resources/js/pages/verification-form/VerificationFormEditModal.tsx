import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import { Textarea } from '@/components/ui/textarea';

interface VerificationFormEditModalProps {
    show: boolean;
    onClose: () => void;
    verificationId: number | null;
    mode?: 'verify' | 'reject';
}

export default function VerificationFormEditModal({
    show,
    onClose,
    verificationId,
    mode = 'verify',
}: VerificationFormEditModalProps) {
    const { data, setData, patch, processing, reset, errors, clearErrors } = useForm({
        notes: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!verificationId) return;

        const routeName =
            mode === 'reject' ? 'verification-form.reject' : 'verification-form.verify';

        patch(route(routeName, verificationId), {
            preserveScroll: true,
            onSuccess: () => {
            reset();
            onClose();
            },
        });
    };

    return (
        <EditModal
            show={show}
            onClose={() => {
                onClose();
                reset();
                clearErrors();
            }}
            title={`Verification Form #${verificationId ?? ''}`}
            onSubmit={handleSubmit}
            processing={processing}
            contentClassName='max-h-[490px] min-h-[490px]'
        >
            <div className="col-span-2">
                <label className="mb-1 block font-medium">Notes</label>
                <Textarea
                    className="resize-none min-h-[110px] max-h-[110px]"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder={
                        mode === 'reject'
                        ? 'Enter reason for rejection'
                        : 'Enter notes about this verification'
                    }
                />
                    {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
            </div>

            <div className="col-span-2">
                <label className="mb-1 block font-medium">Remarks</label>
                <Textarea
                    className="resize-none min-h-[110px] max-h-[110px]"
                    value={data.remarks}
                    onChange={(e) => setData('remarks', e.target.value)}
                    placeholder={
                        mode === 'reject'
                        ? 'Additional rejection details (optional)'
                        : 'Additional verification remarks (optional)'
                    }
                />
                    {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
            </div>
        </EditModal>
    );
}
