import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type AddSignatoryModalProps = {
  open: boolean;
  onClose: () => void;
  moduleType: string;
};

export default function AddSignatoryModal({ open, onClose, moduleType, }: AddSignatoryModalProps) {
  const { data, setData, post, processing, reset, errors } = useForm({
    module_type: moduleType,
    role_key: '',
    name: '',
    title: '',
  });

  // ✅ keep module_type in sync with active tab
  useEffect(() => {
    setData('module_type', moduleType);
  }, [moduleType, setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('signatories.store'), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Signatory</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role Key</label>
              <Input
                value={data.role_key}
                onChange={(e) => setData('role_key', e.target.value)}
                placeholder="e.g. approved_by"
              />
              {errors.role_key && <p className="text-red-500 text-xs mt-1">{errors.role_key}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Full Name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Position/Role"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
