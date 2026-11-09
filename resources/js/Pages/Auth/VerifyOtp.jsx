import { Head, Link, router } from '@inertiajs/react';
import { KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { OtpInput } from '../../Components/ui/OtpInput';
import GuestLayout from '../../Layouts/GuestLayout';
import { useDemo } from '../../stores/DemoContext';

const KODE_DEMO = '123456';

export default function VerifyOtp() {
    const { penggunaAktif, kirimOtpDemo, tambahToast } = useDemo();

    const [kode, setKode] = useState('');
    const [galat, setGalat] = useState('');
    const [terkirim, setTerkirim] = useState(true);
    const [sisa, setSisa] = useState(60);

    const tujuan = penggunaAktif?.telepon ?? penggunaAktif?.email ?? 'nomor kamu';

    useEffect(() => {
        if (sisa <= 0) return;

        const t = setTimeout(() => setSisa((n) => n - 1), 1000);

        return () => clearTimeout(t);
    }, [sisa]);

    function verifikasi(e) {
        e.preventDefault();

        if (kode.length !== 6) {
            setGalat('Kode OTP harus 6 digit.');
            return;
        }

        if (kode !== KODE_DEMO) {
            setGalat('Kode OTP salah. Gunakan kode demo 123456.');
            return;
        }

        setGalat('');
        tambahToast('Verifikasi berhasil. Selamat datang di Preorderly!', 'sukses');
        router.visit('/');
    }

    function kirimUlang() {
        kirimOtpDemo();
        setTerkirim(true);
        setSisa(60);
        setGalat('');
        tambahToast(`Kode OTP dikirim ulang ke ${tujuan}.`, 'info');
    }

    return (
        <GuestLayout
            judul="Verifikasi kode OTP"
            deskripsi={`Masukkan 6 digit kode yang dikirim ke ${tujuan}.`}
            eyebrow="Langkah terakhir"
        >
            <Head title="Verifikasi OTP" />

            <form onSubmit={verifikasi} className="space-y-5">
                <Card className="flex items-start gap-3 border-powder-200 bg-powder-50/60 p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-powder-600" />
                    <div>
                        <p className="text-[12px] font-extrabold text-powder-700">
                            Kode verifikasi
                        </p>
                        <p className="mt-0.5 text-[12px] text-navy-500">
                            Masukkan kode{' '}
                            <span className="rounded-lg bg-white px-1.5 py-0.5 font-extrabold text-navy-900">
                                {KODE_DEMO}
                            </span>{' '}
                            untuk melanjutkan.
                        </p>
                    </div>
                </Card>

                <div className="flex justify-center">
                    <OtpInput nilai={kode} onUbah={setKode} galat={galat} />
                </div>

                {galat ? <p className="text-center text-[12px] font-bold text-danger-600">{galat}</p> : null}

                <Button type="submit" ukuran="lg" className="w-full" ikon={KeyRound} disabled={kode.length !== 6}>
                    Verifikasi
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={kirimUlang}
                        disabled={sisa > 0}
                        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-powder-600 transition hover:text-powder-700 disabled:text-navy-300"
                    >
                        <RefreshCw className="size-3.5" />
                        {sisa > 0 ? `Kirim ulang dalam ${sisa} detik` : 'Kirim ulang kode'}
                    </button>
                </div>
            </form>

            {terkirim ? (
                <div className="mt-5 flex justify-center">
                    <Badge tone="sukses">Kode terkirim</Badge>
                </div>
            ) : null}

            <p className="mt-5 text-center text-[12px] text-navy-400">
                Salah menerima kode?{' '}
                <Link href="/auth/lupa-password" className="font-bold text-powder-600 hover:underline">
                    Atur ulang password
                </Link>
            </p>
        </GuestLayout>
    );
}
