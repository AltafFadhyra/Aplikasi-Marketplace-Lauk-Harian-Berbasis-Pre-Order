import { Head, Link, useForm, router } from '@inertiajs/react';
import { AlertCircle, Eye, Mail, ShieldCheck, User } from 'lucide-react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Form';
import GuestLayout from '../../Layouts/GuestLayout';
import { DASHBOARD_ROLE, ROLES } from '../../lib/constants';
import { useDemo } from '../../stores/DemoContext';

const AKUN_DEMO = [
    { peran: ROLES.PEMBELI, email: 'buyer@preorderly.id', label: 'Pembeli' },
    { peran: ROLES.PENJUAL, email: 'penjual1@preorderly.id', label: 'Penjual' },
    { peran: ROLES.KURIR, email: 'courier@preorderly.id', label: 'Kurir' },
    { peran: ROLES.ADMIN, email: 'admin@preorderly.id', label: 'Admin' },
];

export default function Login() {
    const { masuk, tambahToast } = useDemo();

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        ingat: true,
    });

    function masukForm(e) {
        e.preventDefault();

        if (!data.email || !data.password) {
            tambahToast('Email dan password wajib diisi.', 'bahaya');
            return;
        }

        const hasil = masuk(data.email, data.password);

        if (!hasil.ok) {
            tambahToast(hasil.pesan, 'bahaya', 'Gagal masuk');
            return;
        }

        tambahToast('Berhasil masuk. Selamat datang kembali!', 'sukses');
        router.visit(DASHBOARD_ROLE[hasil.peran] ?? '/');
    }

    return (
        <GuestLayout judul="Masuk ke akun kamu" deskripsi="Lanjutkan pesanan dan kelola aktivitasmu di Preorderly.">
            <Head title="Masuk" />

            <form onSubmit={masukForm} className="space-y-4">
                <Input
                    label="Email"
                    ikon={Mail}
                    type="email"
                    placeholder="nama@email.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    galat={errors.email}
                    wajib
                />

                <Input
                    label="Password"
                    ikon={Eye}
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    galat={errors.password}
                    wajib
                />

                <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-navy-500">
                        <input
                            type="checkbox"
                            checked={data.ingat}
                            onChange={(e) => setData('ingat', e.target.checked)}
                            className="size-4 rounded-md border-slate-300 accent-powder-500"
                        />
                        Ingat saya
                    </label>

                    <Link
                        href="/auth/lupa-password"
                        className="text-[12px] font-bold text-powder-600 hover:underline"
                    >
                        Lupa password?
                    </Link>
                </div>

                <Button type="submit" ukuran="lg" className="w-full" disabled={processing}>
                    Masuk
                </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-butter-200 bg-butter-50/60 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-butter-800">
                    <ShieldCheck className="size-3.5" />
                    Akun demo siap pakai
                </p>
                <p className="mt-1 text-[11px] text-navy-500">
                    Password semua akun demo: <span className="font-bold">password</span>. Klik salah satu untuk isi
                    otomatis.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    {AKUN_DEMO.map((a) => (
                        <button
                            key={a.email}
                            type="button"
                            onClick={() => setData({ ...data, email: a.email, password: 'password' })}
                            className="rounded-xl bg-white px-2.5 py-2 text-left text-[11px] font-bold text-navy-700 shadow-sm transition hover:bg-powder-50"
                        >
                            <span className="block text-powder-600">{a.label}</span>
                            <span className="block truncate text-[10px] font-medium text-navy-400">
                                {a.email}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <p className="mt-5 text-center text-[12px] text-navy-400">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="font-bold text-powder-600 hover:underline">
                    Daftar
                </Link>
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
                <Badge tone="sukses" ikon={AlertCircle}>
                    {AKUN_DEMO.length} akun demo termuat
                </Badge>
            </div>
        </GuestLayout>
    );
}
