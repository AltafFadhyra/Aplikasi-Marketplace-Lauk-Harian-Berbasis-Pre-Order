import { Head, Link } from '@inertiajs/react';
import { Bike, Coins, MapPin, Package, Star, Timer, TrendingUp } from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Rating } from '../../Components/ui/Avatar';
import { StatCard } from '../../Components/ui/StatCard';
import { SectionHeading } from '../../Components/ui/Misc';
import { StepperStatus } from '../../Components/ui/Stepper';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { alamatTeks, jarakTeks, ongkirNilai } from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

export default function Dashboard() {
    const { seed, akun, pesananTersediaUntukKurir, pengiriman, klaimPengiriman, busy, tambahToast } =
        useDemo();

    const kurir = akun?.kurir ?? {};

    const aktif = (pengiriman ?? []).filter((p) => p.status !== 'selesai');
    const selesai = (pengiriman ?? []).filter((p) => p.status === 'selesai');
    const tersedia = pesananTersediaUntukKurir;

    const totalPendapatan = selesai.reduce((t, p) => t + ongkirNilai(p), 0);

    async function klaim(p) {
        try {
            await klaimPengiriman(p.id);
            tambahToast(`Pesanan ${p.kode} berhasil diklaim.`, 'sukses');
        } catch (salah) {
            tambahToast(salah.message, 'bahaya');
        }
    }

    return (
        <DashboardLayout judul="Dashboard Kurir" peran={ROLES.KURIR}>
            <Head title="Dashboard Kurir" />

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">
                        Halo, {kurir.nama?.split(' ')[0] ?? 'Kurir'}!
                    </h1>
                    <p className="mt-0.5 text-[13px] text-navy-500">
                        {tersedia.length} pesanan siap diklaim di sekitarmu.
                    </p>
                </div>

                <Button as={Link} href="/courier/tersedia" ikon={Package}>Lihat pesanan tersedia</Button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Sedang diantar"
                    nilai={aktif.length}
                    keterangan="Pesanan dalam perjalanan"
                    ikon={Bike}
                    tone="powder"
                />
                <StatCard
                    label="Siap diklaim"
                    nilai={tersedia.length}
                    keterangan="Di sekitar lokasi kamu"
                    ikon={Timer}
                    tone="butter"
                />
                <StatCard
                    label="Selesai hari ini"
                    nilai={selesai.length}
                    keterangan="Pengiriman tuntas"
                    ikon={TrendingUp}
                    tone="sukses"
                />
                <StatCard
                    label="Pendapatan"
                    nilai={rupiah(totalPendapatan)}
                    keterangan="Akumulasi ongkir"
                    ikon={Coins}
                    tone="navy"
                />
            </ul>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Card elevate className="p-5">
                    <SectionHeading
                        judul="Pesanan sedang diantar"
                        deskripsi="Perbarui status agar pembeli tahu posisi kamu."
                        aksi={
                            <Link href="/courier/pengiriman" className="text-[12px] font-bold text-powder-600">
                                Kelola
                            </Link>
                        }
                    />

                    <div className="mt-4 space-y-3">
                        {!aktif.length ? (
                            <Kosong
                                ikon={Bike}
                                judul="Belum ada yang diantar"
                                deskripsi="Klaim pesanan yang tersedia untuk mulai mengantar."
                            />
                        ) : (
                            aktif.map((p) => {
                                const pesanan = (seed.pesanan ?? []).find((x) => String(x.id) === String(p.pesanan_id));

                                return (
                                    <div key={p.id} className="rounded-2xl border border-slate-200 p-3.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <Link
                                                href={`/courier/pengiriman/${p.kode}`}
                                                className="text-[13px] font-extrabold text-navy-900 hover:text-powder-600"
                                            >
                                                {p.kode}
                                            </Link>
                                            <Badge tone={toneBadgeStatus(pesanan?.status ?? 'dibuat_untuk_kurir')}>
                                                {pesanan?.status?.replace(/_/g, ' ') ?? 'diantar'}
                                            </Badge>
                                        </div>

                                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-navy-400">
                                            <MapPin className="size-3" />
                                            {alamatTeks(p)} · {jarakTeks(p) ?? 'jarak tidak diketahui'}
                                        </p>

                                        <div className="mt-2.5">
                                            <StepperStatus
                                                status={pesanan?.status ?? 'dibuat_untuk_kurir'}
                                                timeline={pesanan?.timeline}
                                                ringkas
                                            />
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[12px] font-extrabold text-navy-900">
                                                {rupiah(ongkirNilai(p))}
                                            </span>
                                            <Link
                                                href={`/courier/pengiriman/${p.kode}`}
                                                className="text-[12px] font-bold text-powder-600 hover:underline"
                                            >
                                                Perbarui status
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                <div className="space-y-4">
                    <Card elevate className="p-5">
                        <SectionHeading
                            judul="Siap diklaim"
                            deskripsi="Pesanan yang belum diambil kurir lain."
                        />

                        <div className="mt-4 space-y-2.5">
                            {!tersedia.length ? (
                                <Kosong
                                    ikon={Package}
                                    judul="Belum ada"
                                    deskripsi="Semua pesanan sudah diambil kurir lain."
                                />
                            ) : (
                                tersedia.slice(0, 4).map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[12px] font-extrabold text-navy-900">
                                                {p.kode}
                                            </p>
                                            <p className="truncate text-[10px] text-navy-400">
                                                {jarakTeks(p) ?? 'jarak tidak diketahui'} · {waktuRelatif(p.dibuat_pada)} ·{' '}
                                                {rupiah(ongkirNilai(p))}
                                            </p>
                                        </div>
                                        <Button
                                            ukuran="sm"
                                            disabled={busy}
                                            onClick={() => klaim(p)}
                                        >
                                            Klaim
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <SectionHeading judul="Profil kurir" />
                        <div className="mt-3 flex items-center gap-3">
                            <Rating nilai={Number(kurir.rating ?? 0)} tampilAngka ukuran="sm" />
                            <span className="text-[11px] text-navy-400">
                                {kurir.kendaraan ?? '-'} · {kurir.total_pengiriman ?? 0} pengiriman
                            </span>
                        </div>
                        <Link
                            href="/courier/profil"
                            className="mt-3 inline-block text-[12px] font-bold text-powder-600 hover:underline"
                        >
                            Kelola profil
                        </Link>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
