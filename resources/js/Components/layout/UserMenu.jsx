import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LABEL_ROLE } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';
import { Avatar } from '../ui/Avatar';

export default function UserMenu() {
    const { penggunaAktif, peran, keluar } = useDemo();
    const [terbuka, setTerbuka] = useState(false);
    const ref = useRef(null);
    const url = usePage().url;

    useEffect(() => {
        function klikLuar(e) {
            if (ref.current && !ref.current.contains(e.target)) setTerbuka(false);
        }

        document.addEventListener('mousedown', klikLuar);

        return () => document.removeEventListener('mousedown', klikLuar);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setTerbuka((v) => !v)}
                aria-expanded={terbuka}
                aria-label="Menu akun"
                className={[
                    'flex items-center gap-2 rounded-2xl p-1 pr-2 transition-all duration-250',
                    'hover:bg-powder-50 active:scale-95',
                    terbuka ? 'bg-powder-50' : '',
                ].join(' ')}
            >
                <Avatar nama={penggunaAktif?.nama} gambar={penggunaAktif?.avatar} ukuran="sm" />
                <span className="hidden text-left sm:block">
                    <span className="block max-w-28 truncate text-[13px] leading-tight font-extrabold text-navy-900">
                        {penggunaAktif?.nama ?? 'Akun'}
                    </span>
                    <span className="block text-[10px] font-semibold tracking-wide text-navy-400 uppercase">
                        {LABEL_ROLE[peran] ?? peran}
                    </span>
                </span>
                <ChevronDown
                    className={[
                        'hidden size-3.5 text-navy-300 transition-transform duration-300 sm:block',
                        terbuka ? 'rotate-180' : '',
                    ].join(' ')}
                />
            </button>

            {terbuka ? (
                <div className="glass-strong absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-3xl animate-scale-in">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                        <Avatar nama={penggunaAktif?.nama} gambar={penggunaAktif?.avatar} ukuran="md" />
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-extrabold text-navy-900">
                                {penggunaAktif?.nama}
                            </p>
                            <p className="truncate text-[11px] text-navy-400">{penggunaAktif?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-0.5 p-2">
                        {peran === 'admin' ? (
                            <>
                                <Link
                                    href="/admin/profile"
                                    onClick={() => setTerbuka(false)}
                                    className={[
                                        'flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold transition-colors hover:bg-slate-50',
                                        url === '/admin/profile' ? 'text-powder-600' : 'text-navy-600',
                                    ].join(' ')}
                                >
                                    <User className="size-4" />
                                    Profil admin
                                </Link>
                                <Link
                                    href="/auth/ganti-password"
                                    onClick={() => setTerbuka(false)}
                                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold text-navy-600 transition-colors hover:bg-slate-50"
                                >
                                    <Settings className="size-4" />
                                    Ganti password
                                </Link>
                            </>
                        ) : peran === 'penjual' ? (
                            <>
                                <Link
                                    href="/toko"
                                    onClick={() => setTerbuka(false)}
                                    className={[
                                        'flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold transition-colors hover:bg-slate-50',
                                        url === '/toko' ? 'text-powder-600' : 'text-navy-600',
                                    ].join(' ')}
                                >
                                    <Store className="size-4" />
                                    Profil toko
                                </Link>
                                <Link
                                    href="/auth/ganti-password"
                                    onClick={() => setTerbuka(false)}
                                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold text-navy-600 transition-colors hover:bg-slate-50"
                                >
                                    <Settings className="size-4" />
                                    Ganti password
                                </Link>
                            </>
                        ) : peran === 'kurir' ? (
                            <>
                                <Link
                                    href="/courier/profil"
                                    onClick={() => setTerbuka(false)}
                                    className={[
                                        'flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold transition-colors hover:bg-slate-50',
                                        url === '/courier/profil' ? 'text-powder-600' : 'text-navy-600',
                                    ].join(' ')}
                                >
                                    <Store className="size-4" />
                                    Profil kurir
                                </Link>
                                <Link
                                    href="/auth/ganti-password"
                                    onClick={() => setTerbuka(false)}
                                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold text-navy-600 transition-colors hover:bg-slate-50"
                                >
                                    <Settings className="size-4" />
                                    Ganti password
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/profil"
                                    onClick={() => setTerbuka(false)}
                                    className={[
                                        'flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold transition-colors hover:bg-slate-50',
                                        url === '/profil' ? 'text-powder-600' : 'text-navy-600',
                                    ].join(' ')}
                                >
                                    <User className="size-4" />
                                    Profil saya
                                </Link>
                                <Link
                                    href="/auth/ganti-password"
                                    onClick={() => setTerbuka(false)}
                                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold text-navy-600 transition-colors hover:bg-slate-50"
                                >
                                    <Settings className="size-4" />
                                    Ganti password
                                </Link>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setTerbuka(false);
                            keluar();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2 text-[12px] font-semibold text-danger-500 transition-colors hover:bg-danger-50"
                    >
                        <LogOut className="size-4" />
                        Keluar
                    </button>
                </div>
            ) : null}
        </div>
    );
}