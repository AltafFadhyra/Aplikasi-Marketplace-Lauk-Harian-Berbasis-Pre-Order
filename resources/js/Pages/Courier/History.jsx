import { Head, Link } from '@inertiajs/react';
import { Check, Coins, History as HistoryIcon, MapPin, Package, Star, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Rating } from '../../Components/ui/Avatar';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { rupiah, waktuLengkap } from '../../lib/format';
import { alamatTeks, jarakTeks, ongkirNilai } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

const FILTER = [
    { k: 'semua', l: 'Semua' },
    { k: 'minggu', l: '7 hari' },
    { k: 'bulan', l: '30 hari' },
    { k: 'rincian', l: 'Rincian ongkir' },
];

export default function History() {
    const { pengiriman, seed } = useDemo();

    const [filter, setFilter] = useState('semua');

    const riwayat = useMemo(() => {
        const selesai = (pengiriman ?? []).filter((p) => p.status === 'selesai');

        if (filter === 'minggu' || filter === 'bulan') {
            const batas = Date.now() - (filter === 'minggu' ? 7 : 30) * 86400000;

            return selesai.filter(
                (p) => new Date(p.selesai_pada ?? p.diambil_pada ?? 0).getTime() >= batas,
            );
        }

        return selesai;
    }, [pengiriman, filter]);

    const total = riwayat.reduce((t, p) => t + ongkirNilai(p), 0);
    const rataRata = riwayat.length ? total / riwayat.length : 0;

    return (
        <DashboardLayout judul="Riwayat" peran={ROLES.KURIR}>
            <Head title="Riwayat Pengiriman" />

            <div className="mb-5">
                <PageHeader
                    judul="Riwayat pengiriman"
                    deskripsi="Rekap seluruh pengiriman yang sudah kamu selesaikan."
                    ikon={HistoryIcon}
                />
            </div>

            <ul className="mb-4 grid gap-3 sm:grid-cols-3">
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-success-50 text-success-600">
                            <Check className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Total selesai</p>
                            <p className="text-lg font-extrabold text-navy-900">{riwayat.length}</p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                            <Coins className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Total ongkir</p>
                            <p className="text-lg font-extrabold text-navy-900">{rupiah(total)}</p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-butter-50 text-butter-600">
                            <TrendingUp className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Rata-rata per kiriman</p>
                            <p className="text-lg font-extrabold text-navy-900">
                                {rupiah(Math.round(rataRata))}
                            </p>
                        </div>
                    </Card>
                </li>
            </ul>

            <Card elevate className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <ul className="flex flex-wrap gap-1.5">
                    {FILTER.map((f) => (
                        <li key={f.k}>
                            <FilterChip aktif={filter === f.k} onClick={() => setFilter(f.k)} jumlah={f.k === 'rincian' ? riwayat.length : null}>
                                {f.l}
                            </FilterChip>
                        </li>
                    ))}
                </ul>

                <p className="text-[11px] text-navy-400">Rincian ongkir updated otomatis</p>
            </Card>

            {!riwayat.length ? (
                <Kosong
                    ikon={Star}
                    judul="Belum ada riwayat"
                    deskripsi="Selesaikan pengiriman pertamamu dan riwayatnya akan muncul di sini."
                    aksi={
                        <Button as={Link} href="/courier/tersedia">Cari pesanan</Button>
                    }
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <Card elevate className="overflow-hidden">
                    <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[10px] font-bold tracking-wide text-navy-400 uppercase md:grid">
                        <span className="col-span-3">Kode</span>
                        <span className="col-span-4">Tujuan</span>
                        <span className="col-span-2">Waktu</span>
                        <span className="col-span-2 text-right">Jarak</span>
                        <span className="col-span-1 text-right">Ongkir</span>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {riwayat.map((p) => {
                            const pesanan = (seed.pesanan ?? []).find(
                                (x) => String(x.id) === String(p.pesanan_id),
                            );

                            return (
                                <li key={p.id}>
                                    <Link
                                        href={`/courier/pengiriman/${p.kode}`}
                                        className="grid gap-2 px-4 py-3 transition hover:bg-powder-50/40 md:grid-cols-12 md:items-center md:gap-3"
                                    >
                                        <span className="text-[12px] font-extrabold text-navy-900">
                                            {p.kode}
                                        </span>
                                        <span className="inline-flex items-start gap-1 text-[11px] text-navy-500">
                                            <MapPin className="mt-0.5 size-3 shrink-0 text-navy-300" />
                                            <span className="line-clamp-1">
                                                {alamatTeks(pesanan ?? p)}
                                            </span>
                                        </span>
                                        <span className="text-[11px] text-navy-400">
                                            {waktuLengkap(p.selesai_pada ?? p.diambil_pada)}
                                        </span>
                                        <span className="text-[11px] text-navy-500 md:text-right">
                                            {jarakTeks(p) ?? '-'}
                                        </span>
                                        <span className="flex items-center justify-between gap-2 md:justify-end">
                                            <span className="text-[10px] text-navy-300 md:hidden">
                                                ongkir
                                            </span>
                                            <span className="text-[12px] font-extrabold text-navy-900">
                                                {rupiah(ongkirNilai(p))}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            )}

            <Card className="mt-4 p-4">
                <p className="inline-flex items-center gap-2 text-[11px] text-navy-400">
                    <Package className="size-3.5" />
                            Riwayat tersimpan di perangkat ini.
                </p>
                <div className="mt-2">
                    <Badge tone="netral">Data demo</Badge>
                </div>
            </Card>
        </DashboardLayout>
    );
}
