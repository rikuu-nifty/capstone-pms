import { type SortDir } from '@/components/filters/SortDropdown';
import Pagination, { PageInfo } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Building } from '@/types/building';
import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PAGE_SIZE, numberKey, type BuildingSortKey } from './building-index.helpers';

type Props = {
    buildings: Building[];
    sortKey: BuildingSortKey;
    sortDir: SortDir;
    search: string;
    selectedBuildingId: number | null;
    onSelect: (id: number | null) => void;
    onEdit: (b: Building) => void;
    onDelete: (b: Building) => void;
};

export default function BuildingsTable({ buildings, sortKey, sortDir, search, selectedBuildingId, onSelect, onEdit, onDelete }: Props) {
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [search, sortKey, sortDir]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return buildings;
        return buildings.filter((b) => {
            const haystack = `${b.id} ${b.name ?? ''} ${b.code ?? ''} ${b.description ?? ''}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [buildings, search]);

    const sorted = useMemo(() => {
        const dir = sortDir === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            if (sortKey === 'name' || sortKey === 'code') {
                const da = (a[sortKey] ?? '').toString();
                const db = (b[sortKey] ?? '').toString();
                const d = da.localeCompare(db);
                return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
            }
            const d = numberKey(a, sortKey) - numberKey(b, sortKey);
            return (d !== 0 ? d : Number(a.id) - Number(b.id)) * dir;
        });
    }, [filtered, sortKey, sortDir]);

    const start = (page - 1) * PAGE_SIZE;
    const pageItems = sorted.slice(start, start + PAGE_SIZE);

    return (
        <>
            <div className="rounded-lg-lg overflow-x-auto border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted text-foreground">
                            <TableHead className="text-center">ID</TableHead>
                            <TableHead className="text-center">Building Code</TableHead>
                            <TableHead className="text-center">Name</TableHead>
                            <TableHead className="text-center">Description</TableHead>
                            <TableHead className="text-center">Room Count</TableHead>
                            <TableHead className="text-center">Assets Count</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="text-center">
                        {pageItems.length > 0 ? (
                            pageItems.map((b) => (
                                <TableRow
                                    key={b.id}
                                    onClick={() => onSelect(Number(b.id))}
                                    className={`cursor-pointer ${selectedBuildingId === Number(b.id) ? 'bg-muted/50' : ''}`}
                                >
                                    <TableCell>{b.id}</TableCell>
                                    <TableCell className="font-medium">{(b.code).toUpperCase()}</TableCell>
                                    <TableCell>{b.name}</TableCell>
                                    <TableCell className="max-w-[250px] text-center break-words whitespace-normal">{b.description ?? '—'}</TableCell>
                                    <TableCell>{b.building_rooms_count ?? 0}</TableCell>
                                    <TableCell>{b.assets_count ?? 0}</TableCell>
                                    <TableCell className="h-full">
                                        <div className="flex h-full items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(b);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(b);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Link href={`/buildings/view/${b.id}`} preserveScroll>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                    No buildings found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <PageInfo page={page} total={sorted.length} pageSize={PAGE_SIZE} label="buildings" />
                <Pagination page={page} total={sorted.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
        </>
    );
}
