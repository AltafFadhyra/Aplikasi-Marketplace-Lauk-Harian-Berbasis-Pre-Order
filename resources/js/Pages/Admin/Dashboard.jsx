import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Bike,
    ClipboardCheck,
    Clock,
    Coins,
    Database,
    FileWarning,
    LayoutDashboard,
    MapPin,
    Package,
    Star,
    Store,
    TrendingUp,
    Users,
} from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { StatCard } from '../../Components/ui/StatCard';
import { GrafikBatang, ProgressBar } from '../../Components/ui/StatCard';
import { SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, STATUS_PESANAN, toneBadgeStatus } from '../../lib/constants';
import { angka, rupiah, waktuRelatif } from '../../lib/format';
import { namaRestoran } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

export default function Dashboard() {
    const { seed, pengajuan: pengajuanAktif } = useDemo();

    const s = seed.statistik ?? {};
    const pesanan = seed.pesanan ?? [];
    const restoran = seed.restoran ?? [];
    const pengajuan = pengajuanAktif ?? [];

    const menunggu = pengajuan.filter((p) => p.status === 'pending');
    const diproses = pesanan.filter((p) => p.status === 'diproses');

    const grafik = [
        { label: 'Pesanan', nilai: s.total_pesanan ?? pesanan.length },
        { label: 'Pengguna', nilai: s.total_pengguna ?? 0 },
        { label: 'Restoran', nilai: s.total_restoran ?? restoran.length },
        { label: 'Kurir', nilai: s.total_kurir ?? 0 },
        { label: 'Menu', nilai: s.total_menu ?? 0 },
    ];

    return (
        <DashboardLayout judul="Dashboard Admin" peran={ROLES.ADMIN}>
            <Head title="Dashboard Admin" />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-extrabold text-navy-900 sm:text-2xl">
                        <LayoutDashboard className="size-6 text-powder-500" />
                        Ringkasan Platform
                    </h1>
                    <p className="mt-0.5 text-[13px] text-navy-500">
                        Pantau aktivitas marketplace Preorderly secara menyeluruh.
                    </p>
                </div>

                <Button as={Link} href="/admin/verifikasi" ikon={ClipboardCheck} disabled={!menunggu.length}>
                        Verifikasi ({menunggu.length})
                    </Button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total pengguna"
                    nilai={angka(s.total_pengguna ?? 0)}
                    keterangan={`${s.total_pembeli ?? 0} pembeli`}
                    ikon={Users}
                    tone="powder"
                />
                <StatCard
                    label="Total pesanan"
                    nilai={angka(s.total_pesanan ?? pesanan.length)}
                    keterangan={`${s.pesanan_aktif ?? diproses.length} sedang aktif`}
                    ikon={Package}
                    tone="butter"
                />
                <StatCard
                    label="GMV platform"
                    nilai={rupiah(s.pendapatan ?? 0)}
                    keterangan="Akumulasi total transaksi"
                    ikon={Coins}
                    tone="sukses"
                />
                <StatCard
                    label="Rata-rata rating"
                    nilai={Number(s.rata2_rating ?? 0).toFixed(2)}
                    keterangan="Dari seluruh ulasan"
                    ikon={Star}
                    tone="navy"
                />
            </ul>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <Card elevate className="p-5 lg:col-span-2">
                    <SectionHeading
                        judul="Sebaran data platform"
                        deskripsi="Ringkasan jumlah entitas aktif di sistem."
                    />

                    <GrafikBatang data={grafik} tinggi="h-40" />

                    <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                        <li>
                            <Card className="p-3.5">
                                <p className="inline-flex items-center gap-1.5 text-[11px] text-navy-400">
                                    <Store className="size-3.5" /> Restoran
                                </p>
                                <p className="mt-1 text-lg font-extrabold text-navy-900">
                                    {s.total_restoran ?? restoran.length}
                                </p>
                            </Card>
                        </li>
                        <li>
                            <Card className="p-3.5">
                                <p className="inline-flex items-center gap-1.5 text-[11px] text-navy-400">
                                    <Bike className="size-3.5" /> Kurir
                                </p>
                                <p className="mt-1 text-lg font-extrabold text-navy-900">
                                    {s.total_kurir ?? 0}
                                </p>
                            </Card>
                        </li>
                        <li>
                            <Card className="p-3.5">
                                <p className="inline-flex items-center gap-1.5 text-[11px] text-navy-400">
                                    <Package className="size-3.5" /> Menu
                                </p>
                                <p className="mt-1 text-lg font-extrabold text-navy-900">
                                    {s.total_menu ?? 0}
                                </p>
                            </Card>
                        </li>
                    </ul>
                </Card>

                <div className="space-y-4">
                    <Card elevate className="p-5">
                        <SectionHeading judul="Antrean verifikasi" />

                        <div className="mt-3 space-y-2.5">
                            {[
                                { l: 'Menunggu', n: menunggu.length, tone: 'peringatan' },
                                {
                                    l: 'Diproses',
                                    n: pengajuan.filter((p) => p.status === 'approved').length,
                                    tone: 'sukses',
                                },
                                {
                                    l: 'Ditolak',
                                    n: pengajuan.filter((p) => p.status === 'rejected').length,
                                    tone: 'bahaya',
                                },
                            ].map((b) => (
                                <div
                                    key={b.l}
                                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5"
                                >
                                    <span className="text-[12px] font-semibold text-navy-600">
                                        {b.l}
                                    </span>
                                    <Badge tone={b.tone}>{b.n}</Badge>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/admin/verifikasi"
                            className="mt-3 inline-block text-[12px] font-bold text-powder-600 hover:underline"
                        >
                            Buka daftar pengajuan
                        </Link>
                    </Card>

                    <Card className="p-5">
                        <SectionHeading judul="Kesehatan sistem" />
                        <ul className="mt-3 space-y-3">
                            <li>
                                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                                    <span className="inline-flex items-center gap-1.5 text-navy-500">
                                        <Database className="size-3.5" /> Kapasitas data
                                    </span>
                                    <span className="font-bold text-navy-700">38%</span>
                                </div>
                                <ProgressBar nilai={38} tone="powder" />
                            </li>
                            <li>
                                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                                    <span className="inline-flex items-center gap-1.5 text-navy-500">
                                        <TrendingUp className="size-3.5" /> Okupansi kurir
                                    </span>
                                    <span className="font-bold text-navy-700">72%</span>
                                </div>
                                <ProgressBar nilai={72} tone="sukses" />
                            </li>
                            <li>
                                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                                    <span className="inline-flex items-center gap-1.5 text-navy-500">
                                        <FileWarning className="size-3.5" /> Dokumen menua
                                    </span>
                                    <span className="font-bold text-navy-700">6%</span>
                                </div>
                                <ProgressBar nilai={6} tone="butter" />
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Card elevate className="p-5">
                    <SectionHeading
                        judul="Pesanan terbaru"
                        aksi={
                            <Link
                                href="/admin/pesanan"
                                className="text-[12px] font-bold text-powder-600 hover:underline"
                            >
                                Semua
                            </Link>
                        }
                    />

                    {!pesanan.length ? (
                        <Kosong ikon={Package} judul="Belum ada pesanan" />
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100">
                            {pesanan.slice(0, 5).map((p) => (
                                <li
                                    key={p.id}
                                    className="flex items-center justify-between gap-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-[12px] font-extrabold text-navy-900">
                                            {p.kode}
                                        </p>
                                        <p className="truncate text-[10px] text-navy-400">
                                            {namaRestoran(p)} · {waktuRelatif(p.dibuat_pada)}
                                        </p>
                                    </div>
                                    <Badge tone={toneBadgeStatus(p.status)}>
                                        {STATUS_PESANAN[p.status]?.label ?? p.status}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card elevate className="p-5">
                    <SectionHeading
                        judul="Restoran teratas"
                        aksi={
                            <Link
                                href="/admin/restoran"
                                className="text-[12px] font-bold text-powder-600 hover:underline"
                            >
                                Semua
                            </Link>
                        }
                    />

                    <ul className="mt-3 divide-y divide-slate-100">
                        {restoran.slice(0, 5).map((r) => (
                            <li key={r.id} className="flex items-center gap-3 py-2.5">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-powder-50 text-powder-600">
                                    <MapPin className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-bold text-navy-900">
                                        {r.nama}
                                    </p>
                                    <p className="truncate text-[10px] text-navy-400">
                                        {r.kategori ?? '-'} · {r.wilayah ?? '-'}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-700">
                                    <Star className="size-3 fill-butter-500 text-butter-500" />
                                    {Number(r.rating ?? 0).toFixed(1)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card className="mt-4 flex items-start gap-3 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning-50 text-warning-600">
                    <Clock className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[12px] font-extrabold text-navy-900">
                        Catatan operasional
                    </p>
                    <p className="mt-0.5 text-[11px] text-navy-400">
                        {menunggu.length
                            ? `Ada ${menunggu.length} pengajuan yang menunggu verifikasi. Target SLA 1x24 jam.`
                            : 'Tidak ada pengajuan menunggu verifikasi. Semua sudah ditindaklanjuti.'}
                    </p>
                </div>
                {menunggu.length ? (
                    <AlertTriangle className="ml-auto size-4 shrink-0 text-warning-500" />
                ) : null}
            </Card>
        </DashboardLayout>
    );
}
