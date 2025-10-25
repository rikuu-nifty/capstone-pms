export const toInputDateTimeLocal = (d = new Date()) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// convert from <input type="datetime-local"> to "YYYY-MM-DD HH:mm:ss"
export const toServerDateTime = (value: string) => value ? value.replace('T', ' ') + (value.length === 16 ? ':00' : '') : '';

export const formatDateTimeLong = (value?: string | null) => {
    if (!value) return '—';
    // cast "YYYY-MM-DD HH:mm:ss" to valid Date input
    const iso = value.includes('T') ? value : value.replace(' ', 'T');
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return value; // fallback
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};
