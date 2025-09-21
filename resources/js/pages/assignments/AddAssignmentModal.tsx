import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';

// import type { AssetAssignment } from '@/types/asset-assignment';

interface Props {
  show: boolean;
  onClose: () => void;
  assets: { id: number; property_number: string; asset_name?: string }[];
  personnels: { id: number; full_name: string }[];
  units: { id: number; name: string }[];
  currentUserId: number;
}

export default function AddAssignmentModal({
  show,
  onClose,
  assets,
  personnels,
  units,
  currentUserId,
}: Props) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
    personnel_id: number | null;
    unit_or_department_id: number | null;
    assigned_by: number;
    date_assigned: string;
    remarks: string;
    selected_assets: number[];
  }>({
    personnel_id: null,
    unit_or_department_id: null,
    assigned_by: currentUserId,
    date_assigned: '',
    remarks: '',
    selected_assets: [],
  });

  const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

  useEffect(() => {
    if (show) {
      reset();
      clearErrors();
      setShowAssetDropdown([true]);
    }
  }, [show, reset, clearErrors]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    post('/assignments', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        clearErrors();
        setShowAssetDropdown([true]);
        onClose();
      },
    });
  };

  return (
    <AddModal
      show={show}
      onClose={() => {
        onClose();
        reset();
        clearErrors();
        setShowAssetDropdown([true]);
      }}
      title="Assign Assets"
      onSubmit={handleSubmit}
      processing={processing}
    >
      {/* Personnel */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Personnel</label>
        <Select
          className="w-full"
          value={
            data.personnel_id
              ? personnels.map((p) => ({ value: p.id, label: p.full_name })).find((opt) => opt.value === data.personnel_id) ?? null
              : null
          }
          options={personnels.map((p) => ({
            value: p.id,
            label: p.full_name,
          }))}
          onChange={(opt) => setData('personnel_id', opt ? opt.value : null)}
          isClearable
          placeholder="Select personnel"
        />
        {errors.personnel_id && <p className="mt-1 text-xs text-red-500">{errors.personnel_id}</p>}
      </div>

      {/* Unit/Department */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Unit / Department</label>
        <Select
          className="w-full"
          value={
            data.unit_or_department_id
              ? units.map((u) => ({ value: u.id, label: u.name })).find((opt) => opt.value === data.unit_or_department_id) ?? null
              : null
          }
          options={units.map((u) => ({
            value: u.id,
            label: u.name,
          }))}
          onChange={(opt) => setData('unit_or_department_id', opt ? opt.value : null)}
          isClearable
          placeholder="Select unit/department"
        />
        {errors.unit_or_department_id && <p className="mt-1 text-xs text-red-500">{errors.unit_or_department_id}</p>}
      </div>

      {/* Date Assigned */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Date Assigned</label>
        <input
          type="date"
          className="w-full rounded-lg border p-2"
          value={data.date_assigned}
          onChange={(e) => setData('date_assigned', e.target.value)}
        />
        {errors.date_assigned && <p className="mt-1 text-xs text-red-500">{errors.date_assigned}</p>}
      </div>

      {/* Assets to Assign */}
      <div className="col-span-2 flex flex-col gap-3">
        <label className="block font-medium">Assets to Assign</label>

        {data.selected_assets.map((assetId, index) => {
          const asset = assets.find((a) => a.id === assetId);
          return (
            <div key={assetId} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <span>
                {asset ? `${asset.property_number} – ${asset.asset_name ?? ''}` : 'Asset not found'}
              </span>
              <button
                type="button"
                onClick={() => {
                  const updated = [...data.selected_assets];
                  updated.splice(index, 1);
                  setData('selected_assets', updated);

                  const newDropdowns = [...showAssetDropdown];
                  newDropdowns.splice(index, 1);
                  setShowAssetDropdown(newDropdowns);
                }}
                className="text-red-500 text-xs hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          );
        })}

        {showAssetDropdown.map(
          (visible, index) =>
            visible && (
              <div key={`asset-${index}`} className="flex items-center gap-2">
                <Select
                  className="w-full"
                  options={assets
                    .filter((a) => !data.selected_assets.includes(a.id))
                    .map((a) => ({
                      value: a.id,
                      label: `${a.property_number} – ${a.asset_name ?? ''}`,
                    }))}
                  onChange={(opt) => {
                    if (opt && !data.selected_assets.includes(opt.value)) {
                      setData('selected_assets', [...data.selected_assets, opt.value]);
                      const updated = [...showAssetDropdown];
                      updated[index] = false;
                      setShowAssetDropdown([...updated, true]);
                    }
                  }}
                  placeholder="Select asset to assign"
                />
              </div>
            )
        )}

        {errors.selected_assets && <p className="mt-1 text-xs text-red-500">{String(errors.selected_assets)}</p>}
      </div>

      {/* Remarks */}
      <div className="col-span-2">
        <label className="mb-1 block font-medium">Remarks</label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-lg border p-2"
          value={data.remarks}
          onChange={(e) => setData('remarks', e.target.value)}
        />
        {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
      </div>
    </AddModal>
  );
}
