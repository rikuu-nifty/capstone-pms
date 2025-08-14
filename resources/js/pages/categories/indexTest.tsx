import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useMemo, useState } from 'react';
import type { CategoriesPageProps, CategoryWithModels } from '@/types/category';
import type { AssetModel } from '@/types/custom-index';
import CategoriesTable from './CategoryTable';
import AssetModelsTable from './AssetModelTable';
// import CategoryViewModal from './CategoryViewModal';
// import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';

export default function CategoriesIndex({ categories }: CategoriesPageProps) {
//   Optional: View + Delete handlers (uncomment if you wire the modals)
  const [viewing, setViewing] = useState<CategoryWithModels | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithModels | null>(null);

//   Flatten models for the second table
  const models: (AssetModel & { category?: { id: number; name: string } })[] = useMemo(() => {
    const arr: any[] = [];
    for (const c of categories) {
      for (const m of (c.asset_models ?? [])) {
        arr.push({ ...m, category: m.category ?? { id: c.id, name: c.name } });
      }
    }
    return arr;
  }, [categories]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  return (
    <AppLayout>
      <Head title="Categories" />

      <div className="flex flex-col gap-6 p-4">
        <CategoriesTable
          categories={categories}
          defaultSortKey="id"
          defaultSortDir="asc"
          onView={(c) => setViewing(c)}
          onDelete={(c) => setDeleting(c)}
        />

        <AssetModelsTable
          models={models}
          categoryOptions={categoryOptions}
          defaultSortKey="id"
          defaultSortDir="asc"
          createHref="/asset-models/create"
          editHref={(id) => `/asset-models/${id}/edit`}
        />
      </div>

      {/* Example wiring: */}
      {viewing && (
        <CategoryViewModal open={!!viewing} onClose={() => setViewing(null)} category={viewing} />
      )}
      {/* <DeleteConfirmationModal
        show={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && router.delete(`/categories/${deleting.id}`, { onSuccess: () => setDeleting(null), preserveScroll: true })}
      /> */}
     
    </AppLayout>
  );
}
