import { Head, Link } from '@inertiajs/react';
import {
    User,
    LogOut,
    ShieldCheck,
    Check,
    Mail,
    Phone,
    KeyRound,
    Edit,
    Save,
    X,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Form';
import { Tabs } from '../../Components/ui/Tabs';
import { Avatar } from '../../Components/ui/Avatar';
import { InfoRow, PageHeader } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, LABEL_ROLE } from '../../lib/constants';
import { rupiah, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function Profile() {
    const { penggunaAktif, seed, tambahToast, bersihkanDemo, keluar } = useDemo();
    const pengguna = penggunaAktif ?? null;

    if (!pengguna) {
        return (
            <DashboardLayout judul="Profil Admin" peran={ROLES.ADMIN}>
                <Head title="Profil Admin" />
                <Kosong
                    ikon={User}
                    judul="Sesi Kedaluwarsa"
                    deskripsi="Anda telah logout. Silakan login kembali ke akun admin."
                    aksi={
                        <Button as={Link} href="/auth/login">Masuk Kembali</Button>
                    }
                    className="rounded-3xl border border-slate-200 bg-white py-10"
                />
            </DashboardLayout>
        );
    }

    const [tab, setTab] = useState('profil');
    const [form, setForm] = useState({
        nama: pengguna.nama ?? '',
        email: pengguna.email ?? '',
        telepon: pengguna.telepon ?? '',
        alamat: pengguna.alamat ?? '',
    });
    const [galat, setGalat] = useState({});

    const ulasanAdmin = (seed.ulasan ?? []).length;

    function ubah(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    function simpanProfil(e) {
        e.preventDefault();

        if (!form.nama.trim()) {
            setGalat({ nama: 'Nama wajib diisi.' });
            return;
        }

        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
            setGalat({ email: 'Email tidak valid.' });
            return;
        }

        setGalat({});
        tambahToast('Profil admin diperbarui.', 'sukses');
    }

    return (
        <DashboardLayout judul="Profil Admin" peran={ROLES.ADMIN}>
            <Head title="Profil Admin" />

            <PageHeader
                judul="Profil Admin"
                deskripsi="Kelola data diri dan keamanan akun administrator."
                ikon={User}
            />

            <Card elevate className="mb-5">
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <Avatar
                            nama={pengguna.nama}
                            gambar={pengguna.avatar}
                            ukuran="xl"
                            badge={<ShieldCheck className="size-3.5 text-success-500" />}
                        />

                        <div className="flex-1">
                            <h2 className="truncate text-lg font-extrabold text-navy-900">
                                {pengguna.nama}
                            </h2>
                            <p className="truncate text-[12px] text-navy-400">{pengguna.email}</p>

                            <div className="mt-2 flex items-center gap-2">
                                <Badge tone="powder">{LABEL_ROLE[pengguna.peran]}</Badge>
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
                    </div>
                </div>
            </Card>

            <Tabs
                tabs={[
                    { key: 'profil', label: 'Data Diri' },
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
                            galat={galat.email}
                        />
                        <Input
                            label="Nomor telepon"
                            ikon={Phone}
                            value={form.telepon}
                            onChange={ubah('telepon')}
                            galat={galat.telepon}
                            petunjuk="Dipakai untuk kontak tim admin."
                        />

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                            <Button type="submit" ikon={Save}>
                                Simpan perubahan
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : null}

            {tab === 'keamanan' ? (
                <Card elevate className="p-5">
                    <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900">
                        <KeyRound className="size-4 text-powder-500" />
                        Ganti password
                    </h3>

                    <form onSubmit={simpanKunci} className="mt-4 space-y-4">
                        <Input
                            label="Password saat ini"
                            ikon={Lock}
                            type="password"
                            value={form.passwordLama ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, passwordLama: e.target.value }))}
                            galat={galat.passwordLama}
                            wajib
                        />
                        <Input
                            label="Password baru"
                            ikon={Lock}
                            type="password"
                            value={form.passwordBaru ?? ''}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, passwordBaru: e.target.value }))
                            }
                            galat={galat.passwordBaru}
                            petunjuk="Minimal 8 karakter, kombinasi huruf dan angka."
                            wajib
                        />
                        <Input
                            label="Konfirmasi password baru"
                            ikon={Lock}
                            type="password"
                            value={form.passwordKonfirmasi ?? ''}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, passwordKonfirmasi: e.target.value }))
                            }
                            galat={galat.passwordKonfirmasi}
                            wajib
                        />

                        <div className="flex justify-end border-t border-slate-100 pt-4">
                            <Button type="submit" ikon={KeyRound}>
                                Perbarui password
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : null}
        </DashboardLayout>
    );
}