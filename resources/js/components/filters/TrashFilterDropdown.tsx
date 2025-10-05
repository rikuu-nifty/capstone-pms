import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import Select from 'react-select';

type FieldConfig = {
    key: string; // internal key (e.g. "unit_id")
    label: string; // visible label (e.g. "Unit/Department")
    type?: 'select' | 'date';
    options?: { label: string; value: string | number }[];
    value: string | number | '';
    onChange: (val: string | number | '') => void;
};

type TrashFilterDropdownProps = {
    title?: string;
    fields: FieldConfig[];
    onApply: (updated: Record<string, string | number | ''>) => void;
    onClear: () => void;
};

export default function TrashFilterDropdown({
    title = 'Filter',
    fields,
    onApply,
    onClear,
}: TrashFilterDropdownProps) {
    const [open, setOpen] = useState(false);
    const hasActive = fields.some((f) => f.value !== '');

    const [tempValues, setTempValues] = useState(fields.map((f) => f.value));

    useEffect(() => {
        if (open) {
            setTempValues(fields.map((f) => f.value));
        }
    }, [open, fields]);

    const handleFieldChange = (index: number, newValue: string | number | '') => {
        setTempValues((prev) =>
            prev.map((val, i) => (i === index ? newValue : val))
        );
    };

    const handleApply = () => {
        const updatedFilters: Record<string, string | number | ''> = {};

        fields.forEach((f, i) => {
            f.onChange(tempValues[i]);
            updatedFilters[f.key] = tempValues[i];
        });

        onApply(updatedFilters);
        setOpen(false);
    };

    const handleClear = () => {
        fields.forEach((f) => f.onChange(''));
        onClear();
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button className="cursor-pointer">
                    <Filter className="mr-1 h-4 w-4" /> {title}
                    {hasActive && <Badge className="ml-2" variant="destructive">Active</Badge>}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-0 w-[400px] h-[440px] max-h-[95vh] overflow-hidden z-[100]">
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {fields.map((field, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <label className="text-xs font-medium">{field.label}</label>

                                {field.type === 'select' && field.options && (
                                    <Select
                                        options={field.options}
                                        isClearable
                                        value={
                                            field.options.find(
                                                (o) => o.value === tempValues[i]
                                            ) || null
                                        }
                                        onChange={(opt) =>
                                            handleFieldChange(i, opt ? opt.value : '')
                                        }
                                        placeholder={`Select ${field.label}`}
                                        className="text-sm"
                                        maxMenuHeight={150}
                                        styles={{
                                            container: (base) => ({
                                                ...base,
                                                width: '100%',
                                            }),
                                            control: (base) => ({
                                                ...base,
                                                minHeight: 36,
                                            }),
                                        }}
                                    />
                                )}

                                {field.type === 'date' && (
                                    <input
                                        type="date"
                                        value={tempValues[i] ? String(tempValues[i]) : ''}
                                        onChange={(e) => handleFieldChange(i, e.target.value)}
                                        className="border rounded-md px-2 py-1 text-sm"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-background p-3 sticky bottom-0">
                        <Button variant="destructive" size="sm" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button size="sm" onClick={handleApply}>
                            Apply
                        </Button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
