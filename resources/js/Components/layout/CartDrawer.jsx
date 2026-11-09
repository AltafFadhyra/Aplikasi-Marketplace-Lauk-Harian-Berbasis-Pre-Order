import { Link } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import Button from '../ui/Button';
import { Kosong } from '../ui/Feedback';
import { hitungOngkir } from '../../lib/distance';
import { rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';
import { useEffect } from 'react';
import { useScrollLock } from '../../hooks';

export default function CartDrawer({ buka, tutup }) {
    // SEMUA HOOK DIPANGIL DI SINI - SEBELUM ANY CONDITIONAL RETURN
    useScrollLock(buka);

    const { keranjang, keranjangRingkas, ubahQtyKeranjang, hapusKeranjang, seed } = useDemo();

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') tutup();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [tutup]);

    useEffect(() => {
        if (!buka) return undefined;

        const dialog = document.querySelector('aside[aria-label="Keranjang"]');
        if (dialog) {
            const firstFocusable = dialog.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }

        return () => {
            // Restore focus or clean up
        };
    }, [buka]);

    // SEKARANG EARLY RETURN AMAN - SEMUA HOOK SUDAH DIPANGIL
    if (!buka) return null;

    const restoran = (seed?.restoran ?? []).find((r) => String(r.id) === String(keranjangRingkas.restoranIds[0]));
    const jarak = restoran?.jarak_km ?? 0;
    const ongkir = hitungOngkir(jarak, keranjangRingkas.subtotal);
    const total = keranjangRingkas.subtotal + ongkir.dasar + 2000;
    const kurangMin = restoran && keranjangRingkas.subtotal < restoran.min_order;

    if (!buka) return null;

    return (
        <>
            <button
                type="button"
                aria-label="Tutup keranjang"
                onClick={tutup}
                className={[
                    'fixed inset-0 z-[90] bg-navy-900/40 backdrop-blur-sm transition-opacity duration-300',
                    buka ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
                ].join(' ')}
            />

            <aside
                aria-label="Keranjang"
                className={[
                    'fixed top-0 right-0 bottom-0 z-[95] flex w-full max-w-md flex-col bg-white shadow-lift transition-transform duration-300 ease-out',
                    buka ? 'translate-x-0' : 'translate-x-full',
                ].join(' ')}
            >
                <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <span className="grid size-10 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                            <ShoppingBag className="size-5" strokeWidth={2.2} />
                        </span>
                        <div>
                            <p className="text-sm font-extrabold text-navy-900">Keranjang</p>
                            <p className="text-[11px] text-navy-400">
                                {keranjangRingkas.jumlah ? `${keranjangRingkas.jumlah} item dipilih` : 'Masih kosong'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={tutup}
                        className="rounded-xl px-3 py-1.5 text-xs font-bold text-powder-600 transition-colors hover:bg-powder-50"
                    >
                        Tutup
                    </button>
                </header>

                {keranjang.length ? (
                    <>
                        {keranjangRingkas.restoranIds.length > 1 ? (
                            <div className="mx-5 mt-4 rounded-2xl border border-warning-500/25 bg-warning-50 px-4 py-3">
                                <p className="text-[12px] font-semibold text-navy-700">
                                    Keranjang berisi {keranjangRingkas.restoranIds.length} restoran berbeda. Tiap restoran
                                    diproses sebagai pesanan terpisah.
                                </p>
                            </div>
                        ) : null}

                        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
                            {keranjang.map((b) => (
                                <li key={b.id} className="flex gap-3 py-4">
                                    <img
                                        src={b.gambar}
                                        alt={b.nama}
                                        onError={(e) => {
                                            e.currentTarget.style.visibility = 'hidden';
                                        }}
                                        className="size-16 shrink-0 rounded-2xl object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-bold text-navy-900">{b.nama}</p>
                                        <p className="mt-0.5 text-[11px] text-navy-400">
                                            {rupiah(b.harga)} · {b.lead_time_menit} menit
                                        </p>
                                        {b.catatan ? (
                                            <p className="mt-1 truncate text-[11px] text-powder-600">Catatan: {b.catatan}</p>
                                        ) : null}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => ubahQtyKeranjang(b.id, b.qty - 1)}
                                                    aria-label="Kurangi"
                                                    className="grid size-7 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-slate-100"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>
                                                <span className="w-7 text-center text-[13px] font-extrabold text-navy-900">
                                                    {b.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => ubahQtyKeranjang(b.id, b.qty + 1)}
                                                    aria-label="Tambah"
                                                    className="grid size-7 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-slate-100"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-extrabold text-navy-900">
                                                    {rupiah(b.harga * b.qty)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => hapusKeranjang(b.id)}
                                                    aria-label="Hapus"
                                                    className="grid size-7 place-items-center rounded-lg text-navy-300 transition-colors hover:bg-danger-50 hover:text-danger-500"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <footer className="space-y-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                            <dl className="space-y-1.5 text-[13px]">
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Subtotal</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(keranjangRingkas.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="inline-flex items-center gap-1.5 text-navy-400">
                                        <Truck className="size-3.5" />
                                        Ongkir ({jarak} km)
                                    </dt>
                                    <dd className={['font-bold', ongkir.gratis ? 'text-success-600' : 'text-navy-900'].join(' ')}>
                                        {ongkir.label}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Biaya layanan</dt>
                                    <dd className="font-bold text-navy-900">Rp2.000</dd>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
                                    <dt className="font-bold text-navy-800">Total</dt>
                                    <dd className="text-base font-extrabold text-navy-900">{rupiah(total)}</dd>
                                </div>
                            </dl>

                            {kurangMin ? (
                                <p className="rounded-xl bg-warning-50 px-3 py-2 text-[11px] font-semibold text-warning-600">
                                    Minimal order {restoran.nama} adalah {rupiah(restoran.min_order)}.
                                </p>
                            ) : null}
                        </footer>

                        <Button as={Link} href="/keranjang" onClick={tutup} varian="garis" lebarPenuh ukuran="sm">
                            Lihat keranjang lengkap
                        </Button>
                        <Button
                            as={Link}
                            href="/keranjang/checkout"
                            onClick={tutup}
                            lebarPenuh
                            disabled={kurangMin}
                        >
                            Lanjut ke checkout
                        </Button>
                    </>
                ) : (
                    <Kosong
                        ikon={ShoppingBag}
                        judul="Keranjang masih kosong"
                        deskripsi="Cari restoran favoritmu dan pesan untuk diantar besok."
                        aksi={
                            <Button as={Link} href="/cari" onClick={tutup} ukuran="sm">Mulai pesan</Button>
                        }
                        className="flex-1"
                    />
                )}
            </aside>
        </>
    );
}