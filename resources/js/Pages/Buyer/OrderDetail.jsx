import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Bike,
    Copy,
    MapPin,
    MessageCircle,
    Star,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Modal } from '../../Components/ui/Modal';
import { Textarea } from '../../Components/ui/Form';
import { InfoRow } from '../../Components/ui/Misc';
import { KotakEta, StepperStatus, Timeline } from '../../Components/ui/Stepper';
import AppLayout from '../../Layouts/AppLayout';
import { STATUS_PESANAN, metodePembayaran, toneBadgeStatus } from '../../lib/constants';
import { rupiah, waktuLengkap } from '../../lib/format';
import {
    alamatLabel,
    alamatNama,
    alamatPatokan,
    alamatTeks,
    alamatTelepon,
    jarakTeks,
} from '../../lib/pesanan';
import { useDemo } from '../../stores/DemoContext';

const ALASAN_BATAL = [
    'Salah memilih menu',
    'Ingin mengubah jadwal',
    'Berubah pikiran',
    'Perlu 확인 dulu dengan pantry',
    'Lainnya',
];

export default function OrderDetail() {
    const { kode } = usePage().props;
    const {
        pesanan,
        batalkanPesanan,
        tambahUlasan,
        ulasan,
        busy,
        tambahToast,
    } = useDemo();

    const [modalBatal, setModalBatal] = useState(false);
    const [modalUlas, setModalUlas] = useState(false);
    const [alasan, setAlasan] = useState(ALASAN_BATAL[0]);
    const [alasanLain, setAlasanLain] = useState('');
    const [rating, setRating] = useState(5);
    const [komentar, setKomentar] = useState('');
    const [sudahUlas, setSudahUlas] = useState(false);

    const pesan = pesanan.find((p) => p.kode === kode);

    if (!pesan) {
        return (
            <AppLayout>
                <Head title="Detail Pesanan" />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <Kosong
                        ikon={XCircle}
                        judul="Pesanan tidak ditemukan"
                        deskripsi={`Kode ${kode ?? '-'} tidak ada di daftar pesananmu.`}
                        aksi={
                            <Button as={Link} href="/pesanan">Kembali ke pesanan</Button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                </div>
            </AppLayout>
        );
    }

    const metode = metodePembayaran(pesan.metode_bayar);
    const bisaDibatalkan = !['diambil_kurir', 'dalam_pengiriman', 'selesai', 'dibatalkan'].includes(
        pesan.status,
    );
    const bolehUlas = pesan.status === 'selesai';
    const ulasanku = ulasan.find((u) => String(u.order_id) === String(pesan.id)) ?? (sudahUlas ? { nilai: rating, isi: komentar } : null);

    async function konfirmasiBatal() {
        const teks = alasan === 'Lainnya' ? alasanLain || 'Tidak disebutkan' : alasan;

        try {
            await batalkanPesanan(pesan.id, teks);
            setModalBatal(false);
        } catch (e) {
            tambahToast(e?.message ?? 'Pesanan tidak bisa dibatalkan.', 'error');
        }
    }

    function kirimUlasan() {
        if (komentar.trim().length < 5) {
            tambahToast('Ulasan minimal 5 karakter.', 'error');

            return;
        }

        tambahUlasan({
            order_id: pesan.id,
            restoran_id: pesan.restoran_id,
            restoran_nama: pesan.restoran_nama,
            nama: pesan.pembeli_nama,
            rating,
            isi: komentar,
        });
        setSudahUlas(true);
        setModalUlas(false);
        tambahToast('Terima kasih, ulasanmu tersimpan.', 'sukses', 'Ulasan terkirim');
    }

    return (
        <AppLayout>
            <Head title={`Pesanan ${pesan.kode}`} />

            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
                <Link
                    href="/pesanan"
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-navy-500 hover:text-powder-600"
                >
                    <ArrowLeft className="size-4" />
                    Semua pesanan
                </Link>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="font-mono text-lg font-extrabold text-navy-900 sm:text-xl">
                                {pesan.kode}
                            </h1>
                            <Badge tone={toneBadgeStatus(pesan.status)}>
                                {STATUS_PESANAN[pesan.status]?.label ?? pesan.status}
                            </Badge>
                        </div>
                        <p className="mt-1 text-[12px] text-navy-400">
                            Dibuat {waktuLengkap(pesan.dibuat_pada)} · {pesan.restoran_nama}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            ukuran="sm"
                            varian="garis"
                            onClick={() => {
                                navigator.clipboard
                                    ?.writeText(pesan.kode)
                                    .then(() => tambahToast('Kode pesanan disalin.', 'sukses'))
                                    .catch(() => tambahToast('Gagal menyalin kode.', 'error'));
                            }}
                        >
                            <Copy className="size-3.5" />
                            Salin
                        </Button>
                        <Button
                            ukuran="sm"
                            varian="garis"
                            onClick={() =>
                                window.open(
                                    `https://wa.me/?text=${encodeURIComponent(
                                        `Halo, saya ingin menanyakan pesanan ${pesan.kode}.`,
                                    )}`,
                                    '_blank',
                                    'noopener',
                                )
                            }
                        >
                            <MessageCircle className="size-3.5" />
                            Hubungi
                        </Button>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <Card elevate className="p-5">
                            <h2 className="text-[15px] font-extrabold text-navy-900">Status pesanan</h2>
                            <div className="mt-4">
                                <StepperStatus status={pesan.status} timeline={pesan.timeline} />
                            </div>
                        </Card>

                        <Card className="p-5">
                            <h2 className="text-[15px] font-extrabold text-navy-900">Item pesanan</h2>
                            <ul className="mt-3 divide-y divide-slate-100">
                                {(pesan.items ?? []).map((b, i) => (
                                    <li key={i} className="flex items-center gap-3 py-3">
                                        <img
                                            src={b.gambar}
                                            alt={b.nama}
                                            onError={(e) => {
                                                e.currentTarget.style.visibility = 'hidden';
                                            }}
                                            className="size-14 shrink-0 rounded-2xl object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] font-bold text-navy-900">{b.nama}</p>
                                            <p className="text-[11px] text-navy-400">
                                                {rupiah(b.harga)} × {b.qty}
                                            </p>
                                            {b.catatan ? (
                                                <p className="mt-1 rounded-lg bg-butter-50 px-2 py-0.5 text-[10px] font-semibold text-butter-700">
                                                    {b.catatan}
                                                </p>
                                            ) : null}
                                        </div>
                                        <p className="shrink-0 text-[13px] font-extrabold text-navy-900">
                                            {rupiah(b.harga * b.qty)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <dl className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-[13px]">
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Subtotal</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(pesan.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Ongkir</dt>
                                    <dd className="font-bold text-navy-900">
                                        {pesan.ongkir_gratis ? 'Gratis' : rupiah(pesan.ongkir)}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Biaya layanan</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(pesan.biaya_layanan)}</dd>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-3">
                                    <dt className="font-extrabold text-navy-800">Total</dt>
                                    <dd className="text-lg font-extrabold text-navy-900">
                                        {rupiah(pesan.total)}
                                    </dd>
                                </div>
                            </dl>
                        </Card>

                        <Card className="p-5">
                            <h2 className="text-[15px] font-extrabold text-navy-900">Riwayat status</h2>
                            <div className="mt-4">
                                <Timeline items={pesan.timeline ?? []} />
                            </div>
                        </Card>

                        {/* Ulasan */}
                        {bolehUlas ? (
                            <Card className="p-5">
                                <h2 className="text-[15px] font-extrabold text-navy-900">Beri ulasan</h2>
                                {ulasanku ? (
                                    <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={[
                                                        'size-4',
                                                        i < (ulasanku.nilai ?? ulasanku.rating ?? 0)
                                                            ? 'fill-butter-400 text-butter-400'
                                                            : 'text-slate-300',
                                                    ].join(' ')}
                                                />
                                            ))}
                                        </div>
                                        <p className="mt-2 text-[13px] text-navy-600">
                                            {ulasanku.isi ?? ulasanku.komentar}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mt-1 text-[12px] text-navy-400">
                                            Bagikan pengalamanmu, bantu restoran lain meningkatkan layanan.
                                        </p>
                                        <Button
                                            className="mt-3"
                                            ukuran="sm"
                                            varian="garis"
                                            onClick={() => setModalUlas(true)}
                                        >
                                            <Star className="size-3.5" />
                                            Tulis ulasan
                                        </Button>
                                    </>
                                )}
                            </Card>
                        ) : null}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        {pesan.eta ? (
                            <KotakEta eta={pesan.eta} label="Estimasi tiba" />
                        ) : null}

                        <Card className="p-4">
                            <p className="text-[13px] font-extrabold text-navy-900">Rincian</p>
                            <div className="mt-3 space-y-3">
                                <InfoRow
                                    label="Metode bayar"
                                    nilai={metode.label}
                                    ikon={Bike}
                                />
                                <InfoRow label="Status bayar" nilai={pesan.status_bayar} />
                                <InfoRow label="Dibayar" nilai={rupiah(pesan.dibayar_sebesar ?? 0)} />
                                {pesan.sisa_tagihan > 0 ? (
                                    <InfoRow label="Sisa tagihan" nilai={rupiah(pesan.sisa_tagihan)} />
                                ) : null}
                                <InfoRow label="Jarak" nilai={jarakTeks(pesan) ?? 'Tidak tersedia'} ikon={MapPin} />
                                {pesan.kurir_nama ? (
                                    <InfoRow label="Kurir" nilai={pesan.kurir_nama} />
                                ) : null}
                            </div>
                        </Card>

                        {pesan.alamat ? (
                            <Card className="p-4">
                                <p className="text-[13px] font-extrabold text-navy-900">
                                    Alamat pengiriman
                                </p>
                                {alamatNama(pesan) || alamatLabel(pesan) ? (
                                    <p className="mt-1.5 text-[12px] font-bold text-navy-700">
                                        {[alamatNama(pesan), alamatLabel(pesan)]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                ) : null}
                                <p className="mt-0.5 text-[11px] leading-relaxed text-navy-400">
                                    {alamatTeks(pesan)}
                                </p>
                                {alamatPatokan(pesan) ? (
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-navy-400">
                                        Patokan: {alamatPatokan(pesan)}
                                    </p>
                                ) : null}
                                {alamatTelepon(pesan) ? (
                                    <p className="mt-1 text-[11px] text-navy-400">
                                        {alamatTelepon(pesan)}
                                    </p>
                                ) : null}
                            </Card>
                        ) : null}

                        {pesan.catatan ? (
                            <Card className="p-4">
                                <p className="text-[13px] font-extrabold text-navy-900">Catatanmu</p>
                                <p className="mt-1.5 text-[12px] leading-relaxed text-navy-500">{pesan.catatan}</p>
                            </Card>
                        ) : null}

                        {bisaDibatalkan ? (
                            <Button
                                lebarPenuh
                                varian="bahaya"
                                onClick={() => setModalBatal(true)}
                                memuat={busy}
                            >
                                Batalkan pesanan
                            </Button>
                        ) : null}
                    </aside>
                </div>
            </div>

            {/* Modal batal */}
            <Modal
                buka={modalBatal}
                tutup={() => setModalBatal(false)}
                judul="Batalkan pesanan?"
                deskripsi="Tindakan ini tidak bisa dibatalkan. Kuota slot akan dilepas kembali ke restoran."
                ikon={XCircle}
                footer={
                    <>
                        <Button varian="garis" onClick={() => setModalBatal(false)}>
                            Tidak jadi
                        </Button>
                        <Button varian="bahaya" onClick={konfirmasiBatal} memuat={busy}>
                            Ya, batalkan
                        </Button>
                    </>
                }
            >
                <ul className="space-y-2">
                    {ALASAN_BATAL.map((a) => (
                        <li key={a}>
                            <label
                                className={[
                                    'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-[13px] font-semibold transition-colors',
                                    alasan === a
                                        ? 'border-danger-500/40 bg-danger-50 text-danger-600'
                                        : 'border-slate-200 text-navy-600',
                                ].join(' ')}
                            >
                                <input
                                    type="radio"
                                    name="alasan"
                                    value={a}
                                    checked={alasan === a}
                                    onChange={() => setAlasan(a)}
                                    className="accent-danger-500"
                                />
                                {a}
                            </label>
                        </li>
                    ))}
                </ul>

                {alasan === 'Lainnya' ? (
                    <Textarea
                        className="mt-3"
                        baris={2}
                        label="Tulis alasanmu"
                        value={alasanLain}
                        onChange={(e) => setAlasanLain(e.target.value)}
                        placeholder="Contoh: salah memasukkan alamat..."
                    />
                ) : null}
            </Modal>

            {/* Modal ulasan */}
            <Modal
                buka={modalUlas}
                tutup={() => setModalUlas(false)}
                judul="Beri ulasan"
                deskripsi={`Bagaimana pengalamanmu dengan ${pesan.restoran_nama}?`}
                ikon={Star}
                footer={
                    <>
                        <Button varian="garis" onClick={() => setModalUlas(false)}>
                            Batal
                        </Button>
                        <Button onClick={kirimUlasan}>Kirim ulasan</Button>
                    </>
                }
            >
                <div className="text-center">
                    <p className="text-[12px] font-semibold text-navy-500">Rating</p>
                    <div className="mt-2 flex justify-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setRating(i + 1)}
                                aria-label={`Beri rating ${i + 1}`}
                                className="transition-transform hover:scale-115"
                            >
                                <Star
                                    className={[
                                        'size-8',
                                        i < rating ? 'fill-butter-400 text-butter-400' : 'text-slate-300',
                                    ].join(' ')}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="mt-1.5 text-[12px] font-bold text-navy-700">{rating} dari 5</p>
                </div>

                <Textarea
                    className="mt-4"
                    label="Ceritakan pengalamanmu"
                    baris={4}
                    value={komentar}
                    onChange={(e) => setKomentar(e.target.value)}
                    placeholder="Packing-nya rapi? Rasanya sesuai? Kurirnya sopan?"
                />
            </Modal>
        </AppLayout>
    );
}
