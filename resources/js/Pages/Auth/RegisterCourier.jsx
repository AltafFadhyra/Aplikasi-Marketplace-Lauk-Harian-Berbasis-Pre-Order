import { Head, Link, router, useForm } from '@inertiajs/react';
import { Bike, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import { Input, Select } from '../../Components/ui/Form';
import { ImageUploader } from '../../Components/ui/ImageUploader';
import GuestLayout from '../../Layouts/GuestLayout';
import { JENIS_KENDARAAN, JENIS_SERTIFIKAT, ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

export default function RegisterCourier() {
    const { daftar, tambahToast } = useDemo();

    const { data, setData, processing } = useForm({
        nama: '',
        email: '',
        telepon: '',
        kendaraan: '',
        plat: '',
        nik: '',
        password: '',
        konfirmasi: '',
        setuju: false,
    });

    const [berkas, setBerkas] = useState({ ktp: null, sim: null });
    const [galat, setGalat] = useState({});

    function kirimForm(e) {
        e.preventDefault();
        const g = {};

        if (data.nama.trim().length < 3) g.nama = 'Nama minimal 3 karakter.';
        if (!/^\S+@\S+\.\S+$/.test(data.email)) g.email = 'Format email tidak valid.';
        if (!data.kendaraan) g.kendaraan = 'Pilih jenis kendaraan.';
        if (data.plat && !/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/i.test(data.plat))
            g.plat = 'Format plat tidak valid, contoh: D 1234 ABC.';
        if (data.nik && !/^\d{16}$/.test(data.nik)) g.nik = 'NIK harus 16 digit.';
        if (data.password.length < 8) g.password = 'Password minimal 8 karakter.';
        if (data.password !== data.konfirmasi) g.konfirmasi = 'Konfirmasi tidak sama.';
        if (!berkas.ktp) g.ktp = 'Foto KTP wajib diunggah.';
        if (!berkas.sim) g.sim = 'Foto SIM wajib diunggah.';
        if (!data.setuju) g.setuju = 'Kamu harus menyetujui kebijakan privasi.';

        setGalat(g);
        if (Object.keys(g).length) return;

        const hasil = daftar({
            nama: data.nama,
            email: data.email,
            telepon: data.telepon,
            peran: ROLES.KURIR,
            password: data.password,
            pengajuan: {
                vehicle_type: data.kendaraan,
                vehicle_plate: data.plat || '-',
                nik: data.nik || '-',
            },
        });

        if (!hasil.ok) {
            setGalat({ email: hasil.pesan });
            tambahToast(hasil.pesan, 'bahaya', 'Pendaftaran gagal');
            return;
        }

        tambahToast('Pendaftaran kurir terkirim. Menunggu verifikasi admin.', 'sukses');
        router.visit('/courier');
    }

    return (
        <GuestLayout
            judul="Daftar sebagai kurir"
            deskripsi="Kirim makanan lokal dengan rating transparan dan aturan yang jelas."
            eyebrow="Mitra pengiriman"
        >
            <Head title="Daftar Kurir" />

            <form onSubmit={kirimForm} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Nama lengkap"
                        ikon={User}
                        value={data.nama}
                        onChange={(e) => setData('nama', e.target.value)}
                        galat={galat.nama}
                        wajib
                    />
                    <Input
                        label="Email"
                        ikon={Mail}
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        galat={galat.email}
                        wajib
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Nomor telepon"
                        ikon={Phone}
                        value={data.telepon}
                        onChange={(e) => setData('telepon', e.target.value)}
                        petunjuk="Dipakai pembeli saat kurir di jalan."
                    />
                    <Input
                        label="NIK"
                        ikon={ShieldCheck}
                        value={data.nik}
                        onChange={(e) => setData('nik', e.target.value)}
                        galat={galat.nik}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Jenis kendaraan"
                        ikon={Bike}
                        value={data.kendaraan}
                        onChange={(e) => setData('kendaraan', e.target.value)}
                        galat={galat.kendaraan}
                        wajib
                    >
                        <option value="">Pilih kendaraan</option>
                        {JENIS_KENDARAAN.map((k) => (
                            <option key={k} value={k}>
                                {k}
                            </option>
                        ))}
                    </Select>
                    <Input
                        label="Nomor plat"
                        ikon={Bike}
                        value={data.plat}
                        onChange={(e) => setData('plat', e.target.value.toUpperCase())}
                        galat={galat.plat}
                        petunjuk="Contoh: D 1234 ABC"
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <ImageUploader
                        label="Foto KTP"
                        keterangan="JPG/PNG, maksimal 2 MB."
                        berkas={berkas.ktp}
                        onUbah={(f) => setBerkas((b) => ({ ...b, ktp: f }))}
                        galat={galat.ktp}
                        wajib
                    />
                    <ImageUploader
                        label="Foto SIM"
                        keterangan="Wajib berlaku dan tidak blur."
                        berkas={berkas.sim}
                        onUbah={(f) => setBerkas((b) => ({ ...b, sim: f }))}
                        galat={galat.sim}
                        wajib
                    />
                </div>

                <ul className="space-y-1.5 rounded-2xl bg-slate-50 p-4 text-[11px] text-navy-500">
                    {JENIS_SERTIFIKAT.map((s) => (
                        <li key={s} className="flex gap-2">
                            <ShieldCheck className="mt-0.5 size-3 shrink-0 text-navy-300" />
                            {s}
                        </li>
                    ))}
                </ul>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Password"
                        ikon={User}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        galat={galat.password}
                        wajib
                    />
                    <Input
                        label="Konfirmasi password"
                        ikon={User}
                        type="password"
                        value={data.konfirmasi}
                        onChange={(e) => setData('konfirmasi', e.target.value)}
                        galat={galat.konfirmasi}
                        wajib
                    />
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 text-[12px] text-navy-500">
                    <input
                        type="checkbox"
                        checked={data.setuju}
                        onChange={(e) => setData('setuju', e.target.checked)}
                        className="mt-0.5 size-4 rounded-md border-slate-300 accent-powder-500"
                    />
                    <span>
                        Saya menyetujui{' '}
                        <Link href="/kebijakan-privasi" className="font-bold text-powder-600">
                            Kebijakan Privasi
                        </Link>{' '}
                        Preorderly.
                    </span>
                </label>
                {galat.setuju ? <p className="text-[11px] font-bold text-danger-600">{galat.setuju}</p> : null}

                <Button type="submit" ukuran="lg" className="w-full" disabled={processing}>
                    Kirim pendaftaran
                </Button>
            </form>
        </GuestLayout>
    );
}
