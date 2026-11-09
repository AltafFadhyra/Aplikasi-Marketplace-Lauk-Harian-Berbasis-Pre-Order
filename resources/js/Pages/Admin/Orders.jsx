import { Head } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    Clock,
    Eye,
    Filter,
    MapPin,
    Package,
    Search,
    Star,
    Store,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Input } from '../../Components/ui/Form';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, STATUS_PESANAN, metodePembayaran, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const TAB = [
    { k: 'semua', l: 'Semua' },
    { k: 'menunggu_pembayaran', l: 'Belum Bayar' },
    { k: 'diproses', l: 'Diproses' },
    { k: 'dalam_pengiriman', l: 'Dikirim' },
    { k: 'selesai', l: 'Selesai' },
    { k: 'dibatalkan', l: 'Dibatalkan' },
];

export default function Orders({ semuaPesanan = [] }) {
    const { busy, tambahToast } = useDemo();

    const [tab, setTab] = useState('semua');
    const [cari, setCari] = useState('');

    const daftar = useMemo(() => {
        const q = cari.trim().toLowerCase();

        return semuaPesanan
            .filter((p) => tab === 'semua' || p.status === tab)
            .filter(
                (p) =>
                    !q ||
                    p.kode?.toLowerCase().includes(q) ||
                    p.pembeli?.toLowerCase().includes(q) ||
                    p.restoran?.toLowerCase().includes(q),
            );
    }, [semuaPesanan, tab, cari]);

    const jumlah = (k) =>
        k === 'semua' ? semuaPesanan.length : semuaPesanan.filter((p) => p.status === k).length;

    const gmv = semuaPesanan
        .filter((p) => !['dibatalkan', 'kedaluwarsa', 'menunggu_pembayaran'].includes(p.status))
        .reduce((t, p) => t + (p.total ?? 0), 0);

    return (
        <DashboardLayout judul="Pesanan" peran={ROLES.ADMIN}>
            <Head title="Monitoring Pesanan" />

            <div className="mb-5">
                <PageHeader
                    judul="Monitoring pesanan"
                    deskripsi="Pantau seluruh transaksi lintas restoran di platform."
                    ikon={Package}
                />
            </div>

            <ul className="mb-4 grid gap-3 sm:grid-cols-3">
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                            <Package className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Total pesanan</p>
                            <p className="text-lg font-extrabold text-navy-900">
                                {semuaPesanan.length}
                            </p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-success-50 text-success-600">
                            <CheckCircle2 className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">Transaksi valid</p>
                            <p className="text-lg font-extrabold text-navy-900">
                                {jumlah('selesai')}
                            </p>
                        </div>
                    </Card>
                </li>
                <li>
                    <Card elevate className="flex items-center gap-3 p-4">
                        <span className="grid size-11 place-items-center rounded-2xl bg-butter-50 text-butter-600">
                            <Store className="size-5" />
                        </span>
                        <div>
                            <p className="text-[11px] text-navy-400">GMV tercatat</p>
                            <p className="text-lg font-extrabold text-navy-900">{rupiah(gmv)}</p>
                        </div>
                    </Card>
                </li>
            </ul>

            <Card elevate className="mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <ul className="flex flex-wrap gap-1.5">
                    {TAB.map((t) => (
                        <li key={t.k}>
                            <FilterChip
                                aktif={tab === t.k}
                                onClick={() => setTab(t.k)}
                                jumlah={jumlah(t.k)}
                            >
                                {t.l}
                            </FilterChip>
                        </li>
                    ))}
                </ul>

                <div className="lg:w-72">
                    <Input
                        placeholder="Cari kode, pembeli, restoran..."
                        ikon={Search}
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                        containerClassName="mb-0"
                    />
                </div>
            </Card>

            {!daftar.length ? (
                <Kosong
                    ikon={Filter}
                    judul="Tidak ada pesanan"
                    deskripsi="Tidak ada pesanan pada filter ini."
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            ) : (
                <Card elevate className="overflow-hidden">
                    <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[10px] font-bold tracking-wide text-navy-400 uppercase lg:grid">
                        <span className="col-span-2">Kode</span>
                        <span className="col-span-3">Restoran</span>
                        <span className="col-span-2">Pembeli</span>
                        <span className="col-span-2">Status</span>
                        <span className="col-span-2">Waktu</span>
                        <span className="col-span-1 text-right">Total</span>
                    </div>

                    <ul className="divide-y divide-slate-100">
                        {daftar.map((p) => (
                            <li
                                key={p.id}
                                className="grid gap-2 px-4 py-3 transition hover:bg-powder-50/40 lg:grid-cols-12 lg:items-center lg:gap-3"
                            >
                                <div className="lg:col-span-2">
                                    <p className="text-[12px] font-extrabold text-navy-900">
                                        {p.kode}
                                    </p>
                                    <p className="text-[10px] text-navy-400">
                                        {metodePembayaran(p.metode)?.label ?? p.metode ?? '-'}
                                    </p>
                                </div>

                                <div className="inline-flex items-center gap-1 text-[11px] text-navy-600 lg:col-span-3">
                                    <MapPin className="size-3 shrink-0 text-navy-300" />
                                    <span className="truncate">{p.restoran ?? '-'}</span>
                                </div>

                                <div className="truncate text-[11px] text-navy-500 lg:col-span-2">
                                    {p.pembeli ?? '-'}
                                </div>

                                <div className="lg:col-span-2">
                                    <Badge tone={toneBadgeStatus(p.status)}>
                                        {STATUS_PESANAN[p.status]?.label ?? p.status}
                                    </Badge>
                                </div>

                                <div className="inline-flex items-center gap-1 text-[10px] text-navy-400 lg:col-span-2">
                                    <Clock className="size-3 shrink-0" />
                                    {waktuRelatif(p.dibuat_pada)}
                                </div>

                                <div className="flex items-center justify-between gap-2 lg:col-span-1 lg:justify-end">
                                    <span className="text-[11px] font-extrabold text-navy-900">
                                        {rupiah(p.total ?? 0)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <p className="mt-5 text-center text-[11px] text-navy-300">
                Menampilkan {daftar.length} dari {semuaPesanan.length} pesanan.
            </p>
        </DashboardLayout>
    );
}
