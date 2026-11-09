import { Link, usePage, router } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useDemo } from '../../stores/DemoContext';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

export default function Topbar({ peran, judul, bukaSidebar }) {
    const { penggunaAktif } = useDemo();
    const url = usePage().url;
    const [cariMobile, setCariMobile] = useState(false);
    const akun = penggunaAktif ?? {};

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
                <button
                    type="button"
                    onClick={bukaSidebar}
                    aria-label="Buka menu"
                    className="grid size-10 shrink-0 place-items-center rounded-2xl text-navy-600 transition-colors hover:bg-powder-50 lg:hidden"
                >
                    <Menu className="size-5" strokeWidth={2.2} />
                </button>

                <h1 className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-navy-900 sm:text-base">
                    {judul}
                </h1>

                {cariMobile ? (
                    <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white px-4 py-3 md:hidden">
                        <SearchBar
                            ringkas
                            placeholder="Cari..."
                            onSubmit={() => router.replace('/cari')}
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setCariMobile(true)}
                        aria-label="Cari"
                        className="grid size-10 shrink-0 place-items-center rounded-2xl text-navy-600 transition-colors hover:bg-powder-50 md:hidden"
                    >
                        <Search className="size-5" strokeWidth={2.2} />
                    </button>
                )}

                <div className="hidden w-full max-w-sm shrink-0 md:block">
                    <SearchBar ringkas placeholder="Cari apa saja..." />
                </div>

                {akun?.email ? (
                    <div className="flex shrink-0 items-center gap-1">
                        <NotificationBell ringkas />
                        <UserMenu />
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex h-10 shrink-0 items-center rounded-2xl bg-gradient-to-br from-powder-500 to-powder-600 px-4 text-[13px] font-bold text-white"
                    >
                        Masuk
                    </Link>
                )}
            </div>
        </header>
    );
}
