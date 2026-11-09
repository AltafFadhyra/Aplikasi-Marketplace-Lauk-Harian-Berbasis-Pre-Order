import { Head, Link, router, useForm } from '@inertiajs/react';
import { Mail, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Form';
import GuestLayout from '../../Layouts/GuestLayout';
import { ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

export default function Register() {
    const { daftar, tambahToast } = useDemo();

    const { data, setData, processing } = useForm({
        nama: '',
        email: '',
        telepon: '',
        nik: '',
        password: '',
        konfirmasi: '',
        setuju: false,
    });

    const [galat, setGalat] = useState({});

    function kirimForm(e) {
        e.preventDefault();
        const g = {};

        if (data.nama.trim().length < 3) g.nama = 'Nama minimal 3 karakter.';
        if (!/^\S+@\S+\.\S+$/.test(data.email)) g.email = 'Format email tidak valid.';
        if (data.telepon && !/^[0-9+\-\s()]{8,20}$/.test(data.telepon))
            g.telepon = 'Nomor telepon tidak valid.';
        if (data.nik && !/^\d{16}$/.test(data.nik)) g.nik = 'NIK harus 16 digit.';
        if (data.password.length < 8) g.password = 'Password minimal 8 karakter.';
        if (data.password !== data.konfirmasi) g.konfirmasi = 'Konfirmasi tidak sama.';
        if (!data.setuju) g.setuju = 'Kamu harus menyetujui kebijakan privasi.';

        setGalat(g);
        if (Object.keys(g).length) return;

        const hasil = daftar({
            nama: data.nama,
            email: data.email,
            telepon: data.telepon,
            peran: ROLES.PEMBELI,
            password: data.password,
        });

        if (!hasil.ok) {
            setGalat({ email: hasil.pesan });
            tambahToast(hasil.pesan, 'bahaya', 'Pendaftaran gagal');
            return;
        }

        tambahToast('Pendaftaran berhasil. Kamu sudah masuk sebagai pembeli.', 'sukses');
        router.visit('/');
    }

    return (
        <GuestLayout
            judul="Daftar sebagai pembeli"
            deskripsi="Buat akun untuk memesan makanan pre-order dari dapur terdekat."
            eyebrow="Akun pembeli"
        >
            <Head title="Daftar" />

            <form onSubmit={kirimForm} className="space-y-4">
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
                <Input
                    label="Nomor telepon"
                    ikon={ShieldCheck}
                    value={data.telepon}
                    onChange={(e) => setData('telepon', e.target.value)}
                    galat={galat.telepon}
                    petunjuk="Dipakai kurir saat pengiriman."
                />
                <Input
                    label="NIK"
                    ikon={ShieldCheck}
                    value={data.nik}
                    onChange={(e) => setData('nik', e.target.value)}
                    galat={galat.nik}
                    petunjuk="16 digit, disimpan terenkripsi dan hanya ditampilkan tersensor."
                />
                <Input
                    label="Password"
                    ikon={ShieldCheck}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    galat={galat.password}
                    wajib
                />
                <Input
                    label="Konfirmasi password"
                    ikon={ShieldCheck}
                    type="password"
                    value={data.konfirmasi}
                    onChange={(e) => setData('konfirmasi', e.target.value)}
                    galat={galat.konfirmasi}
                    wajib
                />

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
                    Daftar
                </Button>
            </form>

            <p className="mt-5 text-center text-[12px] text-navy-400">
                Sudah punya akun?{' '}
                <Link href="/auth/login" className="font-bold text-powder-600 hover:underline">
                    Masuk
                </Link>
            </p>

            <div className="mt-5 border-t border-slate-200 pt-4 text-center text-[12px] text-navy-400">
                Daftar sebagai{' '}
                <Link href="/auth/daftar-penjual" className="font-bold text-powder-600 hover:underline">
                    penjual
                </Link>{' '}
                atau{' '}
                <Link href="/auth/daftar-kurir" className="font-bold text-powder-600 hover:underline">
                    kurir
                </Link>
            </div>
        </GuestLayout>
    );
}
