import { Head, Link } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ClipboardList,
    Clock,
    Coins,
    MapPin,
    Navigation,
    Phone,
    ShieldCheck,
    User,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Modal } from '../../Components/ui/Modal';
import { Textarea } from '../../Components/ui/Form';
import { InfoRow, PageHeader } from '../../Components/ui/Misc';
import { StepperStatus, Timeline } from '../../Components/ui/Stepper';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, STATUS_PESANAN, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuLengkap } from '../../lib/format';
import {
    alamatTeks,
    jarakTeks,
    namaPembeli,
    ongkirGratis,
    ongkirNilai,
    subTotalPesanan,
    sudahLunas,
    teleponPembeli,
    totalPesanan,
} from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

const TAHAP = [
    { s: 'diambil_kurir', l: 'Ambil di restoran', ikon: ClipboardList },
    { s: 'dalam_pengiriman', l: 'Dalam perjalanan', ikon: Navigation },
    { s: 'selesai', l: 'Serahkan ke pembeli', ikon: Check },
];

export default function DeliveryDetail({ kode }) {
    const { seed, pengiriman, busy, majukanStatus, tambahToast } = useDemo();

    const [konfirmasi, setKonfirmasi] = useState(null);
    const [catatan, setCatatan] = useState('');

    const pesanan = (seed.pesanan ?? []).find((p) => String(p.kode) === String(kode)) ?? null;

    const kiriman =
        (pengiriman ?? []).find((p) => String(p.pesanan_id) === String(pesanan?.id)) ?? null;

    if (!pesanan) {
        return (
            <DashboardLayout judul="Detail Pengiriman" peran={ROLES.KURIR}>
                <Head title="Detail Pengiriman" />
                <Kosong
                    ikon={ClipboardList}
                    judul="Pesanan tidak ditemukan"
                    deskripsi="Pesanan ini sudah selesai atau tidak tersedia."
                    aksi={
                        <Button as={Link} varian="garis" href="/courier/pengiriman">
                            Kembali ke daftar
                        </Button>
                    }
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            </DashboardLayout>
        );
    }

    const status = pesanan.status;
    const meta = STATUS_PESANAN[status] ?? {};
    const total = ongkirNilai(pesanan) || ongkirNilai(kiriman);
    const nextStage = TAHAP.find((t) => t.s === status);
    const sudahSelesai = status === 'selesai';

    async function ubahStatus(baru, catatanOpsional = '') {
        try {
            await majukanStatus(pesanan.id, baru, 'Kurir', catatanOpsional);
            tambahToast(
                baru === 'selesai'
                    ? 'Pengiriman selesai. Ongkir masuk ke pendataranmu.'
                    : 'Status pengiriman diperbarui.',
                'sukses',
            );
            setKonfirmasi(null);
            setCatatan('');
        } catch (salah) {
            tambahToast(salah.message, 'bahaya');
        }
    }

    return (
        <DashboardLayout judul="Detail Pengiriman" peran={ROLES.KURIR}>
            <Head title={`Pengiriman ${pesanan.kode}`} />

            <div className="mb-5">
                <PageHeader
                    judul={`Pesanan ${pesanan.kode}`}
                    deskripsi={meta.deskripsi ?? 'Rincian pengiriman yang harus kamu antarkan.'}
                    ikon={ShieldCheck}
                    breadcrumbs={[
                        { label: 'Pengiriman', href: '/courier/pengiriman' },
                        { label: pesanan.kode },
                    ]}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card elevate className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={toneBadgeStatus(status)}>{meta.label ?? status}</Badge>
                            <Badge tone={sudahLunas(pesanan) ? 'sukses' : 'peringatan'}>
                                {sudahLunas(pesanan) ? 'Sudah dibayar' : 'Belum dibayar'}
                            </Badge>
                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-navy-400">
                                <Clock className="size-3.5" />
                                {pesanan.eta ? `ETA ${waktuLengkap(pesanan.eta)}` : 'Tanpa ETA'}
                            </span>
                        </div>

                        <div className="mt-4">
                            <StepperStatus status={status} timeline={pesanan.timeline} />
                        </div>

                        <h2 className="mt-5 text-[13px] font-extrabold text-navy-900">
                            Rincian pesanan
                        </h2>
                        <ul className="mt-2 divide-y divide-slate-100">
                            {(pesanan.items ?? []).map((it) => (
                                <li
                                    key={it.id ?? it.menu_id}
                                    className="flex items-center justify-between gap-3 py-2.5 text-[12px]"
                                >
                                    <span className="text-navy-600">
                                        <span className="font-extrabold text-navy-900">{it.qty}x</span>{' '}
                                        {it.nama}
                                        {it.catatan ? (
                                            <span className="mt-0.5 block text-[10px] text-navy-300">
                                                Catatan: {it.catatan}
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="shrink-0 font-bold text-navy-800">
                                        {rupiah(it.subtotal ?? it.harga * it.qty)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-3 border-t border-dashed border-slate-200 pt-2">
                            <InfoRow
                                label="Subtotal"
                                nilai={rupiah(subTotalPesanan(pesanan))}
                            />
                            <InfoRow
                                label={
                                    ongkirGratis(pesanan)
                                        ? 'Ongkos kirim (gratis)'
                                        : 'Ongkos kirim'
                                }
                                nilai={rupiah(total)}
                                ikon={Coins}
                            />
                            <InfoRow
                                label="Total tagihan"
                                nilai={
                                    <span className="text-sm font-extrabold">
                                        {rupiah(totalPesanan(pesanan))}
                                    </span>
                                }
                            />
                        </dl>
                    </Card>

                    <Card elevate className="p-5">
                        <h2 className="flex items-center gap-2 text-[13px] font-extrabold text-navy-900">
                            <MapPin className="size-4 text-powder-500" />
                            Alamat pengiriman
                        </h2>
                        <p className="mt-2 text-[13px] text-navy-600">{alamatTeks(pesanan)}</p>
                        <p className="mt-1 text-[11px] text-navy-400">
                            Jarak sekitar {jarakTeks(pesanan) ?? 'tidak diketahui'} · ongkir{' '}
                            {ongkirGratis(pesanan) ? 'gratis' : rupiah(ongkirNilai(pesanan))}
                        </p>

                        {pesanan.catatan ? (
                            <p className="mt-3 rounded-2xl bg-butter-50 p-3 text-[12px] text-navy-600">
                                Catatan pembeli: {pesanan.catatan}
                            </p>
                        ) : null}
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card elevate className="p-5">
                        <h2 className="text-[13px] font-extrabold text-navy-900">Tindakan</h2>

                        {sudahSelesai ? (
                            <p className="mt-3 rounded-2xl bg-success-50 p-3.5 text-[12px] font-semibold text-success-700">
                                Pengiriman ini sudah selesai. Ongkir {rupiah(total)} masuk ke pendataranmu.
                            </p>
                        ) : (
                            <div className="mt-3 space-y-2">
                                {TAHAP.map((t) => (
                                    <Button
                                        key={t.s}
                                        className="w-full"
                                        ikon={t.ikon}
                                        varian={t.s === status ? 'utama' : 'garis'}
                                        ukuran="sm"
                                        disabled={busy || t.s === status}
                                        onClick={() =>
                                            t.s === 'selesai' ? setKonfirmasi(t) : ubahStatus(t.s)
                                        }
                                    >
                                        {t.l}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {teleponPembeli(pesanan) ? (
                            <a
                                href={`tel:${teleponPembeli(pesanan)}`}
                                className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 py-2.5 text-[12px] font-bold text-navy-600 transition hover:bg-slate-50"
                            >
                                <Phone className="size-3.5" />
                                Hubungi pembeli
                            </a>
                        ) : (
                            <p className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 py-2.5 text-[12px] font-semibold text-navy-400">
                                <Phone className="size-3.5" />
                                Nomor pembeli tidak tersedia
                            </p>
                        )}

                        <Link
                            href="/courier/pengiriman"
                            className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] font-bold text-navy-400 transition hover:text-navy-700"
                        >
                            <ChevronLeft className="size-3.5" />
                            Kembali ke daftar
                        </Link>
                    </Card>

                    <Card className="p-5">
                        <h2 className="flex items-center gap-2 text-[13px] font-extrabold text-navy-900">
                            <User className="size-4 text-powder-500" />
                            Pembeli
                        </h2>
                        <p className="mt-2 text-[12px] text-navy-600">{namaPembeli(pesanan)}</p>
                        <p className="text-[11px] text-navy-400">
                            {teleponPembeli(pesanan) || 'Nomor belum tersedia'}
                        </p>
                    </Card>

                    <Card className="p-5">
                        <h2 className="text-[13px] font-extrabold text-navy-900">Riwayat status</h2>
                        <div className="mt-3">
                            <Timeline items={pesanan.timeline ?? []} />
                        </div>

                        {nextStage ? (
                            <p className="mt-3 text-[11px] text-navy-400">
                                Saat ini: {nextStage.l}
                                {kiriman?.diambil_pada
                                    ? ` · diklaim ${waktuLengkap(kiriman.diambil_pada)}`
                                    : ''}
                            </p>
                        ) : null}
                    </Card>
                </div>
            </div>

            <Modal
                buka={Boolean(konfirmasi)}
                tutup={() => setKonfirmasi(null)}
                judul="Serahkan ke pembeli?"
                deskripsi={`Pesanan ${pesanan.kode} akan ditandai selesai. Ongkir ${rupiah(total)} masuk ke pendataranmu.`}
                ikon={Check}
                footer={
                    <>
                        <Button varian="garis" onClick={() => setKonfirmasi(null)}>
                            Batal
                        </Button>
                        <Button disabled={busy} onClick={() => ubahStatus('selesai', catatan)}>
                            Ya, selesai
                        </Button>
                    </>
                }
            >
                <Textarea
                    baris={3}
                    label="Catatan serah terima (opsional)"
                    petunjuk="Contoh: barang diterima pembeli dalam kondisi baik."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: diterima pukul 12.30 oleh Rina."
                />
            </Modal>
        </DashboardLayout>
    );
}
