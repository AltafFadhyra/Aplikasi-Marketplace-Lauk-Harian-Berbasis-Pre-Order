import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    ChefHat,
    ClipboardList,
    Coins,
    Star,
    TrendingUp,
    UtensilsCrossed,
} from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { GrafikBatang, ProgressBar, StatCard } from '../../Components/ui/StatCard';
import { SectionHeading } from '../../Components/ui/Misc';
import { StepperStatus } from '../../Components/ui/Stepper';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function Dashboard() {
    const { seed, akun } = useDemo();

    const toko = akun?.penjual ?? {};
    const restoran = (seed.restoran ?? []).find((r) => String(r.id) === String(toko.restoran_id));
    const pesanan = (seed.pesanan ?? []).filter((p) => String(p.restoran_id) === String(toko.restoran_id));

    const perluTindakan = pesanan.filter((p) =>
        ['menunggu_pembayaran', 'dibayar', 'dikonfirmasi'].includes(p.status),
    );
    const diproses = pesanan.filter((p) =>
        ['sedang_dimasak', 'siap_diambil', 'dibuat_untuk_kurir', 'dalam_pengiriman'].includes(p.status),
    );

    const omzet = pesanan
        .filter((p) => p.status !== 'dibatalkan')
        .reduce((t, p) => t + (p.subtotal ?? 0), 0);

    const grafik = [
        { label: 'Sen', nilai: 4 },
        { label: 'Sel', nilai: 6 },
        { label: 'Rab', nilai: 3 },
        { label: 'Kam', nilai: 8 },
        { label: 'Jum', nilai: 11 },
        { label: 'Sab', nilai: 9 },
        { label: 'Min', nilai: 5 },
    ];


    return (
        <DashboardLayout judul="Dashboard Penjual" peran={ROLES.PENJUAL}>
            <Head title="Dashboard Penjual" />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
                        Halo, {toko.nama?.split(' ')[0] ?? 'Penjual'}!
                    </h1>
                    <p className="mt-0.5 text-[13px] text-navy-500">
                        Ringkasan aktivitas {restoran?.nama ?? 'tokomu'} hari ini.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button as={Link} href="/seller/jadwal" varian="garis" ukuran="sm" ikon={CalendarClock}>
                            Atur jadwal
                        </Button>
                    <Button as={Link} href="/seller/menu" ukuran="sm" ikon={UtensilsCrossed}>
                            Kelola menu
                        </Button>
                </div>
            </div>

            {!restoran ? (
                <Card elevate className="p-8 text-center">
                    <ChefHat className="mx-auto size-10 text-navy-300" />
                    <p className="mt-3 text-[14px] font-extrabold text-navy-900">Belum ada restoran aktif</p>
                    <p className="mx-auto mt-1 max-w-md text-[12px] text-navy-500">
                        Pengajuan usaha kamu masih diverifikasi admin. Lengkapi data toko agar bisa mulai
                        menerima pesanan.
                    </p>
                    <Button as={Link} href="/seller/toko" className="mt-4">Lengkapi data toko</Button>
                </Card>
            ) : (
                <>
                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Pesanan masuk"
                            nilai={pesanan.length}
                            keterangan="Semua waktu"
                            ikon={ClipboardList}
                            tone="powder"
                        />
                        <StatCard
                            label="Perlu tindakan"
                            nilai={perluTindakan.length}
                            keterangan="Konfirmasi dan masak"
                            ikon={TrendingUp}
                            tone="butter"
                        />
                        <StatCard
                            label="Omzet kotor"
                            nilai={rupiah(omzet)}
                            keterangan="Sebelum biaya layanan"
                            ikon={Coins}
                            tone="sukses"
                        />
                        <StatCard
                            label="Rating restoran"
                            nilai={Number(restoran.rating ?? 0).toFixed(1)}
                            keterangan={`${restoran.jumlah_rating} ulasan`}
                            ikon={Star}
                            tone="butter"
                        />
                    </ul>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <Card elevate className="p-5 lg:col-span-2">
                            <SectionHeading
                                judul="Pesanan 7 hari terakhir"
                                deskripsi="Jumlah pesanan yang diterima per hari."
                                aksi={
                                    <Link
                                        href="/seller/pesanan"
                                        className="inline-flex items-center gap-1 text-[12px] font-bold text-powder-600"
                                    >
                                        Semua pesanan
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                }
                            />

                            <div className="mt-4">
                                <GrafikBatang data={grafik} tinggi="h-40" />
                            </div>
                        </Card>

                        <Card elevate className="p-5">
                            <SectionHeading judul="Kapasitas produksi" deskripsi="Masa depan, 3 hari." />

                            <ul className="mt-4 space-y-3.5">
                                {(seed.slot ?? [])
                                    .filter((s) => String(s.restoran_id) === String(toko.restoran_id))
                                    .slice(0, 6)
                                    .map((s) => {
                                        const persen = s.kapasitas
                                            ? Math.round((s.terisi / s.kapasitas) * 100)
                                            : 0;

                                        return (
                                            <li key={s.id}>
                                                <div className="flex items-center justify-between text-[11px] font-bold">
                                                    <span className="text-navy-600">
                                                        {s.tanggal_label} {s.jam_mulai}
                                                    </span>
                                                    <span
                                                        className={
                                                            persen >= 90 ? 'text-danger-600' : 'text-navy-400'
                                                        }
                                                    >
                                                        {s.terisi}/{s.kapasitas}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5">
                                                    <ProgressBar
                                                        nilai={persen}
                                                        tone={persen >= 90 ? 'bahaya' : 'powder'}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </Card>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <Card elevate className="p-5">
                            <SectionHeading
                                judul="Perlu tindakan kamu"
                                deskripsi="Pesanan yang menunggu respons dapur."
                                aksi={
                                    <Link
                                        href="/seller/pesanan"
                                        className="text-[12px] font-bold text-powder-600"
                                    >
                                        Kelola
                                    </Link>
                                }
                            />

                            <div className="mt-4">
                                {!perluTindakan.length ? (
                                    <Kosong
                                        judul="Semua beres"
                                        deskripsi="Tidak ada pesanan yang menunggu tindakan."
                                        ikon={ClipboardList}
                                    />
                                ) : (
                                    <ul className="space-y-2.5">
                                        {perluTindakan.slice(0, 5).map((p) => (
                                            <li key={p.id}>
                                                <Link
                                                    href={`/seller/pesanan/${p.kode}`}
                                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3.5 py-2.5 transition hover:border-powder-300 hover:bg-powder-50/40"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[12px] font-extrabold text-navy-900">
                                                            {p.kode}
                                                        </p>
                                                        <p className="truncate text-[10px] text-navy-400">
                                                            {waktuRelatif(p.dibuat_pada)} Â· {p.pembeli_nama}
                                                        </p>
                                                    </div>
                                                    <Badge tone={toneBadgeStatus(p.status)} ukuran="xs">
                                                        {p.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card>

                        <Card elevate className="p-5">
                            <SectionHeading judul="Sedang diproses" deskripsi="Status dapur saat ini." />

                            <div className="mt-4 space-y-3">
                                {!diproses.length ? (
                                    <Kosong
                                        judul="Belum ada"
                                        deskripsi="Tidak ada pesanan yang sedang dimasak."
                                        ikon={ChefHat}
                                    />
                                ) : (
                                    diproses.slice(0, 4).map((p) => (
                                        <div key={p.id} className="rounded-2xl bg-slate-50 p-3.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <Link
                                                    href={`/seller/pesanan/${p.kode}`}
                                                    className="text-[12px] font-extrabold text-navy-900 hover:text-powder-600"
                                                >
                                                    {p.kode}
                                                </Link>
                                                <Badge tone={toneBadgeStatus(p.status)} ukuran="xs">
                                                    {p.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                            <div className="mt-2.5">
                                                <StepperStatus status={p.status} timeline={p.timeline} ringkas />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
