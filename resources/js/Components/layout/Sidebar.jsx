import { Link, usePage } from '@inertiajs/react';
import {
    User,
    CalendarClock,
    ClipboardList,
    FileText,
    LayoutDashboard,
    LogOut,
    Settings,
    ShieldCheck,
    Store,
    Tags,
    UtensilsCrossed,
    X,
} from 'lucide-react';
import { useDemo } from '../../stores/DemoContext';
import { Avatar } from '../ui/Avatar';
import Logo from '../ui/Logo';

const MENU = {
    penjual: [
        { label: 'Dashboard', href: '/seller', ikon: LayoutDashboard, tepat: true },
        { label: 'Pesanan Masuk', href: '/seller/pesanan', ikon: ClipboardList },
        { label: 'Kelola Menu', href: '/seller/menu', ikon: UtensilsCrossed },
        { label: 'Jadwal Produksi', href: '/seller/jadwal', ikon: CalendarClock },
        { label: 'Profil Toko', href: '/seller/toko', ikon: Store },
    ],
    kurir: [
        { label: 'Dashboard', href: '/courier', ikon: LayoutDashboard, tepat: true },
        { label: 'Pesanan Tersedia', href: '/courier/tersedia', ikon: ClipboardList },
        { label: 'Pengiriman Aktif', href: '/courier/pengiriman', ikon: UtensilsCrossed },
        { label: 'Riwayat', href: '/courier/riwayat', ikon: CalendarClock },
        { label: 'Profil Kurir', href: '/courier/profil', ikon: Store },
    ],
    admin: [
        { label: 'Dashboard', href: '/admin', ikon: LayoutDashboard, tepat: true },
        { label: 'Profil', href: '/admin/profile', ikon: User },
        { label: 'Verifikasi Akun', href: '/admin/verifikasi', ikon: ShieldCheck },
        { label: 'Pengguna', href: '/admin/pengguna', ikon: ClipboardList },
        { label: 'Restoran', href: '/admin/restoran', ikon: Store },
        { label: 'Pesanan', href: '/admin/pesanan', ikon: UtensilsCrossed },
        { label: 'Kategori', href: '/admin/kategori', ikon: Tags },
        { label: 'Dokumen', href: '/admin/dokumen', ikon: FileText },
        { label: 'Pengaturan', href: '/admin/pengaturan', ikon: Settings },
    ],
};

export default function Sidebar({ peran, buka, tutup }) {
    const url = usePage().url;
    const { penggunaAktif, keluar } = useDemo();
    const akun = penggunaAktif ?? {};
    const items = MENU[peran] ?? MENU.penjual;

    return (
        <>
            <button
                type="button"
                aria-label="Tutup menu"
                onClick={tutup}
                className={[
                    'fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
                    buka ? 'opacity-100' : 'pointer-events-none opacity-0',
                ].join(' ')}
            />

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-slate-200/70 bg-white',
                    'transition-transform duration-300 ease-out',
                    buka ? 'translate-x-0 shadow-lift' : '-translate-x-full',
                    'lg:translate-x-0 lg:shadow-none',
                ].join(' ')}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
                    <Link href="/" aria-label="Preorderly — beranda">
                        <Logo ukuran="sm" />
                    </Link>
                    <button
                        type="button"
                        onClick={tutup}
                        aria-label="Tutup menu"
                        className="grid size-9 place-items-center rounded-xl text-navy-400 hover:bg-slate-100 lg:hidden"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="border-b border-slate-100 p-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-powder-50/70 p-3">
                        <Avatar
                            nama={penggunaAktif?.nama}
                            gambar={penggunaAktif?.avatar}
                            ukuran="md"
                        />
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-extrabold text-navy-900">
                                {penggunaAktif?.nama ?? 'Demo'}
                            </p>
                            <p className="truncate text-[11px] text-navy-500">
                                {akun?.toko ?? akun?.email ?? '-'}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Menu dashboard">
                    {items.map((m) => {
                        const aktif = m.tepat ? url === m.href : url.startsWith(m.href);
                        const Ikon = m.ikon;

                        return (
                            <Link
                                key={m.href}
                                href={m.href}
                                onClick={tutup}
                                className={[
                                    'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-bold transition-all duration-250',
                                    aktif
                                        ? 'bg-gradient-to-br from-powder-500 to-powder-600 text-white shadow-[0_8px_18px_-8px_rgba(109,156,210,0.9)]'
                                        : 'text-navy-600 hover:bg-powder-50 hover:text-powder-700',
                                ].join(' ')}
                            >
                                <Ikon className="size-[18px] shrink-0" strokeWidth={aktif ? 2.4 : 2.1} />
                                <span className="truncate">{m.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="space-y-1 border-t border-slate-100 p-3">
                    <button
                        type="button"
                        onClick={keluar}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-danger-500 transition-colors hover:bg-danger-50"
                    >
                        <LogOut className="size-[18px]" />
                        Keluar
                    </button>
                </div>
            </aside>
        </>
    );
}
