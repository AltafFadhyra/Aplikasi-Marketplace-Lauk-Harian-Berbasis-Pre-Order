import { Head, Link, router } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Button from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Form';
import AppLayout from '../../Layouts/AppLayout';
import { PageHeader } from '../../Components/ui/Misc';
import { useDemo } from '../../stores/DemoContext';

export default function ChangePassword() {
    const { penggunaAktif, tambahToast, gantiKunci } = useDemo();

    const [sandi, setSandi] = useState({ sekarang: '', baru: '', konfirmasi: '' });
    const [galat, setGalat] = useState({});

    function simpan(e) {
        e.preventDefault();
        const g = {};

        if (!sandi.sekarang) g.sekarang = 'Masukkan password saat ini.';
        if (sandi.baru.length < 8) g.baru = 'Password baru minimal 8 karakter.';
        if (sandi.baru !== sandi.konfirmasi) g.konfirmasi = 'Konfirmasi tidak sama.';

        setGalat(g);
        if (Object.keys(g).length) return;

        const hasil = gantiKunci(sandi.baru, sandi.sekarang);

        if (!hasil.ok) {
            setGalat({ sekarang: hasil.pesan });
            return;
        }

        setSandi({ sekarang: '', baru: '', konfirmasi: '' });
        tambahToast('Password berhasil diperbarui.', 'sukses');
    }

    return (
        <AppLayout>
            <Head title="Ganti Password" />

            <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-7">
                <PageHeader
                    judul="Ganti password"
                    deskripsi="Perbarui password akun yang sedang kamu gunakan."
                    ikon={KeyRound}
                />

                <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_10px_40px_-20px_rgba(15,42,71,0.25)]">
                    <p className="text-[12px] text-navy-500">
                        Masuk sebagai <span className="font-bold text-navy-800">{penggunaAktif?.email}</span>
                    </p>

                    <form onSubmit={simpan} className="mt-4 space-y-4">
                        <Input
                            label="Password saat ini"
                            ikon={ShieldCheck}
                            type="password"
                            value={sandi.sekarang}
                            onChange={(e) => setSandi((s) => ({ ...s, sekarang: e.target.value }))}
                            galat={galat.sekarang}
                            wajib
                        />
                        <Input
                            label="Password baru"
                            ikon={KeyRound}
                            type="password"
                            value={sandi.baru}
                            onChange={(e) => setSandi((s) => ({ ...s, baru: e.target.value }))}
                            galat={galat.baru}
                            petunjuk="Minimal 8 karakter."
                            wajib
                        />
                        <Input
                            label="Konfirmasi password baru"
                            ikon={KeyRound}
                            type="password"
                            value={sandi.konfirmasi}
                            onChange={(e) => setSandi((s) => ({ ...s, konfirmasi: e.target.value }))}
                            galat={galat.konfirmasi}
                            wajib
                        />

                        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                varian="garis"
                                onClick={() => router.visit('/profil')}
                            >
                                Batal
                            </Button>
                            <Button type="submit" ikon={KeyRound}>
                                Perbarui password
                            </Button>
                        </div>
                    </form>
                </div>

                <p className="mt-4 text-center text-[11px] text-navy-300">
                    Lupa password lama?{' '}
                    <Link href="/auth/lupa-password" className="font-bold text-powder-600 hover:underline">
                        Atur ulang melalui email
                    </Link>
                </p>
            </div>
        </AppLayout>
    );
}
