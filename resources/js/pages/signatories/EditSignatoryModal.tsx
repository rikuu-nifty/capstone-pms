import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type Signatory = {
  id: number;
  module_type: string;
  role_key: string;
  name: string;
  title: string;
};

type EditSignatoryModalProps = {
  open: boolean;
  onClose: () => void;
  signatory: Signatory;
  moduleType: string; // ✅ pass current tab from parent
};

export default function EditSignatoryModal({ open, onClose, signatory, moduleType }: EditSignatoryModalProps) {
  const { data, setData, put, processing, reset, errors } = useForm({
    module_type: moduleType, // ✅ always use current tab’s moduleType
    role_key: signatory.role_key,
    name: signatory.name,
    title: signatory.title,
  });

  // ✅ keep module_type in sync if tab changes while editing
  useEffect(() => {
    setData('module_type', moduleType);
  }, [moduleType, setData]);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setData('module_type', moduleType); // ✅ ensure it's always set
  put(route('signatories.update', signatory.id), {
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
            <DialogTitle>Edit Signatory</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role Key</label>
              <Input
                value={data.role_key}
                onChange={(e) => setData('role_key', e.target.value)}
              />
              {errors.role_key && <p className="text-red-500 text-xs mt-1">{errors.role_key}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
