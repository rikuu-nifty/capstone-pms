import { useEffect, useState } from 'react';

export default function useDebouncedValue<T>(value: T, delay = 200) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(id);
    }, [value, delay]);
    return debounced;
}