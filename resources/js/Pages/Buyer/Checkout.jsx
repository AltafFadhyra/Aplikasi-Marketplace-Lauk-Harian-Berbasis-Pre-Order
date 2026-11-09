import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    CheckCircle2,
    Clock3,
    MapPin,
    QrCode,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Kosong } from '../../Components/ui/Feedback';
import { Checkbox, Input, Textarea } from '../../Components/ui/Form';
import AppLayout from '../../Layouts/AppLayout';
import { BIAYA_LAYANAN, METODE_PEMBAYARAN, metodePembayaran } from '../../lib/constants';
import { hitungOngkir } from '../../lib/distance';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

const IKON_METODE = {
    qris: QrCode,
    transfer: Banknote,
    dp: Wallet,
    cod: Banknote,
};

const LANGKAH = ['Alamat', 'Slot', 'Bayar'];

export default function Checkout() {
    const { keranjang, keranjangRingkas, seed, buatPesanan, busy, penggunaAktif, slotRestoran } =
        useDemo();

    const [langkah, setLangkah] = useState(1);
    const [metode, setMetode] = useState('qris');
    const [galat, setGalat] = useState({});

    const [form, setForm] = useState({
        nama: penggunaAktif?.nama ?? '',
        telepon: penggunaAktif?.telepon ?? '081234567890',
        label: 'Rumah',
        alamat: '',
        catatan: '',
        setuju: false,
    });

    const restoId = keranjangRingkas.restoranIds[0];
    const restoran = (seed.restoran ?? []).find((r) => String(r.id) === String(restoId));

    // Pakai slotRestoran (state termutasi) supaya kuota terisi ikut terpotong setelah pesanan dibuat.
    const semuaSlot = (slotRestoran(restoId) ?? []).filter((s) => s.sisa > 0);

    const [alamat, setAlamat] = useState(null);
    const [slotId, setSlotId] = useState(semuaSlot[0]?.id ?? null);

    useEffect(() => {
        setSlotId(semuaSlot[0]?.id ?? null);
    }, [restoId, slotRestoran]);

    // Jarak dihitung dari koordinat alamat pilihan; default ke koordinat akun.
    const jarak = useMemo(() => {
        const lat = alamat?.latitude ?? penggunaAktif?.latitude ?? restoran?.latitude ?? 0;
        const lon = alamat?.longitude ?? penggunaAktif?.longitude ?? restoran?.longitude ?? 0;

        return Number((restoran?.jarak_km ?? 0).toFixed(1)) || 0;
    }, [alamat, restoran, penggunaAktif]);

    const ongkir = hitungOngkir(jarak, keranjangRingkas.subtotal);
    const total = keranjangRingkas.subtotal + ongkir.dasar + BIAYA_LAYANAN;
    const mDp = metode === 'dp' ? Math.round(keranjangRingkas.subtotal * 0.3) : 0;
    const bayarSekarang = metode === 'cod' ? 0 : metode === 'dp' ? mDp : total;
    const sisaTagihan = total - bayarSekarang;
    const metodeTerpilih = metodePembayaran(metode);

    function ubah(kunci, nilai) {
        setForm((f) => ({ ...f, [kunci]: nilai }));
        setGalat((g) => ({ ...g, [kunci]: undefined }));
    }

    function lanjutDariAlamat() {
        const g = {};

        if (!form.nama.trim()) g.nama = 'Nama wajib diisi.';
        if (!/^0\d{8,13}$/.test(form.telepon.replace(/\s/g, '')))
            g.telepon = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
        if (form.alamat.trim().length < 10) g.alamat = 'Tulis alamat lengkap beserta patokan.';

        setGalat(g);

        if (Object.keys(g).length) return;

        // Simulasi pemetaan alamat dari pilihan peta.
        setAlamat({
            label: form.label,
            detail: form.alamat,
            latitude: (penggunaAktif?.latitude ?? -6.9147) + 0.004,
            longitude: (penggunaAktif?.longitude ?? 107.6098) + 0.004,
        });
        setLangkah(2);
    }

    function lanjutDariSlot() {
        if (!slotId) {
            setGalat({ slot: 'Pilih slot pengiriman terlebih dahulu.' });

            return;
        }

        setGalat({});
        setLangkah(3);
    }

    async function kirim() {
        if (!form.setuju) {
            setGalat({ setuju: 'Kamu harus menyetujui ketentuan pemesanan.' });

            return;
        }

        try {
            const pesanan = await buatPesanan({
                slot_id: slotId,
                metode_bayar: metode,
                alamat: {
                    nama: form.nama,
                    telepon: form.telepon,
                    label: form.label,
                    detail: form.alamat,
                    catatan: form.catatan,
                },
                catatan: form.catatan,
            });

            if (pesanan?.kode) {
                router.visit(`/keranjang/sukses?kode=${encodeURIComponent(pesanan.kode)}`);
            }
        } catch (e) {
            setGalat({ umpan: e?.message ?? 'Pesanan gagal dibuat.' });
        }
    }

    if (!keranjang.length) {
        return (
            <AppLayout>
                <Head title="Checkout" />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                    <Kosong
                        ikon={Clock3}
                        judul="Tidak ada yang bisa di-checkout"
                        deskripsi="Keranjangmu kosong. Pilih menu dulu sebelum melanjutkan."
                        aksi={
                            <Button as={Link} href="/cari">Mulai pesan</Button>
                        }
                        className="rounded-3xl border border-white/70 bg-white/70 py-6"
                    />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout tanpaFooter>
            <Head title="Checkout" />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                <Link
                    href="/keranjang"
                    className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-navy-500 hover:text-powder-600"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke keranjang
                </Link>

                <h1 className="text-xl font-extrabold text-navy-900 sm:text-2xl">Checkout</h1>

                {/* Stepper */}
                <ol className="mt-5 flex items-center gap-2">
                    {LANGKAH.map((l, i) => {
                        const n = i + 1;
                        const aktif = langkah === n;
                        const selesai = langkah > n;

                        return (
                            <li key={l} className="flex flex-1 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => n < langkah && setLangkah(n)}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className={[
                                            'grid size-8 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold transition-all',
                                            selesai
                                                ? 'bg-success-500 text-white'
                                                : aktif
                                                  ? 'bg-powder-500 text-white shadow-[0_6px_14px_-6px_rgba(109,156,210,0.9)]'
                                                  : 'bg-white text-navy-300 border border-slate-200',
                                        ].join(' ')}
                                    >
                                        {selesai ? <CheckCircle2 className="size-4" /> : n}
                                    </span>
                                    <span
                                        className={[
                                            'hidden text-[12px] font-bold sm:block',
                                            aktif ? 'text-navy-900' : 'text-navy-400',
                                        ].join(' ')}
                                    >
                                        {l}
                                    </span>
                                </button>
                                {n < LANGKAH.length ? (
                                    <span
                                        className={[
                                            'h-0.5 flex-1 rounded-full transition-colors',
                                            selesai ? 'bg-success-500' : 'bg-slate-200',
                                        ].join(' ')}
                                    />
                                ) : null}
                            </li>
                        );
                    })}
                </ol>

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        {/* Langkah 1: alamat */}
                        {langkah === 1 ? (
                            <Card elevate className="p-5">
                                <h2 className="text-[15px] font-extrabold text-navy-900">Alamat pengiriman</h2>
                                <p className="mt-1 text-[12px] text-navy-400">
                                    Kurir akan menemukan kamu lewat patokan yang kamu tulis.
                                </p>

                                {galat.umpan ? (
                                    <p className="mt-3 rounded-xl bg-danger-50 px-3 py-2 text-[12px] font-semibold text-danger-600">
                                        {galat.umpan}
                                    </p>
                                ) : null}

                                <div className="mt-4 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Input
                                            label="Nama penerima"
                                            wajib
                                            galat={galat.nama}
                                            value={form.nama}
                                            onChange={(e) => ubah('nama', e.target.value)}
                                            placeholder="Nama lengkap"
                                        />
                                        <Input
                                            label="Nomor WhatsApp"
                                            wajib
                                            galat={galat.telepon}
                                            value={form.telepon}
                                            onChange={(e) => ubah('telepon', e.target.value)}
                                            placeholder="081234567890"
                                        />
                                    </div>

                                    <div>
                                        <p className="mb-1.5 text-[13px] font-semibold text-navy-700">Label alamat</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Rumah', 'Kantor', 'Kampus'].map((l) => (
                                                <button
                                                    key={l}
                                                    type="button"
                                                    onClick={() => ubah('label', l)}
                                                    className={[
                                                        'rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-colors',
                                                        form.label === l
                                                            ? 'border-powder-400 bg-powder-50 text-powder-700'
                                                            : 'border-slate-200 bg-white text-navy-500',
                                                    ].join(' ')}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Textarea
                                        label="Alamat lengkap"
                                        wajib
                                        baris={3}
                                        galat={galat.alamat}
                                        petunjuk="Contoh: Jl. Cikutra No. 12, RT 02 RW 05, Bengali, Bandung. Depan masjid Al-Ikhlas."
                                        value={form.alamat}
                                        onChange={(e) => ubah('alamat', e.target.value)}
                                        placeholder="Tulis patokan yang mudah dikenali kurir..."
                                    />

                                    <Textarea
                                        label="Catatan untuk restoran (opsional)"
                                        baris={2}
                                        value={form.catatan}
                                        onChange={(e) => ubah('catatan', e.target.value)}
                                        placeholder="Contoh:.Extra sambal, tidak pedas, bungkus terpisah."
                                    />
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <p className="inline-flex items-center gap-1.5 text-[11px] text-navy-400">
                                        <MapPin className="size-3.5" />
                                        {restoran?.nama} · {jarak} km dari alamat ini
                                    </p>
                                    <Button onClick={lanjutDariAlamat}>Lanjut pilih slot</Button>
                                </div>
                            </Card>
                        ) : null}

                        {/* Langkah 2: slot */}
                        {langkah === 2 ? (
                            <Card elevate className="p-5">
                                <h2 className="text-[15px] font-extrabold text-navy-900">Pilih slot pengiriman</h2>
                                <p className="mt-1 text-[12px] text-navy-400">
                                    Pre-order maksimal 3 hari ke depan. Sisa kuota ditampilkan realtime.
                                </p>

                                {galat.slot ? (
                                    <p className="mt-3 rounded-xl bg-danger-50 px-3 py-2 text-[12px] font-semibold text-danger-600">
                                        {galat.slot}
                                    </p>
                                ) : null}

                                {!semuaSlot.length ? (
                                    <p className="mt-4 rounded-xl bg-warning-50 px-4 py-3 text-[12px] font-semibold text-warning-600">
                                        Semua slot {restoran?.nama} sudah penuh untuk 3 hari ke depan. Coba restoran lain.
                                    </p>
                                ) : (
                                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                                        {semuaSlot.map((s) => {
                                            const aktif = String(slotId) === String(s.id);
                                            const hampirPenuh = s.sisa <= 3;

                                            return (
                                                <li key={s.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSlotId(s.id);
                                                            setGalat({});
                                                        }}
                                                        className={[
                                                            'w-full rounded-2xl border p-3.5 text-left transition-all duration-250',
                                                            aktif
                                                                ? 'border-powder-400 bg-powder-50/70 shadow-[0_6px_18px_-10px_rgba(109,156,210,0.8)]'
                                                                : 'border-slate-200 bg-white hover:border-powder-300',
                                                        ].join(' ')}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-[13px] font-extrabold text-navy-900">
                                                                    {s.tanggal_label}
                                                                </p>
                                                                <p className="mt-0.5 text-[12px] font-semibold text-powder-600">
                                                                    {s.jam_mulai} - {s.jam_selesai}
                                                                </p>
                                                            </div>
                                                            {aktif ? (
                                                                <CheckCircle2 className="size-5 shrink-0 text-powder-500" />
                                                            ) : null}
                                                        </div>

                                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                            <Badge tone={hampirPenuh ? 'peringatan' : 'sukses'} ukuran="xs">
                                                                Sisa {s.sisa} slot
                                                            </Badge>
                                                            {s.batas_pesan ? (
                                                                <span className="text-[10px] text-navy-300">
                                                                    batas {waktuRelatif(s.batas_pesan)}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <Button varian="garis" onClick={() => setLangkah(1)}>
                                        Ubah alamat
                                    </Button>
                                    <Button onClick={lanjutDariSlot} disabled={!semuaSlot.length}>
                                        Lanjut pembayaran
                                    </Button>
                                </div>
                            </Card>
                        ) : null}

                        {/* Langkah 3: pembayaran */}
                        {langkah === 3 ? (
                            <Card elevate className="p-5">
                                <h2 className="text-[15px] font-extrabold text-navy-900">Metode pembayaran</h2>

                                <ul className="mt-4 space-y-2.5">
                                    {METODE_PEMBAYARAN.map((m) => {
                                        const Ikon = IKON_METODE[m.key] ?? Banknote;
                                        const aktif = metode === m.key;

                                        return (
                                            <li key={m.key}>
                                                <button
                                                    type="button"
                                                    onClick={() => setMetode(m.key)}
                                                    className={[
                                                        'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-250',
                                                        aktif
                                                            ? 'border-powder-400 bg-powder-50/60'
                                                            : 'border-slate-200 bg-white hover:border-powder-300',
                                                    ].join(' ')}
                                                >
                                                    <span
                                                        className={[
                                                            'grid size-10 shrink-0 place-items-center rounded-xl',
                                                            aktif ? 'bg-powder-500 text-white' : 'bg-slate-100 text-navy-400',
                                                        ].join(' ')}
                                                    >
                                                        <Ikon className="size-5" strokeWidth={2.2} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-[13px] font-extrabold text-navy-900">
                                                            {m.label}
                                                        </span>
                                                        <span className="block text-[11px] text-navy-400">
                                                            {m.deskripsi}
                                                        </span>
                                                    </span>
                                                    {aktif ? (
                                                        <CheckCircle2 className="size-5 shrink-0 text-powder-500" />
                                                    ) : null}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {metode !== 'cod' ? (
                                    <div className="mt-4 rounded-2xl border border-dashed border-powder-300 bg-powder-50/50 p-4">
                                        <p className="text-[12px] font-extrabold text-navy-900">
                                            Pembayaran QRIS
                                        </p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-navy-500">
                                            Pindai kode di bawah ini menggunakan aplikasi pembayaran apa pun.
                                            Pesanan langsung diproses setelah pembayaran terkonfirmasi.
                                        </p>
                                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
                                            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-navy-900 text-white">
                                                <QrCode className="size-7" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-navy-700">
                                                    {metodeTerpilih.label}
                                                </p>
                                                <p className="truncate text-[10px] text-navy-400">
                                                    Kode: PRD-{new Date().getFullYear()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-4 flex items-start gap-2 rounded-2xl bg-info-50 px-4 py-3 text-[11px] leading-relaxed text-info-600">
                                        <ShieldCheck className="mt-px size-4 shrink-0" />
                                        Siapkan uang tunai atau scan QRIS milik kurir saat pesanan tiba. Maksimal
                                        Rp200.000 untuk pembayaran di tempat.
                                    </p>
                                )}

                                <div className="mt-5">
                                    <Checkbox
                                        checked={form.setuju}
                                        onChange={(v) => ubah('setuju', v)}
                                        label="Saya setuju dengan ketentuan pemesanan dan kebijakan privasi Preorderly."
                                        galat={galat.setuju}
                                    />
                                </div>

                                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <Button varian="garis" onClick={() => setLangkah(2)}>
                                        Ubah slot
                                    </Button>
                                    <Button onClick={kirim} memuat={busy} ukuran="lg">
                                        <ShieldCheck className="size-4" />
                                        Bayar {bayarSekarang ? rupiah(bayarSekarang) : 'di tempat'}
                                    </Button>
                                </div>
                            </Card>
                        ) : null}
                    </div>

                    {/* Ringkasan */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <Card elevate className="p-5">
                            <h2 className="text-[15px] font-extrabold text-navy-900">Rincian biaya</h2>

                            <ul className="mt-3 space-y-2">
                                {keranjang.map((b) => (
                                    <li key={b.id} className="flex items-start justify-between gap-2 text-[12px]">
                                        <span className="min-w-0 flex-1 text-navy-600">
                                            <span className="font-bold">{b.qty}×</span> {b.nama}
                                        </span>
                                        <span className="shrink-0 font-bold text-navy-900">
                                            {rupiah(b.harga * b.qty)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <dl className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-[13px]">
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Subtotal</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(keranjangRingkas.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Ongkir ({jarak} km)</dt>
                                    <dd className={['font-bold', ongkir.gratis ? 'text-success-600' : 'text-navy-900'].join(' ')}>
                                        {ongkir.label}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-navy-400">Biaya layanan</dt>
                                    <dd className="font-bold text-navy-900">{rupiah(BIAYA_LAYANAN)}</dd>
                                </div>

                                <div className="flex justify-between border-t border-slate-200 pt-3">
                                    <dt className="font-extrabold text-navy-800">Total</dt>
                                    <dd className="text-lg font-extrabold text-navy-900">{rupiah(total)}</dd>
                                </div>

                                {mDp ? (
                                    <div className="flex justify-between rounded-xl bg-butter-50 px-3 py-2">
                                        <dt className="font-bold text-butter-700">Dibayar sekarang (DP 30%)</dt>
                                        <dd className="font-extrabold text-butter-700">{rupiah(mDp)}</dd>
                                    </div>
                                ) : null}

                                {sisaTagihan > 0 ? (
                                    <div className="flex justify-between text-[12px]">
                                        <dt className="text-navy-400">Sisa saat diterima</dt>
                                        <dd className="font-bold text-navy-600">{rupiah(sisaTagihan)}</dd>
                                    </div>
                                ) : null}
                            </dl>

                            <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3.5">
                                <p className="text-[11px] font-bold text-navy-700">Ringkasan pengiriman</p>
                                <p className="text-[11px] text-navy-500">
                                    Dari <span className="font-bold">{restoran?.nama}</span>
                                </p>
                                <p className="text-[11px] text-navy-500">
                                    Ke <span className="font-bold">{form.label} — {form.nama}</span>
                                </p>
                                <p className="text-[11px] text-navy-500">
                                    Slot{' '}
                                    <span className="font-bold">
                                        {semuaSlot.find(
                                            (s) => String(s.id) === String(slotId),
                                        )?.tanggal_label ?? '-'}
                                    </span>
                                </p>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
