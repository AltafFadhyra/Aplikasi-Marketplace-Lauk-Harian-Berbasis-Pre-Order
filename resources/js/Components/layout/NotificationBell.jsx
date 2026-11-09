import { Link } from '@inertiajs/react';
import { Bell, CheckCheck, Package, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const IKON = {
    pesanan: Package,
    pengiriman: Truck,
    verifikasi: ShieldCheck,
    promo: Zap,
    sistem: Bell,
};

const WARNA = {
    pesanan: 'bg-powder-50 text-powder-600',
    pengiriman: 'bg-info-50 text-info-600',
    verifikasi: 'bg-success-50 text-success-600',
    promo: 'bg-butter-50 text-butter-700',
    sistem: 'bg-slate-100 text-navy-500',
};

export default function NotificationBell({ ringkas = false }) {
    const { notifikasi, notifikasiBelumDibaca, tandaiDibaca, tandaiSemuaDibaca } = useDemo();
    const [terbuka, setTerbuka] = useState(false);
    const bungkusRef = useRef(null);

    useEffect(() => {
        function klikLuar(e) {
            if (bungkusRef.current && !bungkusRef.current.contains(e.target)) setTerbuka(false);
        }

        document.addEventListener('mousedown', klikLuar);

        return () => document.removeEventListener('mousedown', klikLuar);
    }, []);

    const belumDibaca = notifikasi.filter((n) => !n.dibaca);
    const tampil = belumDibaca.length ? belumDibaca : notifikasi.slice(0, 6);

    return (
        <div ref={bungkusRef} className="relative">
            <button
                type="button"
                onClick={() => setTerbuka((v) => !v)}
                aria-label={`Notifikasi${notifikasiBelumDibaca ? `, ${notifikasiBelumDibaca} belum dibaca` : ''}`}
                className={[
                    'relative grid place-items-center rounded-2xl text-navy-600 transition-all duration-250',
                    'hover:bg-powder-50 hover:text-powder-600 active:scale-95',
                    ringkas ? 'size-10' : 'size-11',
                    terbuka ? 'bg-powder-50 text-powder-600' : '',
                ].join(' ')}
            >
                <Bell className="size-5" strokeWidth={2.2} />
                {notifikasiBelumDibaca ? (
                    <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-butter-400 px-1 text-[9px] font-extrabold text-navy-900 shadow-[0_0_0_2px_white]">
                        {notifikasiBelumDibaca > 99 ? '99+' : notifikasiBelumDibaca}
                    </span>
                ) : null}
            </button>

            {terbuka ? (
                <div className="glass-strong absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl animate-scale-in">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <p className="text-sm font-extrabold text-navy-900">Notifikasi</p>
                            <p className="text-[11px] text-navy-400">
                                {notifikasiBelumDibaca ? `${notifikasiBelumDibaca} belum dibaca` : 'Semua sudah dibaca'}
                            </p>
                        </div>
                        {belumDibaca.length ? (
                            <button
                                type="button"
                                onClick={tandaiSemuaDibaca}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-powder-600 transition-colors hover:bg-powder-50"
                            >
                                <CheckCheck className="size-3.5" />
                                Tandai dibaca
                            </button>
                        ) : null}
                    </div>

                    <ul className="max-h-96 divide-y divide-slate-50 overflow-y-auto">
                        {tampil.length ? (
                            tampil.slice(0, 10).map((n) => {
                                const Ikon = IKON[n.tipe] ?? Bell;

                                return (
                                    <li key={n.id}>
                                        <Link
                                            href={n.link ?? '/notifikasi'}
                                            onClick={() => {
                                                tandaiDibaca(n.id);
                                                setTerbuka(false);
                                            }}
                                            className={[
                                                'flex gap-3 px-4 py-3 transition-colors hover:bg-powder-50/60',
                                                n.dibaca ? 'opacity-60' : '',
                                            ].join(' ')}
                                        >
                                            <span
                                                className={[
                                                    'grid size-9 shrink-0 place-items-center rounded-xl',
                                                    WARNA[n.tipe] ?? WARNA.sistem,
                                                ].join(' ')}
                                            >
                                                <Ikon className="size-4" strokeWidth={2.3} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-[13px] font-bold text-navy-900">
                                                        {n.judul}
                                                    </span>
                                                    {!n.dibaca ? (
                                                        <span className="size-1.5 shrink-0 rounded-full bg-butter-400" />
                                                    ) : null}
                                                </span>
                                                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-relaxed text-navy-500">
                                                    {n.isi}
                                                </span>
                                                <span className="mt-1 block text-[10px] font-medium text-navy-300">
                                                    {waktuRelatif(n.dibuat_pada)}
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-4 py-10 text-center">
                                <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-powder-50 text-powder-300">
                                    <Bell className="size-6" />
                                </span>
                                <p className="text-[13px] font-semibold text-navy-500">Belum ada notifikasi</p>
                            </li>
                        )}
                    </ul>

                    <Link
                        href="/notifikasi"
                        onClick={() => setTerbuka(false)}
                        className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-bold text-powder-600 transition-colors hover:bg-powder-50"
                    >
                        Lihat semua notifikasi
                    </Link>
                </div>
            ) : null}
        </div>
    );
}
