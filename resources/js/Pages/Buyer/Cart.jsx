import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { MenuLink } from '../../Components/buyer/MenuCard';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import AppLayout from '../../Layouts/AppLayout';
import { hitungOngkir } from '../../lib/distance';
import { BIAYA_LAYANAN } from '../../lib/constants';
import { rupiah } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function Cart() {
    const {
        keranjang,
        keranjangRingkas,
        ubahQtyKeranjang,
        hapusKeranjang,
        kosongkanKeranjang,
        seed,
    } = useDemo();

    const semuaRestoran = seed.restoran ?? [];

    let menuRecommended = [];
    if (keranjangRingkas.restoranIds.length > 0) {
        const restoId = keranjangRingkas.restoranIds[0];
        const resto = semuaRestoran.find((r) => String(r.id) === String(restoId));
        menuRecommended = resto?.menu?.slice(0, 4) ?? [];
    }

    if (!keranjang.length) {
        return (
            <AppLayout>
                <Head title="Keranjang" />
                <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
                    <Kosong
                        ikon={ShoppingBag}
                        judul="Keranjangmu masih kosong"
                        deskripsi="Temukan restoran terdekat dan pesan makanan untuk hari esok. Pesanan pre-order dibuka sampai 3 hari ke depan."
                        aksi={
                            <div className="flex flex-wrap justify-center gap-2">
                                <Button as={Link} href="/cari">Mulai pesan</Button>
                                <Button as={Link} href="/" varian="garis">Lihat restoran populer</Button>
                            </div>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                </div>
            </AppLayout>
        );
    }

    // Kelompokkan item per restoran, karena tiap restoran punya slot dan diproses terpisah.
    const grup = keranjang.reduce((acc, b) => {
        (acc[b.restoran_id] ||= []).push(b);

        return acc;
    }, {});

    return (
        <AppLayout>
            <Head title="Keranjang" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">Keranjang</h1>
                        <p className="mt-1 text-[13px] text-navy-400">
                            {keranjangRingkas.jumlah} item dari {keranjangRingkas.restoranIds.length} restoran
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={kosongkanKeranjang}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-danger-500 hover:underline"
                    >
                        <Trash2 className="size-3.5" />
                        Kosongkan
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Daftar item */}
                    <div className="space-y-4 lg:col-span-2">
                        {Object.entries(grup).map(([restoId, item]) => {
                            const resto = semuaRestoran.find((r) => String(r.id) === String(restoId));
                            const subtotal = item.reduce((t, b) => t + b.harga * b.qty, 0);
                            const restoranPertama = keranjangRingkas.restoranIds.length > 0 ? keranjang.find((b) => String(b.restoran_id) === String(keranjangRingkas.restoranIds[0])) : null;
                            const minOrderTerpenuhi = keranjangRingkas.minOrderTersatisfied;

                            return (
                                <Card key={restoId} className="overflow-hidden">
                                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                                        <img
                                            src={resto?.logo ?? resto?.banner}
                                            alt={resto?.nama}
                                            onError={(e) => {
                                                e.currentTarget.style.visibility = 'hidden';
                                            }}
                                            className="size-10 shrink-0 rounded-xl object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/cari/restoran/${resto?.slug}`}
                                                className="block truncate text-[13px] font-extrabold text-navy-900 hover:text-powder-600"
                                            >
                                                {resto?.nama ?? 'Restoran'}
                                            </Link>
                                            <p className="truncate text-[11px] text-navy-400">
                                                {resto?.kategori} Â· {resto?.persiapan_label}
                                            </p>
                                        </div>
                                        {!minOrderTerpenuhi ? (
                                            <Badge tone="peringatan" ukuran="sm">
                                                Min. {rupiah(resto?.min_order ?? 0)}
                                            </Badge>
                                        ) : (
                                            <Badge tone="sukses" ukuran="sm" ikon={Truck}>
                                                {resto?.gratis_ongkir ? 'Gratis ongkir' : `${resto?.jarak_km} km`}
                                            </Badge>
                                        )}
                                    </div>

                                    <ul className="divide-y divide-slate-100">
                                        {item.map((b) => (
                                            <li key={b.id} className="flex gap-3 p-4">
                                                <img
                                                    src={b.gambar}
                                                    alt={b.nama}
                                                    onError={(e) => {
                                                        e.currentTarget.style.visibility = 'hidden';
                                                    }}
                                                    className="size-20 shrink-0 rounded-2xl object-cover"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-[13px] font-extrabold text-navy-900">
                                                                {b.nama}
                                                            </p>
                                                            <p className="mt-0.5 text-[11px] text-navy-400">
                                                                {rupiah(b.harga)} per porsi
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => hapusKeranjang(b.id)}
                                                            aria-label={`Hapus ${b.nama}`}
                                                            className="grid size-8 shrink-0 place-items-center rounded-xl text-navy-300 transition-colors hover:bg-danger-50 hover:text-danger-500"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>

                                                    {b.catatan ? (
                                                        <p className="mt-1.5 rounded-lg bg-butter-50 px-2 py-1 text-[10px] font-semibold text-butter-700">
                                                            Catatan: {b.catatan}
                                                        </p>
                                                    ) : null}

                                                    <div className="mt-2.5 flex items-center justify-between">
                                                        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => ubahQtyKeranjang(b.id, b.qty - 1)}
                                                                aria-label="Kurangi"
                                                                className="grid size-7 place-items-center rounded-lg text-navy-500 transition-colors hover:bg-slate-100"
                                                            >
                                                                <Minus className="size-3.5" />
                                                            </button>
                                                            <span className="w-8 text-center text-[13px] font-extrabold text-navy-900">
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

                                                        <p className="text-[14px] font-extrabold text-navy-900">
                                                            {rupiah(b.harga * b.qty)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                                        <p className="text-[12px] font-semibold text-navy-400">
                                            Subtotal {resto?.nama}
                                        </p>
                                        <p className="text-[14px] font-extrabold text-navy-900">
                                            {rupiah(subtotal)}
                                        </p>
                                    </div>
                                </Card>
                            );
                        })}

<Card className="p-4">
                            <p className="text-[13px] font-extrabold text-navy-900">Rekomendasi dari restoran ini</p>
                                                            <div className="mt-2 grid gap-1 sm:grid-cols-2">
{keranjangRingkas.restoranIds.length > 0 ? (
                                                                          menuRecommended.map((m, i) => (
                                                                                  <MenuLink key={m.id !== undefined ? m.id : 'reco-' + i} menu={m} />
                                                                          ))
                                                                 ) : (
                                                                    <p className="text-[12px] text-navy-400">Tidak ada rekomendasi</p>
                                                                )}
                                                            </div>
                        </Card>
                    </div>

                    {/* Ringkasan */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <Card elevate className="p-5">
                            <h2 className="text-[15px] font-extrabold text-navy-900">Ringkasan pesanan</h2>

                            <dl className="mt-4 space-y-2.5 text-[13px]">
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Subtotal</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(keranjangRingkas.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="inline-flex items-center gap-1.5 text-navy-400">
                                        <Truck className="size-3.5" />
                                        Ongkir estimasi
                                    </dt>
                                    <dd className="font-bold text-navy-900">
                                        {rupiah(
                                            hitungOngkir(semuaRestoran.find((r) => String(r.id) === String(keranjangRingkas.restoranIds[0]))?.jarak_km ?? 0, keranjangRingkas.subtotal).dasar,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Biaya layanan</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(BIAYA_LAYANAN)}</dd>
                                </div>

                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3">
                                    <dt className="font-extrabold text-navy-800">Total sementara</dt>
                                    <dd className="text-lg font-extrabold text-navy-900">
                                        {rupiah(keranjangRingkas.subtotal + BIAYA_LAYANAN)}
                                    </dd>
                                </div>
                            </dl>

                            <p className="mt-3 rounded-xl bg-powder-50 px-3 py-2.5 text-[11px] leading-relaxed text-navy-500">
                                Ongkir final dihitung saat checkout berdasarkan jarak ke alamat kamu. Slot pengiriman
                                dipilih setelah masuk ke halaman checkout.
                            </p>

                            <Button as={Link} href="/keranjang/checkout" lebarPenuh ukuran="lg" className="mt-4" disabled={!keranjangRingkas.minOrderTersatisfied}>
                                    Lanjut ke checkout
                                    <ArrowRight className="size-4" />
                                </Button>

                            <Button as={Link} href="/cari" lebarPenuh varian="garis" className="mt-2">
                                    Tambah menu lain
                                </Button>
                        </Card>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
