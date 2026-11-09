import { Head, usePage } from '@inertiajs/react';
import { CalendarClock, Clock3, Plus, Save, Users } from 'lucide-react';
import { useState } from 'react';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Card from '../../Components/ui/Card';
import { Input, Select, Textarea } from '../../Components/ui/Form';
import { ProgressBar } from '../../Components/ui/StatCard';
import { PageHeader, SectionHeading } from '../../Components/ui/Misc';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { ROLES, SLOT_JAM } from '../../lib/constants';
import { keTanggalISO, tambahHari, waktuRelatif } from '../../lib/format';
import { useDemo } from '../../stores/DemoContext';

export default function Slots() {
    const { restoranId } = usePage().props;
    const { seed, akun, tambahToast, slot: slotLokal, tambahSlotProduksi } = useDemo();

    const toko = akun?.penjual ?? {};
    const idResto = restoranId ?? toko.restoran_id;

    const [tanggal, setTanggal] = useState(keTanggalISO(tambahHari(new Date(), 1)));
    const [jam, setJam] = useState(SLOT_JAM[0] ?? { mulai: '11:00', selesai: '13:00' });
    const [kapasitas, setKapasitas] = useState(20);

    const slotToko = (slotLokal ?? []).filter(
        (s) => String(s.restoran_id) === String(idResto) || String(s.restoran_id) === String(restoranId),
    );

    const gabungan = (() => {
        const peta = new Map();

        for (const s of slotToko) {
            peta.set(String(s.id), {
                id: s.id,
                tanggal: s.tanggal,
                tanggal_label: s.tanggal_label,
                jam_mulai: s.jam_mulai,
                jam_selesai: s.jam_selesai,
                kapasitas: s.kapasitas,
                terisi: s.terisi,
                batas_pesan: s.batas_pesan,
            });
        }

        return [...peta.values()].sort(
            (a, b) => (a.tanggal + a.jam_mulai).localeCompare(b.tanggal + b.jam_mulai),
        );
    })();

    const grouped = gabungan.reduce((acc, s) => {
        (acc[s.tanggal_label] ??= []).push(s);
        return acc;
    }, {});

    function tambahSlot() {
        if (!idResto) {
            tambahToast('Restoran akun ini tidak ditemukan.', 'bahaya');
            return;
        }

        const bentrok = gabungan.some(
            (s) => s.tanggal === tanggal && s.jam_mulai === jam.mulai,
        );

        if (bentrok) {
            tambahToast(`Slot ${jam.mulai}-${jam.selesai} di tanggal itu sudah ada.`, 'peringatan');
            return;
        }

        tambahSlotProduksi(idResto, {
            tanggal,
            mulai: jam.mulai,
            selesai: jam.selesai,
            kapasitas,
        });
        tambahToast(
            `Slot ${jam.mulai}-${jam.selesai} untuk ${kapasitas} porsi dijadwalkan.`,
            'sukses',
        );
    }

    return (
        <DashboardLayout judul="Jadwal Produksi" peran={ROLES.PENJUAL}>
            <Head title="Jadwal Produksi" />

            <div className="mb-5">
                <PageHeader
                    judul="Jadwal produksi"
                    deskripsi="Atur jam produksi dan kuota harian. Pre-order dibuka maksimal H+3."
                    ikon={CalendarClock}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card elevate className="p-5">
                    <SectionHeading judul="Tambah slot produksi" ikon={Plus} />

                    <div className="mt-4 space-y-4">
                        <Input
                            label="Tanggal produksi"
                            ikon={CalendarClock}
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            petunjuk="Maksimal 3 hari ke depan."
                        />

                        <Select
                            label="Jam produksi"
                            ikon={Clock3}
                            value={`${jam.mulai}-${jam.selesai}`}
                            onChange={(e) => {
                                const [m, a] = e.target.value.split('-');
                                setJam({ mulai: m, selesai: a });
                            }}
                        >
                            {SLOT_JAM.map((j) => (
                                <option key={`${j.mulai}-${j.selesai}`} value={`${j.mulai}-${j.selesai}`}>
                                    {j.label ?? `${j.mulai} - ${j.selesai}`}
                                </option>
                            ))}
                        </Select>

                        <Input
                            label="Kapasitas (porsi)"
                            ikon={Users}
                            type="number"
                            min={1}
                            max={200}
                            value={kapasitas}
                            onChange={(e) => setKapasitas(Number(e.target.value))}
                        />

                        <Textarea
                            baris={2}
                            placeholder="Catatan internal, misalnya bahan yang terbatas."
                        />

                        <Button className="w-full" onClick={tambahSlot} ikon={CalendarClock}>
                            Simpan slot
                        </Button>
                    </div>
                </Card>

                <div className="space-y-4 lg:col-span-2">
                    <Card elevate className="p-5">
                        <SectionHeading
                            judul="Slot 3 hari ke depan"
                            deskripsi="Kuota terisi diperbarui otomatis saat pesanan masuk."
                        />

                        {!Object.keys(grouped).length ? (
                            <p className="mt-4 rounded-2xl bg-warning-50 px-4 py-3 text-[12px] font-semibold text-warning-600">
                                Belum ada slot produksi. Tambahkan slot agar pembeli bisa memesan.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-5">
                                {Object.entries(grouped).map(([hari, list]) => (
                                    <div key={hari}>
                                        <p className="mb-2 text-[12px] font-extrabold text-navy-900">
                                            {hari}
                                        </p>

                                        <ul className="grid gap-2.5 sm:grid-cols-2">
                                            {list.map((s) => {
                                                const persen = s.kapasitas
                                                    ? Math.round((s.terisi / s.kapasitas) * 100)
                                                    : 0;

                                                return (
                                                    <li
                                                        key={s.id}
                                                        className="rounded-2xl border border-slate-200 p-3.5"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[12px] font-extrabold text-navy-900">
                                                                {s.jam_mulai} - {s.jam_selesai}
                                                            </p>
                                                            <Badge
                                                                tone={persen >= 90 ? 'bahaya' : 'sukses'}
                                                                ukuran="xs"
                                                            >
                                                                sisa {Math.max(0, s.kapasitas - s.terisi)}
                                                            </Badge>
                                                        </div>

                                                        <div className="mt-2">
                                                            <ProgressBar
                                                                nilai={persen}
                                                                tone={persen >= 90 ? 'bahaya' : 'powder'}
                                                            />
                                                        </div>

                                                        <p className="mt-1.5 text-[10px] text-navy-300">
                                                            {s.terisi}/{s.kapasitas} porsi · batas pesan{' '}
                                                            {waktuRelatif(s.batas_pesan)}
                                                        </p>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-5">
                        <SectionHeading judul="Aturan slot" />
                        <ul className="mt-3 space-y-2 text-[12px] text-navy-600">
                            {[
                                'Pre-order hanya bisa dibuat maksimal 3 hari sebelum tanggal produksi.',
                                'Kuota slot berkurang otomatis ketika pembayaran pesanan berhasil.',
                                'Pesanan yang dibatalkan mengembalikan kuota slot secara otomatis.',
                                'Slot yang sudah lewat batas pesan tidak lagi bisa dipilih pembeli.',
                            ].map((t) => (
                                <li key={t} className="flex gap-2.5">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-powder-400" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
