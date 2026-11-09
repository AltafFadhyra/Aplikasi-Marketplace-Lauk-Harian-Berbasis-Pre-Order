import { Head, Link } from '@inertiajs/react';
import { ChevronRight, ClipboardList, Package, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { FilterChip } from '../../Components/ui/Misc';
import { StepperStatus } from '../../Components/ui/Stepper';
import AppLayout from '../../Layouts/AppLayout';
import { STATUS_PESANAN, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const TAB = [
    { key: 'aktif', label: 'Sedang Berjalan' },
    { key: 'riwayat', label: 'Riwayat' },
    { key: 'dibatalkan', label: 'Dibatalkan' },
    { key: 'semua', label: 'Semua' },
];

function orderCards(daftar) {
    return (
        <ul className="space-y-4">
            {daftar.map((p) => (
                <li key={p.id}>
                    <Card hover>
                        <Link href={`/pesanan/${p.kode}`} className="block p-4 sm:p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-mono text-[13px] font-extrabold text-navy-900">{p.kode}</p>
                                        <Badge tone={toneBadgeStatus(p.status)} ukuran="sm">
                                            {STATUS_PESANAN[p.status]?.label ?? p.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 truncate text-[13px] font-bold text-navy-700">
                                        {p.restoran_nama}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-navy-400">
                                        {waktuRelatif(p.dibuat_pada)} · {p.items?.length ?? 0} menu
                                        {p.slot_label ? ` · ${p.slot_label}` : ''}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[15px] font-extrabold text-navy-900">
                                        {rupiah(p.total)}
                                    </p>
                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-powder-600">
                                        Detail
                                        <ChevronRight className="size-3.5" />
                                    </span>
                                </div>
                            </div>

                            {!['selesai', 'dibatalkan', 'kedaluwarsa'].includes(p.status) ? (
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <StepperStatus status={p.status} timeline={p.timeline} ringkas />
                                </div>
                            ) : null}
                        </Link>
                    </Card>
                </li>
            ))}
        </ul>
    );
}

export default function Orders() {
    const { pesanan } = useDemo();
    const [tab, setTab] = useState('aktif');
    const [cari, setCari] = useState('');

    const daftar = useMemo(() => {
        const needle = cari.trim().toLowerCase();
        const selesai = ['selesai'];
        const batal = ['dibatalkan', 'kedaluwarsa'];

        let hasil = pesanan;

        if (tab === 'aktif') hasil = hasil.filter((p) => !selesai.includes(p.status) && !batal.includes(p.status));
        if (tab === 'riwayat') hasil = hasil.filter((p) => selesai.includes(p.status));
        if (tab === 'dibatalkan') hasil = hasil.filter((p) => batal.includes(p.status));

        if (needle) {
            hasil = hasil.filter(
                (p) =>
                    p.kode.toLowerCase().includes(needle) ||
                    (p.restoran_nama ?? '').toLowerCase().includes(needle),
            );
        }

        return hasil;
    }, [pesanan, tab, cari]);

    const total = pesanan.length;

    return (
        <AppLayout>
            <Head title="Pesanan Saya" />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-5">
                    <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">Pesanan Saya</h1>
                    <p className="mt-1 text-[13px] text-navy-400">
                        {total} pesanan tercatat · pantau status pengiriman secara langsung
                    </p>
                </div>

                <div className="mb-4 space-y-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-300" />
                        <input
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Cari kode pesanan atau nama restoran..."
                            aria-label="Cari pesanan"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-4 pl-11 text-sm text-navy-900 placeholder:text-navy-300 outline-none transition-all focus:border-powder-400 focus:ring-4 focus:ring-powder-500/12"
                        />
                    </div>

                    <ul className="flex gap-2 overflow-x-auto pb-1">
                        {TAB.map((t) => (
                            <li key={t.key} className="shrink-0">
                                <FilterChip aktif={tab === t.key} onClick={() => setTab(t.key)}>
                                    {t.label}
                                </FilterChip>
                            </li>
                        ))}
                    </ul>
                </div>

                {!pesanan.length ? (
                    <Kosong
                        ikon={ClipboardList}
                        judul="Belum ada pesanan"
                        deskripsi="Semua pesanan pre-order yang kamu buat akan muncul di sini dengan status real-time."
                        aksi={
                            <Button as={Link} href="/cari">Mulai pesan</Button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                ) : !daftar.length ? (
                    <Kosong
                        ikon={Package}
                        judul="Tidak ada pesanan di tab ini"
                        deskripsi="Coba pilih tab lain atau hapus kata kunci pencarian."
                        aksi={
                            <button
                                type="button"
                                onClick={() => {
                                    setTab('semua');
                                    setCari('');
                                }}
                                className="rounded-2xl bg-powder-500 px-4 py-2.5 text-[13px] font-bold text-white"
                            >
                                Tampilkan semua
                            </button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                ) : (
                    orderCards(daftar)
                )}
            </div>
        </AppLayout>
    );
}
