import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { FilterChip, PageHeader } from '../../Components/ui/Misc';
import { StepperStatus } from '../../Components/ui/Stepper';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, STATUS_PESANAN, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { namaPembeli, ongkirGratis, ongkirNilai, sudahLunas } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

const TAB = [
    { k: 'semua', l: 'Semua' },
    { k: 'baru', l: 'Perlu diproses' },
    { k: 'dimasak', l: 'Sedang dimasak' },
    { k: 'kirim', l: 'Siap diantar' },
    { k: 'selesai', l: 'Selesai' },
];

export default function Orders() {
    const { seed, akun } = useDemo();

    const [tab, setTab] = useState('semua');

    const toko = akun?.penjual ?? {};
    const semua = useMemo(
        () => (seed.pesanan ?? []).filter((p) => String(p.restoran_id) === String(toko.restoran_id)),
        [seed.pesanan, toko.restoran_id],
    );

    const Groups = {
        baru: ['menunggu_pembayaran', 'dibayar', 'dikonfirmasi'],
        dimasak: ['sedang_dimasak', 'siap_diambil'],
        kirim: ['dibuat_untuk_kurir', 'dalam_pengiriman', 'diambil_kurir'],
        selesai: ['selesai', 'dibatalkan'],
    };

    const daftar = useMemo(() => {
        if (tab === 'semua') return semua;

        const status = Groups[tab] ?? [];

        return semua.filter((p) => status.includes(p.status));
    }, [semua, tab]);

    const jumlah = (k) => (k === 'semua' ? semua.length : semua.filter((p) => (Groups[k] ?? []).includes(p.status)).length);

    return (
        <DashboardLayout judul="Pesanan Masuk" peran={ROLES.PENJUAL}>
            <Head title="Pesanan Masuk" />

            <div className="mb-5">
                <PageHeader
                    judul="Pesanan masuk"
                    deskripsi="Kelola pesanan dari pembayaran sampai diserahkan ke kurir."
                    ikon={ClipboardList}
                />
            </div>

            <ul className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {TAB.map((t) => (
                    <li key={t.k} className="shrink-0">
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

            {!daftar.length ? (
                <Kosong
                    ikon={Package}
                    judul="Belum ada pesanan"
                    deskripsi="Pesanan yang masuk akan muncul di sini beserta status pengerjaannya."
                    className="rounded-3xl border border-slate-200 bg-white py-8"
                />
            ) : (
                <ul className="space-y-3">
                    {daftar.map((p) => (
                        <li key={p.id}>
                            <Card hover elevate className="overflow-hidden">
                                <div className="border-b border-slate-100 p-4 sm:p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            href={`/seller/pesanan/${p.kode}`}
                                            className="text-[14px] font-extrabold text-navy-900 hover:text-powder-600"
                                        >
                                            {p.kode}
                                        </Link>
                                        <Badge tone={toneBadgeStatus(p.status)} ukuran="sm">
                                            {STATUS_PESANAN[p.status]?.label ?? p.status}
                                        </Badge>
                                        {sudahLunas(p) ? null : (
                                            <Badge tone="peringatan" ukuran="xs">
                                                Belum lunas
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-navy-400">
                                        {namaPembeli(p)} · {waktuRelatif(p.dibuat_pada)}
                                    </p>
                                </div>

                                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-6">
                                    <ul className="min-w-0 space-y-2">
                                        {(p.items ?? []).slice(0, 3).map((it) => (
                                            <li
                                                key={it.id ?? it.menu_id}
                                                className="flex items-start justify-between gap-3 text-[12px]"
                                            >
                                                <span className="min-w-0 flex-1 break-words text-navy-600">
                                                    <span className="font-bold text-navy-800">
                                                        {it.qty}x
                                                    </span>{' '}
                                                    {it.nama}
                                                    {it.catatan ? (
                                                        <span className="text-navy-300">
                                                            {' '}
                                                            ({it.catatan})
                                                        </span>
                                                    ) : null}
                                                </span>
                                                <span className="shrink-0 font-bold text-navy-700">
                                                    {rupiah(it.subtotal ?? it.harga * it.qty)}
                                                </span>
                                            </li>
                                        ))}
                                        {(p.items ?? []).length > 3 ? (
                                            <li className="text-[11px] font-bold text-navy-300">
                                                +{(p.items ?? []).length - 3} item lain
                                            </li>
                                        ) : null}
                                    </ul>

                                    <div className="rounded-2xl bg-slate-50/70 p-3.5 lg:border-l lg:border-slate-100 lg:bg-transparent lg:p-0 lg:pl-5">
                                        <p className="text-[10px] font-bold tracking-wide text-navy-400 uppercase">
                                            Total
                                        </p>
                                        <p className="text-lg font-extrabold text-navy-900">
                                            {rupiah(p.total)}
                                        </p>

                                        <dl className="mt-2 space-y-1 text-[11px]">
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-navy-400">Ongkir</dt>
                                                <dd className="text-right font-bold text-navy-700">
                                                    {ongkirGratis(p) ? 'Gratis' : rupiah(ongkirNilai(p))}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <dt className="text-navy-400">Bayar</dt>
                                                <dd className="text-right font-bold text-navy-700">
                                                    {p.metode_bayar}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                                    <StepperStatus
                                        status={p.status}
                                        timeline={p.timeline}
                                        ringkas
                                        scrollable
                                    />
                                </div>

                                <div className="flex items-center justify-end border-t border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
                                    <Button
                                        as={Link}
                                        href={`/seller/pesanan/${p.kode}`}
                                        varian="utama"
                                        ukuran="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        Kelola pesanan
                                    </Button>
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-5 text-center text-[11px] text-navy-300">
                Menampilkan {daftar.length} dari {semua.length} pesanan.
            </p>
        </DashboardLayout>
    );
}
