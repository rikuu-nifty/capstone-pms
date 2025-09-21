import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import EditModal from '@/components/modals/EditModal';
import Select from 'react-select';

import type { AssetAssignment } from '@/types/asset-assignment';

interface Props {
  show: boolean;
  onClose: () => void;
  assignment: AssetAssignment | null;
  assets: { id: number; property_number: string; asset_name?: string }[];
  personnels: { id: number; full_name: string }[];
  units: { id: number; name: string }[];
}

export default function EditAssignmentModal({
  show,
  onClose,
  assignment,
  assets,
  personnels,
  units,
}: Props) {
  const { data, setData, put, processing, errors, clearErrors } = useForm<{
    personnel_id: number | null;
    unit_or_department_id: number | null;
    date_assigned: string;
    remarks: string;
    selected_assets: number[];
  }>({
    personnel_id: null,
    unit_or_department_id: null,
    date_assigned: '',
    remarks: '',
    selected_assets: [],
  });

  const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

  useEffect(() => {
    if (!show || !assignment) return;

    setData({
      personnel_id: assignment.personnel_id ?? null,
      unit_or_department_id: assignment.unit_or_department_id ?? null,
      date_assigned: assignment.date_assigned ?? '',
      remarks: assignment.remarks ?? '',
      selected_assets: assignment.asset_id ? [assignment.asset_id] : [],
    });
    clearErrors();
    setShowAssetDropdown([true]);
  }, [show, assignment, setData, clearErrors]);

  const handleClose = () => {
    onClose();
    clearErrors();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assignment?.id) return;

    put(`/assignments/${assignment.id}`, {
      preserveScroll: true,
      onSuccess: handleClose,
    });
  };

  return (
    <EditModal
      show={show}
      onClose={handleClose}
      title={`Edit Assignment #${assignment?.id ?? ''}`}
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
        />
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
        />
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
      </div>

      {/* Assets */}
      <div className="col-span-2 flex flex-col gap-3">
        <label className="block font-medium">Assets</label>

        {data.selected_assets.map((assetId, index) => {
          const asset = assets.find((a) => a.id === assetId);
          return (
            <div key={assetId} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <span>{asset ? `${asset.property_number} – ${asset.asset_name ?? ''}` : 'Asset not found'}</span>
              <button
                type="button"
                onClick={() => {
                  const updated = [...data.selected_assets];
                  updated.splice(index, 1);
                  setData('selected_assets', updated);
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
                  placeholder="Select asset"
                />
              </div>
            )
        )}
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
      </div>
    </EditModal>
  );
}
