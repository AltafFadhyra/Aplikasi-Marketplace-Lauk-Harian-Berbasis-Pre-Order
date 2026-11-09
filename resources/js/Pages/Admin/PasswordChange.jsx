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
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

export default function PasswordChange() {
    const { penggunaAktif, tambahToast, keluar } = useDemo();
    const pengguna = penggunaAktif ?? null;

    if (!pengguna) {
        return (
            <DashboardLayout judul="Ganti Password" peran={ROLES.ADMIN}>
                <Head title="Ganti Password" />
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

    const [form, setForm] = useState({
        passwordLama: '',
        passwordBaru: '',
        passwordKonfirmasi: '',
    });
    const [galat, setGalat] = useState({});

    function ubah(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    function simpanKunci(e) {
        e.preventDefault();

        if (form.passwordLama.trim().length < 6) {
            setGalat({ passwordLama: 'Password minimal 6 karakter.' });
            return;
        }

        if (form.passwordBaru !== form.passwordKonfirmasi) {
            setGalat({ passwordKonfirmasi: 'Password baru tidak cocok.' });
            return;
        }

        if (form.passwordBaru.trim().length < 8) {
            setGalat({ passwordBaru: 'Password baru minimal 8 karakter.' });
            return;
        }

        setGalat({});
        tambahToast('Password admin berhasil diubah.', 'sukses');
    }

    return (
        <DashboardLayout judul="Ganti Password" peran={ROLES.ADMIN}>
            <Head title="Ganti Password" />

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
                        value={form.passwordLama}
                        onChange={ubah('passwordLama')}
                        galat={galat.passwordLama}
                        petunjuk="Masukkan password saat ini Anda."
                        wajib
                    />
                    <Input
                        label="Password baru"
                        ikon={Lock}
                        type="password"
                        value={form.passwordBaru}
                        onChange={ubah('passwordBaru')}
                        galat={galat.passwordBaru}
                        petunjuk="Minimal 8 karakter, kombinasi huruf dan angka."
                        wajib
                    />
                    <Input
                        label="Konfirmasi password baru"
                        ikon={Lock}
                        type="password"
                        value={form.passwordKonfirmasi}
                        onChange={ubah('passwordKonfirmasi')}
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
        </DashboardLayout>
    );
}