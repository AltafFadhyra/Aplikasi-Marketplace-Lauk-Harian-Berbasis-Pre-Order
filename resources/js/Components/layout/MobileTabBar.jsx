import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, Home, Search, User, UtensilsCrossed } from 'lucide-react';
import { useDemo } from '../../stores/DemoContext';

export default function MobileTabBar() {
    const url = usePage().url;
    const { penggunaAktif } = useDemo();
    const akun = penggunaAktif ?? {};

    const tab = [
        { label: 'Beranda', href: '/', ikon: Home, tepat: (u) => u === '/' },
        { label: 'Cari', href: '/cari', ikon: Search, tepat: (u) => u.startsWith('/cari') },
        { label: 'Pesanan', href: '/pesanan', ikon: ClipboardList, tepat: (u) => u.startsWith('/pesanan') },
        akun?.email
            ? { label: 'Profil', href: '/profil', ikon: User, tepat: (u) => u === '/profil' }
            : { label: 'Masuk', href: '/auth/login', ikon: UtensilsCrossed, tepat: (u) => u.startsWith('/auth') },
    ];

    return (
        <nav
            aria-label="Navigasi utama"
            className="glass-strong fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
            <ul className="mx-auto flex max-w-lg items-stretch">
                {tab.map((t) => {
                    const aktif = t.tepat(url);
                    const Ikon = t.ikon;

                    return (
                        <li key={t.href} className="flex-1">
                            <Link
                                href={t.href}
                                aria-current={aktif ? 'page' : undefined}
                                className={[
                                    'flex flex-col items-center gap-1 px-1 py-2.5 transition-colors',
                                    aktif ? 'text-powder-600' : 'text-navy-400',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'grid size-8 place-items-center rounded-xl transition-all duration-300',
                                        aktif ? 'bg-powder-50 scale-105' : '',
                                    ].join(' ')}
                                >
                                    <Ikon className="size-[18px]" strokeWidth={aktif ? 2.5 : 2} />
                                </span>
                                <span className={['text-[10px]', aktif ? 'font-extrabold' : 'font-semibold'].join(' ')}>
                                    {t.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
