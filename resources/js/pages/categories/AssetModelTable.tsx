import { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SortDropdown, { type SortDir } from '@/components/filters/SortDropdown';
import { Pencil, PlusCircle } from 'lucide-react';
import type { AssetModel } from '@/types/asset-model';

const modelSortOptions = [
  { value: 'id',            label: 'Record ID' },
  { value: 'brand',         label: 'Brand' },
  { value: 'model',         label: 'Model' },
  { value: 'assets_count',  label: 'Assets Count' },
] as const;
type ModelSortKey = (typeof modelSortOptions)[number]['value'];

type Props = {
  models: (AssetModel & { category?: { id: number; name: string } })[];
  categoryOptions: { id: number; name: string }[];
  pageSize?: number;
  defaultSortKey?: ModelSortKey;
  defaultSortDir?: SortDir; // 'asc' for oldest first
  createHref?: string;
  editHref?: (id: number) => string;
};

export default function AssetModelsTable({
  models,
  categoryOptions,
  pageSize = 20,
  defaultSortKey = 'id',
  defaultSortDir = 'asc',
  createHref = '/asset-models/create',
  editHref = (id) => `/asset-models/${id}/edit`,
}: Props) {
  // Filters/sort/paging
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | 'active' | 'is_archived'>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [sortKey, setSortKey] = useState<ModelSortKey>(defaultSortKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, status, categoryId, sortKey, sortDir]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return models.filter((m) => {
      const hay = `${m.id} ${m.brand ?? ''} ${m.model ?? ''}`.toLowerCase();
      const matchesTerm = !term || hay.includes(term);
      const matchesStatus = !status || m.status === status;
      const matchesCat = !categoryId || (m.category?.id === categoryId || m.category_id === categoryId);
      return matchesTerm && matchesStatus && matchesCat;
    });
  }, [models, search, status, categoryId]);

  const keyNum = (m: AssetModel, k: ModelSortKey) =>
    k === 'id' ? Number(m.id) || 0
    : k === 'assets_count' ? Number((m as any).assets_count ?? 0) || 0
    : 0;

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'brand') {
        const d = (a.brand ?? '').localeCompare(b.brand ?? '');
        return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
      }
      if (sortKey === 'model') {
        const d = (a.model ?? '').localeCompare(b.model ?? '');
        return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
      }
      const d = keyNum(a, sortKey) - keyNum(b, sortKey);
      return (d !== 0 ? d : (Number(a.id) - Number(b.id))) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Asset Models</h2>
          <p className="text-sm text-muted-foreground">All models across categories.</p>

          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Search by brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />

            <select
              className="border rounded-md p-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="is_archived">Archived</option>
            </select>

            <select
              className="border rounded-md p-2 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="ml-auto">
              <SortDropdown<ModelSortKey>
                sortKey={sortKey}
                sortDir={sortDir}
                options={modelSortOptions}
                onChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {sorted.length ? start + 1 : 0}–{Math.min(start + pageSize, sorted.length)} of {sorted.length} filtered models
          </div>
        </div>

        <Button asChild className="cursor-pointer">
          <Link href={createHref} preserveScroll>
            <PlusCircle className="mr-1 h-4 w-4" /> Add New Asset Model
          </Link>
        </Button>
      </div>

      <div className="rounded-lg-lg overflow-x-auto border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted text-foreground">
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Brand</TableHead>
              <TableHead className="text-center">Model</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Assets</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-center">
            {pageItems.length ? pageItems.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.id}</TableCell>
                <TableCell className="font-medium">{m.brand}</TableCell>
                <TableCell>{m.model}</TableCell>
                <TableCell>{m.category?.name ?? '—'}</TableCell>
                <TableCell>{m.status}</TableCell>
                <TableCell>{(m as any).assets_count ?? 0}</TableCell>
                <TableCell className="flex justify-center items-center gap-2">
                  <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                    <Link href={editHref(m.id)} preserveScroll>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  No asset models found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
