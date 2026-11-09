import { Head } from '@inertiajs/react';
import {
    BadgeCheck,
    Bike,
    IdCard,
    KeyRound,
    Lock,
    LogOut,
    Mail,
    RotateCcw,
    Save,
    ShieldCheck,
    Smartphone,
    Star,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Checkbox, Input, Textarea } from '../../Components/ui/Form';
import { Avatar, Rating } from '../../Components/ui/Avatar';
import { InfoRow, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { sensorNik } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function Profile() {
    const { akun, penggunaAktif, tambahToast, bersihkanDemo, keluar, simpanProfil: simpanKeAkun, gantiKunci } =
        useDemo();

    const pengguna = penggunaAktif ?? {};
    const kurir = akun?.kurir ?? {};

    const [tab, setTab] = useState('profil');
    const [form, setForm] = useState({
        nama: kurir.nama ?? pengguna.nama ?? '',
        telepon: pengguna.telepon ?? '',
        email: pengguna.email ?? '',
        nik: kurir.nik ?? '',
        kendaraan: kurir.kendaraan ?? '',
        plat: kurir.plat ?? '',
        wilayah: kurir.wilayah ?? '',
    });
    const [sandi, setSandi] = useState({ sekarang: '', baru: '', konfirmasi: '' });
    const [galat, setGalat] = useState({});

    function ubah(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    function simpanProfil(e) {
        e.preventDefault();

        const lokal = {};

        if (!form.nama.trim()) lokal.nama = 'Nama wajib diisi.';
        if (form.telepon && !/^[0-9+\-\s()]{8,20}$/.test(form.telepon)) {
            lokal.telepon = 'Nomor telepon tidak valid.';
        }
        if (form.nik && !/^\d{16}$/.test(form.nik)) lokal.nik = 'NIK harus 16 digit angka.';

        setGalat(lokal);

        if (Object.keys(lokal).length) {
            tambahToast('Periksa kembali data yang ditandai.', 'bahaya');
            return;
        }

        simpanKeAkun({
            nama: form.nama.trim(),
            telepon: form.telepon,
            nik: form.nik,
            kendaraan: form.kendaraan,
            plat: form.plat,
            wilayah: form.wilayah,
        });
        tambahToast('Profil kurir berhasil disimpan.', 'sukses');
    }

    function gantiSandi(e) {
        e.preventDefault();

        if (!sandi.sekarang) {
            setGalat({ sandi_sekarang: 'Masukkan kata sandi saat ini.' });
            return;
        }
        if (sandi.baru.length < 8) {
            setGalat({ sandi_baru: 'Kata sandi baru minimal 8 karakter.' });
            return;
        }
        if (sandi.baru !== sandi.konfirmasi) {
            setGalat({ sandi_konfirmasi: 'Konfirmasi tidak sama dengan kata sandi baru.' });
            return;
        }

        const hasil = gantiKunci(sandi.baru, sandi.sekarang);

        if (!hasil.ok) {
            setGalat({ sandi_sekarang: hasil.pesan });
            return;
        }

        setGalat({});
        setSandi({ sekarang: '', baru: '', konfirmasi: '' });
        tambahToast('Kata sandi berhasil diperbarui.', 'sukses');
    }

    return (
        <DashboardLayout judul="Profil Kurir" peran={ROLES.KURIR}>
            <Head title="Profil Kurir" />

            <div className="mb-5">
                <PageHeader judul="Profil kurir" deskripsi="Kelola data diri, kendaraan, dan keamanan akunmu." />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4">
                    <Card elevate className="p-5 text-center">
                        <div className="flex justify-center">
                            <Avatar nama={form.nama} gambar={kurir.avatar} ukuran="xl" />
                        </div>

                        <p className="mt-3 text-[15px] font-extrabold text-navy-900">
                            {form.nama || 'Kurir'}
                        </p>
                        <p className="text-[11px] text-navy-400">{form.email || '-'}</p>

                        <div className="mt-2 flex justify-center">
                            <Rating nilai={Number(kurir.rating ?? 0)} jumlah={kurir.jumlah_rating} />
                        </div>

                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            <Badge tone="sukses" ikon={BadgeCheck}>
                                Terverifikasi
                            </Badge>
                            <Badge tone="netral" ikon={Bike}>
                                {form.kendaraan || 'Motor'}
                            </Badge>
                        </div>

                        <dl className="mt-4 border-t border-slate-100 pt-1 text-left">
                            <InfoRow
                                label="Total pengiriman"
                                nilai={kurir.total_pengiriman ?? 0}
                                ikon={Bike}
                            />
                            <InfoRow label="Plat kendaraan" nilai={form.plat || '-'} ikon={IdCard} />
                            <InfoRow label="Wilayah" nilai={form.wilayah || '-'} />
                        </dl>
                    </Card>

                    <Card className="p-5">
                        <p className="text-[12px] font-extrabold text-navy-900">Status ketersediaan</p>
                        <p className="mt-1 text-[11px] text-navy-400">
                            Matikan saat kamu tidak bisa menerima pesanan.
                        </p>
                        <label className="mt-3 flex items-center gap-2 text-[12px] text-navy-600">
                            <Checkbox
                                checked={kurir.aktif !== false}
                                onChange={() => {
                                    const berikut = kurir.aktif === false;
                                    simpanKeAkun({ aktif: berikut });
                                    tambahToast(
                                        berikut ? 'Kamu kembali menerima pesanan.' : 'Ketersediaan dimatikan.',
                                        'sukses',
                                    );
                                }}
                            />
                            <span>Terima pesanan baru</span>
                        </label>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card elevate className="overflow-hidden">
                        <div className="flex border-b border-slate-100">
                            {[
                                { k: 'profil', l: 'Data diri' },
                                { k: 'kendaraan', l: 'Kendaraan' },
                                { k: 'keamanan', l: 'Keamanan' },
                            ].map((t) => (
                                <button
                                    key={t.k}
                                    type="button"
                                    onClick={() => setTab(t.k)}
                                    className={[
                                        'flex-1 px-3 py-3 text-[12px] font-bold transition',
                                        tab === t.k
                                            ? 'border-b-2 border-powder-500 text-powder-600'
                                            : 'text-navy-400 hover:text-navy-700',
                                    ].join(' ')}
                                >
                                    {t.l}
                                </button>
                            ))}
                        </div>

                        {tab === 'profil' ? (
                            <form onSubmit={simpanProfil} className="space-y-3.5 p-5">
                                <Input
                                    label="Nama lengkap"
                                    wajib
                                    ikon={Smartphone}
                                    value={form.nama}
                                    onChange={ubah('nama')}
                                    galat={galat.nama}
                                />
                                <Input
                                    label="Nomor telepon"
                                    ikon={Smartphone}
                                    petunjuk="Dipakai pembeli saat pesanan dalam pengiriman."
                                    value={form.telepon}
                                    onChange={ubah('telepon')}
                                    galat={galat.telepon}
                                />
                                <Input
                                    label="Email"
                                    ikon={Mail}
                                    value={form.email}
                                    onChange={ubah('email')}
                                />
                                <Input
                                    label="NIK"
                                    ikon={IdCard}
                                    petunjuk={`Terenkripsi. ${form.nik ? sensorNik(form.nik) : ''}`}
                                    value={form.nik}
                                    onChange={ubah('nik')}
                                    galat={galat.nik}
                                />
                                <Textarea
                                    label="Wilayah layanan"
                                    baris={2}
                                    petunjuk="Contoh: Bandung Dago, Coblong, Sukajadi."
                                    value={form.wilayah}
                                    onChange={ubah('wilayah')}
                                />

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5">
                                    <Button varian="garis" type="button">
                                        Batal
                                    </Button>
                                    <Button type="submit" ikon={Save}>
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {tab === 'kendaraan' ? (
                            <form onSubmit={simpanProfil} className="space-y-3.5 p-5">
                                <Input
                                    label="Jenis kendaraan"
                                    ikon={Bike}
                                    petunjuk="Contoh: Motor, Sepeda, Sepeda Motor."
                                    value={form.kendaraan}
                                    onChange={ubah('kendaraan')}
                                />
                                <Input
                                    label="Nomor plat"
                                    ikon={IdCard}
                                    petunjuk="Huruf kapital dan angka, misal B 1234 XYZ."
                                    value={form.plat}
                                    onChange={ubah('plat')}
                                />
                                <Textarea
                                    label="Catatan untuk pembeli"
                                    baris={3}
                                    petunjuk="Contoh: gunakan jaket hujan saat hujan deras."
                                    value={form.catatan ?? ''}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, catatan: e.target.value }))
                                    }
                                />

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5">
                                    <Button varian="garis" type="button">
                                        Batal
                                    </Button>
                                    <Button type="submit" ikon={Save}>
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        ) : null}

                        {tab === 'keamanan' ? (
                            <form onSubmit={gantiSandi} className="space-y-3.5 p-5">
                                <div className="rounded-2xl bg-success-50 p-3.5">
                                    <p className="inline-flex items-center gap-2 text-[12px] font-bold text-success-700">
                                        <ShieldCheck className="size-4" />
                                        Akun terverifikasi
                                    </p>
                                    <p className="mt-1 text-[11px] text-success-700/80">
                                        Dokumen KTP dan kendaraan sudah diverifikasi admin.
                                    </p>
                                </div>

                                <Input
                                    label="Kata sandi sekarang"
                                    wajib
                                    ikon={KeyRound}
                                    type="password"
                                    galat={galat.sandi_sekarang}
                                    value={sandi.sekarang}
                                    onChange={(e) =>
                                        setSandi((s) => ({ ...s, sekarang: e.target.value }))
                                    }
                                />
                                <Input
                                    label="Kata sandi baru"
                                    wajib
                                    ikon={Lock}
                                    type="password"
                                    petunjuk="Minimal 8 karakter."
                                    value={sandi.baru}
                                    onChange={(e) => setSandi((s) => ({ ...s, baru: e.target.value }))}
                                    galat={galat.sandi_baru}
                                />
                                <Input
                                    label="Konfirmasi kata sandi baru"
                                    wajib
                                    ikon={Lock}
                                    type="password"
                                    value={sandi.konfirmasi}
                                    onChange={(e) =>
                                        setSandi((s) => ({ ...s, konfirmasi: e.target.value }))
                                    }
                                    galat={galat.sandi_konfirmasi}
                                />

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5">
                                    <Button varian="garis" type="button">
                                        Batal
                                    </Button>
                                    <Button type="submit" ikon={Save}>
                                        Perbarui
                                    </Button>
                                </div>
                            </form>
                        ) : null}
                    </Card>

                    <Card className="mt-4 p-5">
                        <p className="text-[12px] font-extrabold text-navy-900">Data lokal ku</p>
                        <p className="mt-1 text-[11px] text-navy-400">
                            Kembalikan seluruh perubahan lokal ke awal (keranjang, pesanan, pengiriman).
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                varian="garis"
                                ukuran="sm"
                                ikon={RotateCcw}
                                onClick={() => {
                                    bersihkanDemo();
                                    tambahToast('Data lokal dikembalikan ke awal.', 'sukses');
                                }}
                            >
                                Reset data demo
                            </Button>
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-navy-300">
                                <Star className="size-3" />
                                {kurir.total_pengiriman ?? 0} pengiriman tercatat
                            </span>
                        </div>
                    </Card>

                    <Card className="mt-4 border-danger-200 p-5">
                        <p className="text-[12px] font-extrabold text-danger-600">Keluar dari akun</p>
                        <p className="mt-1 text-[11px] text-navy-400">
                            Mengakhiri sesi di perangkat ini. Kamu harus masuk kembali untuk membuka dashboard kurir.
                        </p>
                        <Button
                            className="mt-3"
                            varian="bahaya"
                            ukuran="sm"
                            ikon={LogOut}
                            onClick={() => {
                                if (window.confirm('Keluar dari akun?')) keluar();
                            }}
                        >
                            Keluar
                        </Button>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
