import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, MailCheck, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Input } from '../../Components/ui/Form';
import GuestLayout from '../../Layouts/GuestLayout';
import { useDemo } from '../../stores/DemoContext';

export default function ForgotPassword() {
    const { seed, tambahToast } = useDemo();

    const { data, setData, processing } = useForm({ email: '' });
    const [terkirim, setTerkirim] = useState(false);
    const [galat, setGalat] = useState('');

    const emailDemo = seed.akun?.pembeli?.email ?? 'buyer@preorderly.id';

    function kirim(e) {
        e.preventDefault();

        if (!/^\S+@\S+\.\S+$/.test(data.email)) {
            setGalat('Format email tidak valid.');
            return;
        }

        const dikenal = Object.values(seed.akun ?? {}).some((a) => a.email === data.email);
        setGalat('');
        setTerkirim(true);
        tambahToast(
            dikenal
                ? 'Tautan atur ulang password dikirim ke email kamu.'
                : 'Jika email terdaftar, tautan atur ulang password akan dikirim.',
            'info',
        );
    }

    return (
        <GuestLayout
            judul="Lupa password"
            deskripsi="Masukkan email terdaftar. Kami kirim tautan untuk membuat password baru."
            eyebrow="Pemulihan akun"
        >
            <Head title="Lupa Password" />

            {!terkirim ? (
                <form onSubmit={kirim} className="space-y-4">
                    <Input
                        label="Email terdaftar"
                        ikon={Mail}
                        type="email"
                        placeholder={emailDemo}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        galat={galat}
                        wajib
                    />

                    <Button type="submit" ukuran="lg" className="w-full" ikon={Send} disabled={processing}>
                        Kirim tautan atur ulang
                    </Button>
                </form>
            ) : (
                <Card className="flex flex-col items-center gap-3 p-6 text-center">
                    <span className="grid size-12 place-items-center rounded-2xl bg-success-50 text-success-600">
                        <MailCheck className="size-6" />
                    </span>
                    <p className="text-[14px] font-extrabold text-navy-900">Cek email kamu</p>
                    <p className="text-[12px] leading-relaxed text-navy-500">
                        Tautan atur ulang password sudah dikirim ke{' '}
                        <span className="font-bold text-navy-800">{data.email}</span>. Tautan berlaku 15 menit.
                    </p>

                    <Button className="mt-1 w-full" onClick={() => router.visit('/auth/atur-password-baru')}>
                        Buka halaman atur password baru
                    </Button>
                </Card>
            )}

            <Link
                href="/auth/login"
                className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold text-navy-400 hover:text-powder-600"
            >
                <ArrowLeft className="size-3.5" />
                Kembali ke halaman masuk
            </Link>
        </GuestLayout>
    );
}
