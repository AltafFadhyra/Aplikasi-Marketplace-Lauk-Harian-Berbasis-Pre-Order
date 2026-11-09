import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, Store, User } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import { Input, Select } from '../../Components/ui/Form';
import GuestLayout from '../../Layouts/GuestLayout';
import { JENIS_USAHA, ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

export default function RegisterSeller() {
    const { daftar, tambahToast } = useDemo();

    const { data, setData, processing } = useForm({
        nama: '',
        email: '',
        telepon: '',
        nama_toko: '',
        jenis_usaha: '',
        nib: '',
        alamat: '',
        password: '',
        konfirmasi: '',
        setuju: false,
    });

    const [galat, setGalat] = useState({});

    function kirimForm(e) {
        e.preventDefault();
        const g = {};

        if (data.nama.trim().length < 3) g.nama = 'Nama pemilik minimal 3 karakter.';
        if (!/^\S+@\S+\.\S+$/.test(data.email)) g.email = 'Format email tidak valid.';
        if (data.nama_toko.trim().length < 3) g.nama_toko = 'Nama toko minimal 3 karakter.';
        if (!data.jenis_usaha) g.jenis_usaha = 'Pilih jenis usaha.';
        if (data.nib && !/^\d{6,20}$/.test(data.nib)) g.nib = 'NIB/NPWP hanya angka, 6-20 digit.';
        if (data.password.length < 8) g.password = 'Password minimal 8 karakter.';
        if (data.password !== data.konfirmasi) g.konfirmasi = 'Konfirmasi tidak sama.';
        if (!data.setuju) g.setuju = 'Kamu harus menyetujui kebijakan privasi.';

        setGalat(g);
        if (Object.keys(g).length) return;

        const hasil = daftar({
            nama: data.nama,
            email: data.email,
            telepon: data.telepon,
            peran: ROLES.PENJUAL,
            password: data.password,
            pengajuan: {
                store_name: data.nama_toko,
                business_type: data.jenis_usaha,
                nik: data.nib || '-',
                address: data.alamat || '-',
            },
        });

        if (!hasil.ok) {
            setGalat({ email: hasil.pesan });
            tambahToast(hasil.pesan, 'bahaya', 'Pendaftaran gagal');
            return;
        }

        tambahToast('Pendaftaran penjual terkirim. Menunggu verifikasi admin.', 'sukses');
        router.visit('/seller');
    }

    return (
        <GuestLayout
            judul="Daftar sebagai penjual"
            deskripsi="Tawarkan dapur atau restoranmu ke ribuan pembeli di Preorderly."
            eyebrow="Mitra dagang"
        >
            <Head title="Daftar Penjual" />

            <form onSubmit={kirimForm} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Nama pemilik"
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

                <Input
                    label="Nomor telepon"
                    ikon={Phone}
                    value={data.telepon}
                    onChange={(e) => setData('telepon', e.target.value)}
                    petunjuk="Nomor yang bisa dihubungi admin saat verifikasi."
                />

                <Input
                    label="Nama toko"
                    ikon={Store}
                    value={data.nama_toko}
                    onChange={(e) => setData('nama_toko', e.target.value)}
                    galat={galat.nama_toko}
                    wajib
                />

                <Select
                    label="Jenis usaha"
                    value={data.jenis_usaha}
                    onChange={(e) => setData('jenis_usaha', e.target.value)}
                    galat={galat.jenis_usaha}
                    wajib
                >
                    <option value="">Pilih jenis usaha</option>
                    {JENIS_USAHA.map((j) => (
                        <option key={j} value={j}>
                            {j}
                        </option>
                    ))}
                </Select>

                <Input
                    label="NIB / NPWP"
                    ikon={Store}
                    value={data.nib}
                    onChange={(e) => setData('nib', e.target.value)}
                    galat={galat.nib}
                    petunjuk="Nomor usaha. Disimpan terenkripsi dan hanya dilihat admin."
                />

                <Input
                    label="Alamat operasional"
                    ikon={MapPin}
                    value={data.alamat}
                    onChange={(e) => setData('alamat', e.target.value)}
                    petunjuk="Dipakai untuk menghitung ongkir dan jarak pembeli."
                />

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
                        dan kewajiban sebagai mitra Preorderly.
                    </span>
                </label>
                {galat.setuju ? <p className="text-[11px] font-bold text-danger-600">{galat.setuju}</p> : null}

                <Button type="submit" ukuran="lg" className="w-full" disabled={processing}>
                    Kirim pendaftaran
                </Button>
            </form>

            <Link
                href="/auth/register"
                className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-400 hover:text-powder-600"
            >
                <ArrowLeft className="size-3.5" />
                Kembali ke pendaftaran pembeli
            </Link>
        </GuestLayout>
    );
}
