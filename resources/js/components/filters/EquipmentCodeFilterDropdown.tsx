import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Filter } from 'lucide-react'
import Select from 'react-select'
import type { Category } from '@/types/category' // ← ensure this import path

type Props = {
    categories: Category[]
    selectedCategoryId: number | ''
    onApply: (filters: { categoryId: number | '' }) => void
    onClear: () => void
}

export default function EquipmentCodeFilterDropdown({
    categories,
    selectedCategoryId,
    onApply,
    onClear,
}: Props) {
    const [open, setOpen] = useState(false)
    const [localCategory, setLocalCategory] = useState<number | ''>(selectedCategoryId)

    useEffect(() => { setLocalCategory(selectedCategoryId) }, [selectedCategoryId])

    const hasAny = localCategory !== ''
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> Filter
                    {hasAny && <Badge className="ml-2" variant="secondary">Active</Badge>}
                </Button>
            </DropdownMenuTrigger>

            {/* Taller container (you can tune these) */}
            {/* <DropdownMenuContent className="p-3 w-[360px] min-h-[220px] max-h-[220px]">
                <div className="grid gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium">Category</label>
                        <div className="w-full">
                            <Select
                                options={categoryOptions}
                                isClearable
                                value={categoryOptions.find(o => o.value === localCategory) || null}
                                onChange={(opt) => setLocalCategory(opt ? opt.value : '')}
                                placeholder="Filter by Category"
                                className="text-sm"
                                maxMenuHeight={180}
                                styles={{
                                    container: (base) => ({ ...base, width: '100%' }),
                                    control:   (base) => ({ ...base, minHeight: 36, width: '100%' }),
                                    menu:      (base) => ({ ...base, width: '100%' }),
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                        <Button
                            className="cursor-pointer"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setLocalCategory(''); 
                                onClear(); 
                                setOpen(false) 
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            className="cursor-pointer"
                            size="sm"
                            onClick={() => {
                                onApply({ categoryId: localCategory }); 
                                setOpen(false) 
                            }}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent> */}
            <DropdownMenuContent className="p-0 w-[360px] h-[260px]"> 
                <div className="flex flex-col h-full p-3">
                    <div className="flex-1 space-y-3 overflow-y-auto">
                        <div className="grid gap-1">
                            <label className="text-xs font-medium">Category</label>
                            <Select
                                options={categoryOptions}
                                isClearable
                                value={categoryOptions.find(o => o.value === localCategory) || null}
                                onChange={(opt) => setLocalCategory(opt ? opt.value : '')}
                                placeholder="Filter by Category"
                                className="text-sm"
                                maxMenuHeight={110}
                                styles={{
                                    container: (base) => ({ ...base, width: '100%' }),
                                    control:   (base) => ({ ...base, minHeight: 36, width: '100%' }),
                                    menu:      (base) => ({ ...base, width: '100%' }),
                                }}
                            />

                        </div>
                    </div>

                    {/* Footer always at bottom */}
                    <div className="flex gap-2 justify-end pt-3 mt-3">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                            setLocalCategory('')
                            onClear()
                            setOpen(false)
                            }}
                            className="cursor-pointer"
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                            onApply({ categoryId: localCategory })
                            setOpen(false)
                            }}
                            className="cursor-pointer"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
