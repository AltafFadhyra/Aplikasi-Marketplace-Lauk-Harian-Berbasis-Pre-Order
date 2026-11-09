import { Head } from '@inertiajs/react';
import {
    KeyRound,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
    Save,
    ShieldCheck,
    Smartphone,
    User,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Form';
import { Tabs } from '../../Components/ui/Tabs';
import { Avatar } from '../../Components/ui/Avatar';
import { InfoRow, PageHeader } from '../../Components/ui/Misc';
import AppLayout from '../../Layouts/AppLayout';
import { LABEL_ROLE, ROLES } from '../../lib/constants';
import { sensorNik } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function Profile() {
    const { penggunaAktif, akun, peran, seed, tambahToast, bersihkanDemo, keluar, simpanProfil: simpanKeAkun, gantiKunci } =
        useDemo();
    const pengguna = penggunaAktif ?? akun.pembeli;

    const daftarPesanan = pengguna.id != null ? (seed.pesanan ?? []).filter((p) => String(p.pembeli_id) === String(pengguna.id)) : [];
    const pesan = daftarPesanan.length;

    const [tab, setTab] = useState('profil');
    const [form, setForm] = useState({
        nama: pengguna.nama ?? '',
        telepon: pengguna.telepon ?? '',
        email: pengguna.email ?? '',
        alamat: pengguna.alamat ?? '',
    });
    const [sandi, setSandi] = useState({ sekarang: '', baru: '', konfirmasi: '' });
    const [galat, setGalat] = useState({});

    const ulasanSaya = (seed.ulasan ?? []).length;

    function ubah(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    function simpanProfil(e) {
        e.preventDefault();

        if (!form.nama.trim()) {
            setGalat({ nama: 'Nama wajib diisi.' });
            return;
        }

        if (form.telepon && !/^[0-9+\-\s()]{8,20}$/.test(form.telepon)) {
            setGalat({ telepon: 'Nomor telepon tidak valid.' });
            return;
        }

        setGalat({});
        simpanKeAkun({
            nama: form.nama.trim(),
            telepon: form.telepon,
            alamat: form.alamat,
        });
        tambahToast('Profil kamu diperbarui.', 'sukses');
    }

    function simpanSandi(e) {
        e.preventDefault();

        if (!sandi.sekarang) {
            setGalat({ sekarang: 'Masukkan password saat ini.' });
            return;
        }

        if (sandi.baru.length < 8) {
            setGalat({ baru: 'Password baru minimal 8 karakter.' });
            return;
        }

        if (sandi.baru !== sandi.konfirmasi) {
            setGalat({ konfirmasi: 'Konfirmasi password tidak sama.' });
            return;
        }

        const hasil = gantiKunci(sandi.baru, sandi.sekarang);

        if (!hasil.ok) {
            setGalat({ sekarang: hasil.pesan });
            return;
        }

        setGalat({});
        setSandi({ sekarang: '', baru: '', konfirmasi: '' });
        tambahToast('Password berhasil diganti.', 'sukses');
    }

    return (
        <AppLayout>
            <Head title="Profil Saya" />

            <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-7">
                <PageHeader judul="Profil Saya" deskripsi="Kelola data diri, alamat, dan keamanan akun." ikon={User} />

                <Card elevate className="mb-5 p-5">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                        <Avatar
                            nama={pengguna.nama}
                            gambar={pengguna.avatar}
                            ukuran="xl"
                            badge={<ShieldCheck className="size-3.5 text-success-500" />}
                        />

                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <h2 className="truncate text-lg font-extrabold text-navy-900">
                                {pengguna.nama}
                            </h2>
                            <p className="truncate text-[12px] text-navy-400">{pengguna.email}</p>

                            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                                <Badge tone="powder">{LABEL_ROLE[peran ?? ROLES.PEMBELI]}</Badge>
                                {pengguna.status_verifikasi === 'terverifikasi' ? (
                                    <Badge tone="sukses" ikon={ShieldCheck}>
                                        Terverifikasi
                                    </Badge>
                                ) : (
                                    <Badge tone="peringatan" ikon={ShieldCheck}>
                                        Belum verifikasi
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <dl className="grid grid-cols-3 gap-2 sm:w-64">
                            {[
                                { l: 'Pesanan', v: pesan ?? 0 },
                                { l: 'Ulasan', v: ulasanSaya },
                                { l: 'Role', v: LABEL_ROLE[peran]?.split(' ')[0] ?? '-' },
                            ].map((s) => (
                                <div
                                    key={s.l}
                                    className="rounded-2xl bg-slate-50 px-2 py-2.5 text-center"
                                >
                                    <dt className="text-[10px] font-bold text-navy-400">{s.l}</dt>
                                    <dd className="mt-0.5 text-[15px] font-extrabold text-navy-900">{s.v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </Card>

                <Tabs
                    tabs={[
                        { key: 'profil', label: 'Data Diri' },
                        { key: 'alamat', label: 'Alamat' },
                        { key: 'keamanan', label: 'Keamanan' },
                    ]}
                    aktif={tab}
                    onGanti={setTab}
                    className="mb-4"
                />

                {tab === 'profil' ? (
                    <Card elevate className="p-5">
                        <form onSubmit={simpanProfil} className="space-y-4">
                            <Input
                                label="Nama lengkap"
                                ikon={User}
                                value={form.nama}
                                onChange={ubah('nama')}
                                galat={galat.nama}
                                wajib
                            />
                            <Input
                                label="Email"
                                ikon={Mail}
                                type="email"
                                value={form.email}
                                onChange={ubah('email')}
                                petunjuk="Email tidak bisa diubah."
                                disabled
                            />
                            <Input
                                label="Nomor telepon"
                                ikon={Phone}
                                value={form.telepon}
                                onChange={ubah('telepon')}
                                galat={galat.telepon}
                                petunjuk="Dipakai kurir untuk menghubungi saat pengiriman."
                            />

                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                                <Button type="submit" ikon={Save}>
                                    Simpan perubahan
                                </Button>
                            </div>
                        </form>
                    </Card>
                ) : null}

                {tab === 'alamat' ? (
                    <Card elevate className="p-5">
                        <h3 className="text-[15px] font-extrabold text-navy-900">Alamat pengiriman</h3>
                        <p className="mt-1 text-[12px] text-navy-400">
                            Alamat ini dipakai untuk menghitung ongkir dan titik terima kurir.
                        </p>

                        <div className="mt-4">
                            <Input
                                label="Alamat lengkap"
                                ikon={MapPin}
                                value={form.alamat}
                                onChange={ubah('alamat')}
                                petunjuk="Sertakan patokan agar kurir mudah menemukan lokasi."
                            />
                        </div>

                        <dl className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4">
                            <InfoRow label="Patokan" nilai={pengguna.patokan ?? '-'} ikon={MapPin} />
                            <InfoRow
                                label="Koordinat"
                                nilai={
                                    pengguna.latitude && pengguna.longitude
                                        ? `${Number(pengguna.latitude).toFixed(5)}, ${Number(pengguna.longitude).toFixed(5)}`
                                        : 'Belum diatur'
                                }
                            />
                            <InfoRow
                                label="Ongkir ke restoran terdekat"
                                nilai="Dihitung otomatis: Rp5.000 + Rp2.500/km"
                            />
                        </dl>

                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={() => {
                                    simpanKeAkun({ alamat: form.alamat });
                                    tambahToast('Alamat pengantaran disimpan.', 'sukses');
                                }}
                                ikon={Save}
                            >
                                Simpan alamat
                            </Button>
                        </div>
                    </Card>
                ) : null}

                {tab === 'keamanan' ? (
                    <div className="space-y-4">
                        <Card elevate className="p-5">
                            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900">
                                <KeyRound className="size-4 text-powder-500" />
                                Ganti password
                            </h3>

                            <form onSubmit={simpanSandi} className="mt-4 space-y-4">
                                <Input
                                    label="Password saat ini"
                                    ikon={Lock}
                                    type="password"
                                    value={sandi.sekarang}
                                    onChange={(e) => setSandi((s) => ({ ...s, sekarang: e.target.value }))}
                                    galat={galat.sekarang}
                                    wajib
                                />
                                <Input
                                    label="Password baru"
                                    ikon={Lock}
                                    type="password"
                                    value={sandi.baru}
                                    onChange={(e) => setSandi((s) => ({ ...s, baru: e.target.value }))}
                                    galat={galat.baru}
                                    petunjuk="Minimal 8 karakter, kombinasi huruf dan angka."
                                    wajib
                                />
                                <Input
                                    label="Konfirmasi password baru"
                                    ikon={Lock}
                                    type="password"
                                    value={sandi.konfirmasi}
                                    onChange={(e) => setSandi((s) => ({ ...s, konfirmasi: e.target.value }))}
                                    galat={galat.konfirmasi}
                                    wajib
                                />

                                <div className="flex justify-end border-t border-slate-100 pt-4">
                                    <Button type="submit" ikon={KeyRound}>
                                        Perbarui password
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        <Card className="p-5">
                            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900">
                                <Smartphone className="size-4 text-powder-500" />
                                Verifikasi dua langkah
                            </h3>
                            <p className="mt-1 text-[12px] text-navy-500">
                                Kode OTP dikirim ke nomor {form.telepon || pengguna.telepon || 'kamu'}. Kode demo
                                selalu <span className="font-extrabold">123456</span>.
                            </p>
                            <div className="mt-3">
                                <Badge tone="sukses" ikon={ShieldCheck}>
                                    Aktif
                                </Badge>
                            </div>
                        </Card>

                        <Card className="border-danger-200 p-5">
                            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-danger-600">
                                <RotateCcw className="size-4" />
                                Reset data demo
                            </h3>
                            <p className="mt-1 text-[12px] text-navy-500">
                                Menghapus seluruh perubahan lokal: keranjang, status pesanan, slot, notifikasi, dan
                                ulasan yang kamu buat.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Button
                                    varian="bahaya"
                                    ukuran="sm"
                                    onClick={() => {
                                        if (window.confirm('Reset semua data demo? Tindakan ini tidak bisa dibatalkan.')) {
                                            bersihkanDemo();
                                        }
                                    }}
                                >
                                    Reset sekarang
                                </Button>
                                <span className="text-[10px] text-navy-300">
                                    NIK ditampilkan tersensor: {sensorNik('3201234567890001')}
                                </span>
                            </div>
                        </Card>

                        <Card className="border-danger-200 p-5">
                            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-danger-600">
                                <LogOut className="size-4" />
                                Keluar dari akun
                            </h3>
                            <p className="mt-1 text-[12px] text-navy-500">
                                Mengakhiri sesi di perangkat ini. Kamu harus masuk kembali untuk membuka halaman
                                pembeli.
                            </p>
                            <Button
                                className="mt-3"
                                varian="bahaya"
                                ukuran="sm"
                                onClick={() => {
                                    if (window.confirm('Keluar dari akun?')) keluar();
                                }}
                            >
                                Keluar
                            </Button>
                        </Card>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
