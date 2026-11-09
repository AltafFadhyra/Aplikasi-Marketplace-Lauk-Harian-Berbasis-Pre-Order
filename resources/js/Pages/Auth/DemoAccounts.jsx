import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, ChefHat, ShieldCheck, Truck, User } from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Avatar, Rating } from '../../Components/ui/Avatar';
import { SectionHeading } from '../../Components/ui/Misc';
import AppLayout from '../../Layouts/AppLayout';
import { DASHBOARD_ROLE, LABEL_ROLE, ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

const IKON = {
    [ROLES.PEMBELI]: User,
    [ROLES.PENJUAL]: ChefHat,
    [ROLES.KURIR]: Truck,
    [ROLES.ADMIN]: ShieldCheck,
};

export default function DemoAccounts() {
    const { seed, masuk, peran, tambahToast } = useDemo();

    const akun = Object.entries(seed.akun ?? {});

    function masukPeran(key, a) {
        const hasil = masuk(a.email, 'password');

        if (!hasil.ok) {
            tambahToast(hasil.pesan, 'bahaya', 'Gagal masuk');
            return;
        }

        tambahToast(`Masuk sebagai ${LABEL_ROLE[key]}.`, 'sukses');
        router.visit(DASHBOARD_ROLE[key] ?? '/');
    }

    return (
        <AppLayout>
            <Head title="Akun Demo" />

            <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7">
                <SectionHeading
                    judul="Akun demo Preorderly"
                    deskripsi="Setiap peran punya data, menu, dan status pesanan berbeda agar mudah didemokan."
                />

                <Card elevate className="mt-4 flex items-start gap-3.5 border-butter-200 bg-butter-50/50 p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-butter-700" />
                    <div>
                        <p className="text-[12px] font-extrabold text-butter-800">Password semua akun: password</p>
                        <p className="mt-0.5 text-[12px] text-navy-500">
                            Data tersimpan di MySQL dan hanya dibaca. Perubahan disimpan di browser, jadi aman untuk
                            diulang saat presentasi.
                        </p>
                    </div>
                </Card>

                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                    {akun.map(([key, a]) => {
                        const Ikon = IKON[key] ?? User;
                        const aktif = peran === key;

                        return (
                            <li key={key}>
                                <Card
                                    hover
                                    elevate={aktif}
                                    className={[
                                        'flex h-full flex-col p-5',
                                        aktif ? 'ring-2 ring-powder-400' : '',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-powder-50 text-powder-600">
                                            <Ikon className="size-5" />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-[14px] font-extrabold text-navy-900">
                                                    {LABEL_ROLE[key] ?? key}
                                                </h3>
                                                {aktif ? <Badge tone="powder">Aktif</Badge> : null}
                                            </div>
                                            <p className="truncate text-[11px] text-navy-400">{a.email}</p>
                                        </div>

                                        <Avatar nama={a.nama} gambar={a.avatar} ukuran="sm" />
                                    </div>

                                    <dl className="mt-4 space-y-1.5 text-[11px]">
                                        <div className="flex justify-between gap-2">
                                            <dt className="text-navy-400">Nama</dt>
                                            <dd className="truncate font-bold text-navy-700">{a.nama}</dd>
                                        </div>
                                        {a.toko ? (
                                            <div className="flex justify-between gap-2">
                                                <dt className="text-navy-400">Toko</dt>
                                                <dd className="truncate font-bold text-navy-700">{a.toko}</dd>
                                            </div>
                                        ) : null}
                                        {a.kendaraan ? (
                                            <div className="flex justify-between gap-2">
                                                <dt className="text-navy-400">Kendaraan</dt>
                                                <dd className="font-bold text-navy-700">{a.kendaraan}</dd>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between gap-2">
                                            <dt className="text-navy-400">Status</dt>
                                            <dd>
                                                <Badge
                                                    tone={
                                                        a.status_verifikasi === 'terverifikasi'
                                                            ? 'sukses'
                                                            : 'peringatan'
                                                    }
                                                    ukuran="xs"
                                                >
                                                    {a.status_verifikasi === 'terverifikasi'
                                                        ? 'Terverifikasi'
                                                        : 'Menunggu'}
                                                </Badge>
                                            </dd>
                                        </div>
                                    </dl>

                                    {a.rating ? (
                                        <div className="mt-3">
                                            <Rating nilai={Number(a.rating)} tampilAngka ukuran="sm" />
                                        </div>
                                    ) : null}

                                    <Button
                                        className="mt-4 w-full"
                                        varian={aktif ? 'garis' : 'solid'}
                                        ukuran="sm"
                                        onClick={() => masukPeran(key, a)}
                                    >
                                        Masuk sebagai {LABEL_ROLE[key]?.split(' ')[0] ?? key}
                                        <ArrowRight className="size-3.5" />
                                    </Button>
                                </Card>
                            </li>
                        );
                    })}
                </ul>

                <Card className="mt-5 p-5">
                    <h3 className="text-[14px] font-extrabold text-navy-900">Skenario demo yang disarankan</h3>
                    <ol className="mt-3 space-y-2 text-[12px] leading-relaxed text-navy-600">
                        {[
                            'Pembeli: pilih restoran, tambah menu ke keranjang, pilih slot produksi, lalu bayar dengan QRIS.',
                            'Penjual: terima pesanan baru, majukan status ke sedang dimasak, lalu tandai siap diantar.',
                            'Kurir: ambil pesanan yang tersedia, klaim, perbarui status sampai selesai.',
                            'Admin: verifikasi pengajuan penjual atau kurir, lalu pantau seluruh pesanan.',
                        ].map((s, i) => (
                            <li key={s} className="flex gap-2.5">
                                <span className="grid size-5 shrink-0 place-items-center rounded-lg bg-powder-100 text-[10px] font-extrabold text-powder-700">
                                    {i + 1}
                                </span>
                                {s}
                            </li>
                        ))}
                    </ol>
                </Card>

                <p className="mt-5 text-center text-[11px] text-navy-300">
                    Ingin mulai dari pembeli?{' '}
                    <Link href="/" className="font-bold text-powder-600 hover:underline">
                        Buka beranda
                    </Link>
                </p>
            </div>
        </AppLayout>
    );
}
