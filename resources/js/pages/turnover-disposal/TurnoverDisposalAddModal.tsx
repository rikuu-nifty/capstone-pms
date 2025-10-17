import { useEffect, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { useForm } from '@inertiajs/react';
import AddModal from '@/components/modals/AddModal';
import { UnitOrDepartment, User, InventoryList, formatEnums, Personnel } from '@/types/custom-index';
import { TurnoverDisposalFormData } from '@/types/turnover-disposal';
import type { TurnoverDisposalAssetInput, TdaStatus } from '@/types/turnover-disposal-assets';
import AssetTdaItem from './AssetTdaItem';

type Option = { value: number; label: string };

interface TurnoverDisposalAddModalProps {
  show: boolean;
  onClose: () => void;
  assignedBy: User;
  unitOrDepartments: UnitOrDepartment[];
  assets: InventoryList[];
  personnels: Personnel[];
}

const typeOptions = ['turnover', 'disposal'] as const;
const statusOptions = ['pending_review', 'approved', 'rejected', 'cancelled', 'completed'] as const;
const categoryOptions = ['sharps', 'breakages', 'chemical', 'hazardous', 'non_hazardous'] as const;

export default function TurnoverDisposalAddModal({
  show,
  onClose,
  unitOrDepartments,
  assets,
  personnels,
}: TurnoverDisposalAddModalProps) {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm<TurnoverDisposalFormData>({
    issuing_office_id: 0,
    type: 'turnover',
    turnover_category: null,

    receiving_office_id: 0,
    description: '',
    personnel_in_charge: '',
    document_date: '',
    status: 'pending_review',
    remarks: '',
    is_donation: false, 

    turnover_disposal_assets: [],

    personnel_id: null,
  });

  const [showAssetDropdown, setShowAssetDropdown] = useState<boolean[]>([true]);

  useEffect(() => {
    if (show) {
      reset();
      clearErrors();
      setShowAssetDropdown([true]);
    }
  }, [show, reset, clearErrors]);

  const selectedIds = useMemo(
    () => new Set<number>(data.turnover_disposal_assets.map((li) => li.asset_id)),
    [data.turnover_disposal_assets]
  );

  const filteredAssets = useMemo<InventoryList[]>(() => {
    if (!data.issuing_office_id) return [];
    return assets.filter((a) => a.unit_or_department_id === data.issuing_office_id && !selectedIds.has(a.id));
  }, [assets, data.issuing_office_id, selectedIds]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post('/turnover-disposal', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        clearErrors();
        setShowAssetDropdown([true]);
        onClose();
      },
    });
  };

  const addLine = (asset_id: number) => {
    const defaultStatus: TdaStatus = 'pending';
    const next: TurnoverDisposalAssetInput = {
      asset_id,
      asset_status: defaultStatus,
      date_finalized: null,
      remarks: '',
    };
    setData('turnover_disposal_assets', [...data.turnover_disposal_assets, next]);
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
      title="Create New Record"
      onSubmit={handleSubmit}
      processing={processing}
    >
      {/* Type */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Type</label>
        <select
          className="w-full rounded-lg border p-2"
          value={data.type}
          onChange={(e) => setData('type', e.target.value as (typeof typeOptions)[number])}
        >
          <option value="">Select Record Type</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {formatEnums(type)}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
      </div>

      {/* Turnover Category */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Turnover Category</label>
        <select
          className="w-full rounded-lg border p-2 cursor-pointer"
          value={data.turnover_category ?? ''}
          onChange={(e) =>
            setData(
              'turnover_category',
              e.target.value === ''
                ? null
                : (e.target.value as (typeof categoryOptions)[number])
            )
          }
        >
          <option value="">Select Category</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {formatEnums(cat)}
            </option>
          ))}
        </select>
        {errors.turnover_category && (
          <p className="mt-1 text-xs text-red-500">{errors.turnover_category}</p>
        )}
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <input
          id="is_donation"
          type="checkbox"
          className="cursor-pointer"
          checked={!!data.is_donation}
          onChange={(e) => setData('is_donation', e.target.checked)}
        />
        <label 
          htmlFor="is_donation" 
          className="text-sm font-medium"
        >
          For Donation
        </label>
      </div>

      {/* Issuing Office */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Issuing Office</label>
        <Select
          className="w-full text-sm"
          isClearable
          value={
            unitOrDepartments
              .map((unit) => ({
                value: unit.id,
                label: ` ${unit.name}`,
              }))
              .find((opt) => opt.value === data.issuing_office_id) ?? null
          }
          onChange={(opt) => {
            const id = opt ? opt.value : 0;
            setData('issuing_office_id', id);
            setData('personnel_id', null);
            setData('turnover_disposal_assets', []);
            setShowAssetDropdown([true]);
          }}
          options={unitOrDepartments.map((unit) => ({
            value: unit.id,
            label: `${unit.name}`,
          }))}
          placeholder="Select Unit/Dept/Lab"
        />
        {errors.issuing_office_id && (
          <p className="mt-1 text-xs text-red-500">{errors.issuing_office_id}</p>
        )}
      </div>
      
      {/* Receiving Office */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Receiving Office</label>
        <Select
          className="w-full text-sm"
          isClearable
          value={
            unitOrDepartments
              .map((unit) => ({
                value: unit.id,
                label: `${unit.name}`,
              }))
              .find((opt) => opt.value === data.receiving_office_id) ?? null
          }
          onChange={(opt) => {
            const id = opt ? opt.value : 0;
            setData('receiving_office_id', id);
          }}
          options={unitOrDepartments.map((unit) => ({
            value: unit.id,
            label: `${unit.name}`,
          }))}
          placeholder="Select Unit/Dept/Lab"
        />
        {errors.receiving_office_id && (
          <p className="mt-1 text-xs text-red-500">{errors.receiving_office_id}</p>
        )}
      </div>

      {/* Status */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Status</label>
        <select
          className="w-full rounded-lg border p-2"
          value={data.status}
          onChange={(e) =>
            setData('status', e.target.value as (typeof statusOptions)[number])
          }
        >
          {statusOptions.map((status) => (
            <option
              key={status}
              value={status}
              disabled={status !== 'pending_review'}
            >
              {formatEnums(status)}
            </option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
      </div>
      
      {/* Description */}
      <div className="col-span-2">
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          placeholder="Enter description (e.g., reason for turnover or disposal)"
          rows={3}
          className="w-full resize-none rounded-lg border p-2"
          value={data.description ?? ''}
          onChange={(e) => setData('description', e.target.value)}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* PIC */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Personnel in Charge</label>
        <Select
          className="w-full"
          isClearable
          isDisabled={!data.issuing_office_id}
          options={personnels
            .filter(p => p.unit_or_department_id === data.issuing_office_id)
            .map(p => ({ value: p.id, label: p.full_name }))
          }
          placeholder={data.issuing_office_id ? "Select Personnel..." : "Select an Issuing Office first"}
          value={
            personnels.find(p => p.id === data.personnel_id)
              ? { value: data.personnel_id!, label: personnels.find(p => p.id === data.personnel_id)!.full_name }
              : null
          }
          onChange={(opt) => setData('personnel_id', opt?.value ?? null)}
        />
        {errors.personnel_id && <p className="mt-1 text-xs text-red-500">{errors.personnel_id}</p>}
      </div>

      {/* Document Date */}
      <div className="col-span-1">
        <label className="mb-1 block font-medium">Document Date</label>
        <input
          type="date"
          className="w-full rounded-lg border p-2 uppercase"
          value={data.document_date}
          onChange={(e) => setData('document_date', e.target.value)}
        />
        {errors.document_date && <p className="mt-1 text-xs text-red-500">{errors.document_date}</p>}
      </div>

      {/* Assets (cards) */}
      <div className="col-span-2 flex flex-col gap-4">
        <label className="block font-medium">Assets Covered</label>

        {data.turnover_disposal_assets.map((line, idx) => {
          const asset = assets.find((a) => a.id === line.asset_id);
          if (!asset) {
            return (
              <div key={`${line.asset_id}-${idx}`} className="rounded-lg border p-2 text-sm text-red-600">
                Asset not found
              </div>
            );
          }

          return (
            <AssetTdaItem
              key={`${line.asset_id}-${idx}`}
              line={line}
              asset={asset}
              parentStatus={data.status}
              onRemove={() => {
                const next = [...data.turnover_disposal_assets];
                next.splice(idx, 1);
                setData('turnover_disposal_assets', next);
              }}
              onChange={(next) => {
                const copy = [...data.turnover_disposal_assets];
                copy[idx] = next;
                setData('turnover_disposal_assets', copy);
              }}
            />
          );
        })}

        {/* Add asset dropdown(s) */}
        {showAssetDropdown.map(
          (visible, index) =>
            visible && (
              <div key={`dropdown-${index}`} className="flex items-center gap-2">
                <Select<Option, false>
                  key={`asset-${data.issuing_office_id}-${index}-${data.turnover_disposal_assets.length}`}
                  className="w-full"
                  isDisabled={!data.issuing_office_id}
                  options={filteredAssets.map((a) => ({ value: a.id, label: `${a.serial_no} – ${a.asset_name ?? ''}` }))}
                  placeholder={data.issuing_office_id ? 'Select Asset...' : 'Select an Issuing Office first'}
                  noOptionsMessage={() => (data.issuing_office_id ? 'No Assets Available' : 'Select an Issuing Office first')}
                  onChange={(opt: SingleValue<Option>) => {
                    if (opt && !selectedIds.has(opt.value)) {
                      addLine(opt.value);
                      setShowAssetDropdown((prev) => {
                        const updated = [...prev];
                        updated[index] = false;
                        return [...updated, true];
                      });
                    }
                  }}
                />
              </div>
            )
        )}

        {errors.turnover_disposal_assets && (
          <p className="mt-1 text-sm text-red-500">{String(errors.turnover_disposal_assets)}</p>
        )}
      </div>

      {/* Remarks */}
      <div className="col-span-2">
        <label className="mb-1 block font-medium">Remarks</label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-lg border p-2"
          value={data.remarks ?? ''}
          onChange={(e) => setData('remarks', e.target.value)}
        />
        {errors.remarks && <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>}
      </div>
    </AddModal>
  );
}
