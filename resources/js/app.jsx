import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { Toaster } from './Components/ui/Toaster';
import { DemoProvider, useJaga } from './stores/DemoContext';
import './bootstrap';

const appName = import.meta.env.VITE_APP_NAME || 'Preorderly';

/**
 * Peta peran yang boleh membuka tiap kelompok halaman.
 * Semua halaman dijaga: tamu akan dialihkan ke /auth/login,
 * dan peran yang salah dialihkan ke dashboard perannya sendiri.
 */
const JAGA = [
    // Halaman auth hanya untuk tamu (sudah login? → dilempar ke dashboard).
    [
        /^Auth\/(Login|Register|RegisterSeller|RegisterCourier|ForgotPassword|ResetPassword|VerifyOtp|DemoAccounts)$/,
        'tamu',
    ],
    // Halaman auth yang butuh sesi (mis. ganti password) & halaman publik → login saja.
    [/^Public\//, 'auth'],
    [/^Buyer\//, 'pembeli'],
    [/^Seller\//, 'penjual'],
    [/^Courier\//, 'kurir'],
    [/^Admin\//, 'admin'],
];

/** Membungkus halaman dengan gerbang login/peran sebelum dirender. */
function Penjaga({ peran, children }) {
    const boleh = useJaga(peran);

    return boleh ? children : null;
}

/** Cache wrapper per nama halaman agar tipe komponen stabil antar navigasi. */
const penjagaCache = new Map();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Halaman Inertia tidak ditemukan: ./Pages/${name}.jsx`);
        }

        if (!penjagaCache.has(name)) {
            const peran = JAGA.find(([pol]) => pol.test(name))?.[1] ?? 'auth';
            const Halaman = page.default;

            penjagaCache.set(name, (props) => (
                <Penjaga peran={peran}>
                    <Halaman {...props} />
                </Penjaga>
            ));
        }

        return penjagaCache.get(name);
    },

    setup({ el, App, props }) {
        // `props` dari setup() adalah runtime Inertia (initialPage, initialComponent, ...),
        // bukan page props. Props halaman ada di props.initialPage.props.
        createRoot(el).render(
            <DemoProvider propsAwal={props?.initialPage?.props}>
                <App {...props} />
                <Toaster />
            </DemoProvider>,
        );
    },

    progress: {
        color: '#6D9CD2',
        showSpinner: false,
    },
});
