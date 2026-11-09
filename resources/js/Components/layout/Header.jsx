import { Link, usePage } from '@inertiajs/react';
import { Menu, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDemo } from '../../stores/DemoContext';
import { useScrollLock } from '../../hooks';
import Logo from '../ui/Logo';
import { Drawer } from '../ui/Modal';
import CartDrawer from './CartDrawer';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const MENU_UTAMA = [
    { label: 'Beranda', href: '/' },
    { label: 'Cari Makanan', href: '/cari' },
    { label: 'Pesanan Saya', href: '/pesanan' },
];

function CartButton({ onClick }) {
    const { keranjangRingkas } = useDemo();

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Keranjang${keranjangRingkas.jumlah ? `, ${keranjangRingkas.jumlah} item` : ', kosong'}`}
            className="relative grid size-11 place-items-center rounded-2xl text-navy-600 transition-all duration-250 hover:bg-powder-50 hover:text-powder-600 active:scale-95"
        >
            <ShoppingBag className="size-5" strokeWidth={2.2} />
            {keranjangRingkas.jumlah ? (
                <span className="absolute top-1 right-0.5 grid min-w-4 place-items-center rounded-full bg-butter-400 px-1 text-[9px] font-extrabold text-navy-900 shadow-[0_0_0_2px_white]">
                    {keranjangRingkas.jumlah}
                </span>
            ) : null}
        </button>
    );
}

export default function Header() {
    const url = usePage().url;
    const { penggunaAktif } = useDemo();
    const [drawerBuka, setDrawerBuka] = useState(false);
    const [keranjangBuka, setKeranjangBuka] = useState(false);
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScroll(window.scrollY > 8);
        }

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useScrollLock(drawerBuka || keranjangBuka);

    const akun = penggunaAktif ?? {};

    return (
        <>
            <header
                className={[
                    'sticky top-0 z-50 transition-all duration-300',
                    scroll
                        ? 'border-b border-slate-200/70 bg-white/85 shadow-[0_4px_24px_-12px_rgba(15,42,71,0.25)] backdrop-blur-xl'
                        : 'bg-white/60 backdrop-blur-sm',
                ].join(' ')}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-18 sm:gap-4 sm:px-6">
                    <Link href="/" className="shrink-0" aria-label="Preorderly — beranda">
                        <Logo ukuran="sm" />
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {MENU_UTAMA.map((m) => {
                            const aktif = m.href === '/' ? url === '/' : url.startsWith(m.href);

                            return (
                                <Link
                                    key={m.href}
                                    href={m.href}
                                    className={[
                                        'relative rounded-xl px-3 py-2 text-[13px] font-bold transition-colors',
                                        aktif ? 'text-powder-600' : 'text-navy-600 hover:text-powder-600',
                                    ].join(' ')}
                                >
                                    {m.label}
                                    {aktif ? (
                                        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-powder-500" />
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto hidden min-w-0 flex-1 justify-center md:flex">
                        <SearchBar />
                    </div>

                    <div className="ml-auto flex items-center gap-1 md:ml-0">
                        <CartButton onClick={() => setKeranjangBuka(true)} />
                        <NotificationBell />

                        {akun?.email ? (
                            <UserMenu />
                        ) : (
                            <Link
                                href="/auth/login"
                                className="hidden h-10 items-center rounded-2xl bg-gradient-to-br from-powder-500 to-powder-600 px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(109,156,210,0.9)] transition-transform active:scale-95 sm:flex"
                            >
                                Masuk
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setDrawerBuka(true)}
                            aria-label="Buka menu"
                            className="grid size-11 place-items-center rounded-2xl text-navy-600 transition-colors hover:bg-powder-50 lg:hidden"
                        >
                            <Menu className="size-5" strokeWidth={2.2} />
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-100/80 px-4 py-2.5 md:hidden">
                    <SearchBar ringkas placeholder="Cari makanan atau restoran..." />
                </div>
            </header>

            <CartDrawer buka={keranjangBuka} tutup={() => setKeranjangBuka(false)} />

            <Drawer
                buka={drawerBuka}
                tutup={() => setDrawerBuka(false)}
                judul="Menu"
                sisi="kiri"
                lebar="max-w-xs"
            >
                <nav className="space-y-1">
                    {MENU_UTAMA.map((m) => (
                        <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => setDrawerBuka(false)}
                            className="block rounded-2xl px-4 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-powder-50"
                        >
                            {m.label}
                        </Link>
                    ))}
                    <div className="my-3 h-px bg-slate-100" />
                    <Link
                        href="/courier"
                        onClick={() => setDrawerBuka(false)}
                        className="block rounded-2xl px-4 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-powder-50"
                    >
                        Mode Kurir
                    </Link>
                    <Link
                        href="/seller"
                        onClick={() => setDrawerBuka(false)}
                        className="block rounded-2xl px-4 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-powder-50"
                    >
                        Mode Penjual
                    </Link>
                    <Link
                        href="/admin"
                        onClick={() => setDrawerBuka(false)}
                        className="block rounded-2xl px-4 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-powder-50"
                    >
                        Mode Admin
                    </Link>
                    {!akun?.email ? (
                        <>
                            <div className="my-3 h-px bg-slate-100" />
                            <Link
                                href="/auth/login"
                                onClick={() => setDrawerBuka(false)}
                                className="block rounded-2xl bg-gradient-to-br from-powder-500 to-powder-600 px-4 py-3 text-center text-sm font-bold text-white"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/auth/register"
                                onClick={() => setDrawerBuka(false)}
                                className="mt-2 block rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-navy-700"
                            >
                                Daftar
                            </Link>
                        </>
                    ) : null}
                </nav>
            </Drawer>
        </>
    );
}
