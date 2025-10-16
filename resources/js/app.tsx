import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const version = import.meta.env.VITE_APP_VERSION || Date.now().toString();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
    version: () => version,
});


// ✅ Global 500 Error Interceptor
router.on('error', (event) => {
    // Cast detail safely (the event.detail from Inertia is dynamic)
    const detail = (event as unknown as { detail?: { response?: { status?: number } } }).detail
    const status = detail?.response?.status

    if (status === 500) {
        console.error('500 Server Error detected — forcing logout...')

        // Clear cached data
        localStorage.clear()
        sessionStorage.clear()

        // Redirect to Laravel logout route
        window.location.href = route('logout')
    }
})

// This will set light / dark mode on load...
initializeTheme();
