import { Link } from '@inertiajs/react';
import { Clock3, Flame, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';
import { useDemo } from '../../stores/DemoContext';
import { rupiah } from '../../lib/format';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

export function MenuCard({ menu, restoran, ringkas = false, onTambah }) {
    const { tambahKeranjang, busy } = useDemo();
    const [qty, setQty] = useState(1);
    const [terbuka, setTerbuka] = useState(false);

    const harga = menu.harga_efektif || menu.harga;
    const diskon = menu.harga_efektif && menu.harga_efektif < menu.harga;
    const perluSlot = menu.hanya_preorder || !restoran?.buka;

    function tambah() {
        tambahKeranjang(menu, { qty, restoran, });
        setQty(1);
        setTerbuka(false);
        onTambah?.(menu);
    }

    return (
        <Card hover className="group flex flex-col overflow-hidden">
            <div className="relative overflow-hidden">
                <img
                    src={menu.gambar}
                    alt={menu.nama}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden';
                    }}
                    className={[
                        'w-full object-cover transition-transform duration-500 group-hover:scale-105',
                        ringkas ? 'h-28' : 'h-36',
                    ].join(' ')}
                />

                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {diskon ? (
                        <Badge tone="bahaya" ukuran="xs">
                            Diskon
                        </Badge>
                    ) : null}
                    {menu.hanya_preorder ? (
                        <Badge tone="peringatan" ukuran="xs" ikon={Clock3}>
                            Pre-order
                        </Badge>
                    ) : null}
                    {menu.terjual >= 100 ? (
                        <Badge tone="butter" ukuran="xs" ikon={Flame}>
                            {menu.terjual} terjual
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-3.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 flex-1 text-[13px] leading-snug font-extrabold text-navy-900">
                        {menu.nama}
                    </h3>
                    {menu.rating ? (
                        <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-navy-500">
                            <Star className="size-3 fill-butter-400 text-butter-400" />
                            {menu.rating.toFixed(1)}
                        </span>
                    ) : null}
                </div>

                {!ringkas && menu.deskripsi ? (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-navy-400">{menu.deskripsi}</p>
                ) : null}

                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-navy-300">
                    <Clock3 className="size-3" />
                    {perluSlot ? `${menu.lead_time_label} · pilih slot saat checkout` : menu.lead_time_label}
                </p>

                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div className="min-w-0">
                        {diskon ? (
                            <p className="text-[10px] font-semibold text-navy-300 line-through">
                                {rupiah(menu.harga)}
                            </p>
                        ) : null}
                        <p className="text-[14px] leading-none font-extrabold text-navy-900">
                            {rupiah(harga)}
                        </p>
                    </div>

                    {!terbuka ? (
                        <Button ukuran="sm" onClick={() => setTerbuka(true)}>
                            <Plus className="size-4" />
                            Tambah
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    aria-label="Kurangi"
                                    className="grid size-6 place-items-center rounded-lg text-navy-500 hover:bg-slate-100"
                                >
                                    <Minus className="size-3" />
                                </button>
                                <span className="w-6 text-center text-[12px] font-extrabold text-navy-900">
                                    {qty}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQty((q) => q + 1)}
                                    aria-label="Tambah"
                                    className="grid size-6 place-items-center rounded-lg text-navy-500 hover:bg-slate-100"
                                >
                                    <Plus className="size-3" />
                                </button>
                            </div>
                            <Button ukuran="sm" onClick={tambah} memuat={busy}>
                                <ShoppingBag className="size-3.5" />
                            </Button>
                                    <Button ukuran="sm" varian="lembut" onClick={() => setTerbuka(false)}>
                                <Minus className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

export function MenuGrid({ menu, restoran, columns = 'sm:grid-cols-2 xl:grid-cols-3' }) {
    if (!menu?.length) {
        return (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
                <p className="text-sm font-bold text-navy-500">Belum ada menu di sini</p>
                <p className="mt-1 text-[12px] text-navy-400">Coba pilih restoran lain.</p>
            </div>
        );
    }

    return (
        <div className={['grid gap-4', columns].join(' ')}>
            {menu.map((m) => (
                <MenuCard key={m.id} menu={m} restoran={restoran} />
            ))}
        </div>
    );
}

export function MenuLink({ menu, className = '' }) {
    return (
        <Link
            href={`/cari/menu/${menu.id}`}
            className={[
                'flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-powder-50',
                className,
            ].join(' ')}
        >
            <img
                src={menu.gambar}
                alt={menu.nama}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                }}
                className="size-12 shrink-0 rounded-xl object-cover"
            />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-bold text-navy-900">{menu.nama}</span>
                <span className="block text-[10px] text-navy-400">{rupiah(menu.harga_efektif || menu.harga)}</span>
            </span>
        </Link>
    );
}
