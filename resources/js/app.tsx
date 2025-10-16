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


// ✅ Global error interceptor for expired session, auth, or server crash
router.on('error', (event) => {
    const detail = (event as unknown as { detail?: { response?: { status?: number } } }).detail
    const status = detail?.response?.status

    if ([401, 419, 440, 500].includes(status ?? 0)) {
        console.error(`Server/Auth error (${status}) — forcing logout...`)

        // Clear any stored session data
        localStorage.clear()
        sessionStorage.clear()

        // Optionally show a quick message
        alert('Your session has expired. You will be redirected to login.')

        // Redirect to Laravel's logout (which also invalidates session server-side)
        window.location.href = route('force.logout')
    }
})

// This will set light / dark mode on load...
initializeTheme();
