import { Head, Link, router } from '@inertiajs/react';
import { Check, KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Form';
import GuestLayout from '../../Layouts/GuestLayout';
import { useDemo } from '../../stores/DemoContext';

const ATURAN = [
    'Panjang minimal 8 karakter.',
    'Kombinasikan huruf besar, huruf kecil, dan angka.',
    'Jangan gunakan password yang sama dengan email kamu.',
];

export default function ResetPassword() {
    const { tambahToast } = useDemo();

    const [sandi, setSandi] = useState({ baru: '', konfirmasi: '' });
    const [galat, setGalat] = useState({});

    const kekuatan = (() => {
        let n = 0;
        if (sandi.baru.length >= 8) n += 1;
        if (/[a-z]/.test(sandi.baru) && /[A-Z]/.test(sandi.baru)) n += 1;
        if (/\d/.test(sandi.baru)) n += 1;
        if (/[^\w\s]/.test(sandi.baru)) n += 1;
        return n;
    })();

    const labelKekuatan = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][kekuatan];
    const warnaKekuatan = [
        'bg-danger-500',
        'bg-danger-500',
        'bg-warning-500',
        'bg-success-500',
        'bg-success-500',
    ][kekuatan];

    function simpan(e) {
        e.preventDefault();
        const g = {};

        if (sandi.baru.length < 8) g.baru = 'Password baru minimal 8 karakter.';
        if (sandi.baru !== sandi.konfirmasi) g.konfirmasi = 'Konfirmasi password tidak sama.';

        setGalat(g);
        if (Object.keys(g).length) return;

        tambahToast('Password berhasil diatur. Silakan masuk dengan password baru.', 'sukses');
        router.visit('/auth/login');
    }

    return (
        <GuestLayout
            judul="Atur password baru"
            deskripsi="Buat password baru yang kuat untuk melindungi akun kamu."
            eyebrow="Tautan valid 15 menit"
        >
            <Head title="Atur Password Baru" />

            <form onSubmit={simpan} className="space-y-4">
                <Input
                    label="Password baru"
                    ikon={KeyRound}
                    type="password"
                    value={sandi.baru}
                    onChange={(e) => setSandi((s) => ({ ...s, baru: e.target.value }))}
                    galat={galat.baru}
                    wajib
                />

                {sandi.baru ? (
                    <div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-navy-400">Kekuatan password</span>
                            <span className="text-navy-600">{labelKekuatan}</span>
                        </div>
                        <div className="mt-1.5 flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                                <span
                                    key={i}
                                    className={[
                                        'h-1.5 flex-1 rounded-full transition-colors',
                                        i < kekuatan ? warnaKekuatan : 'bg-slate-200',
                                    ].join(' ')}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                <Input
                    label="Konfirmasi password baru"
                    ikon={KeyRound}
                    type="password"
                    value={sandi.konfirmasi}
                    onChange={(e) => setSandi((s) => ({ ...s, konfirmasi: e.target.value }))}
                    galat={galat.konfirmasi}
                    wajib
                />

                <ul className="space-y-1.5 rounded-2xl bg-slate-50 p-4">
                    {ATURAN.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-[11px] text-navy-500">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-success-600" />
                            {a}
                        </li>
                    ))}
                </ul>

                <Button type="submit" ukuran="lg" className="w-full" ikon={ShieldCheck}>
                    Simpan password baru
                </Button>
            </form>

            <p className="mt-5 text-center text-[12px] text-navy-400">
                Sudah ingat passwordnya?{' '}
                <Link href="/auth/login" className="font-bold text-powder-600 hover:underline">
                    Masuk
                </Link>
            </p>
        </GuestLayout>
    );
}
