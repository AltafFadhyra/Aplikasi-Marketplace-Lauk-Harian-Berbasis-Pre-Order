const RUPIAH = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const ANGKA = new Intl.NumberFormat('id-ID');

const NAMA_BULAN = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function rupiah(nilai) {
    const angka = Number(nilai) || 0;

    return RUPIAH.format(angka).replace(/\s/g, ' ');
}

export function angka(nilai) {
    return ANGKA.format(Number(nilai) || 0);
}

export function parseRupiah(teks) {
    return Number(String(teks ?? '').replace(/[^0-9]/g, '')) || 0;
}

function keTanggal(nilai) {
    if (!nilai) return null;
    if (nilai instanceof Date) return nilai;
    return new Date(nilai);
}

export function tanggalPanjang(nilai, { denganHari = true } = {}) {
    const d = keTanggal(nilai);

    if (!d || Number.isNaN(d.getTime())) return '-';

    const hari = denganHari ? `${NAMA_HARI[d.getDay()]}, ` : '';

    return `${hari}${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function tanggalPendek(nilai) {
    const d = keTanggal(nilai);

    if (!d || Number.isNaN(d.getTime())) return '-';

    return `${d.getDate()} ${NAMA_BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function jam(nilai) {
    const d = keTanggal(nilai);

    if (!d || Number.isNaN(d.getTime())) return '-';

    return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
}

export function waktuLengkap(nilai) {
    const d = keTanggal(nilai);

    if (!d || Number.isNaN(d.getTime())) return '-';

    return `${tanggalPendek(nilai)} · ${jam(nilai)}`;
}

export function waktuRelatif(nilai) {
    const d = keTanggal(nilai);

    if (!d || Number.isNaN(d.getTime())) return '-';

    const selisihDetik = Math.floor((Date.now() - d.getTime()) / 1000);

    if (selisihDetik < 60) return 'Baru saja';
    if (selisihDetik < 3600) return `${Math.floor(selisihDetik / 60)} menit lalu`;
    if (selisihDetik < 86400) return `${Math.floor(selisihDetik / 3600)} jam lalu`;
    if (selisihDetik < 604800) return `${Math.floor(selisihDetik / 86400)} hari lalu`;

    return tanggalPendek(d);
}

export function tambahHari(nilai, jumlahHari) {
    const d = keTanggal(nilai) ?? new Date();
    const hasil = new Date(d);
    hasil.setDate(hasil.getDate() + jumlahHari);

    return hasil;
}

export function keTanggalPendek(nilai) {
    return tanggalPendek(nilai);
}

/** Format YYYY-MM-DD lokal, untuk nilai <input type="date">. */
export function keTanggalISO(nilai) {
    const d = keTanggal(nilai);

    if (!d || Number.isNaN(d.getTime())) return '';

    const bulan = String(d.getMonth() + 1).padStart(2, '0');
    const hari = String(d.getDate()).padStart(2, '0');

    return `${d.getFullYear()}-${bulan}-${hari}`;
}

export function inisial(nama = '') {
    return String(nama)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((kata) => kata.charAt(0).toUpperCase())
        .join('');
}

export function nomorDokumen(teks = '', jumlah = 4) {
    const bersih = String(teks).replace(/\D/g, '');

    if (bersih.length <= jumlah) return bersih;

    return bersih.replace(new RegExp(`.{1,${jumlah}}`, 'g'), '$& ').trim();
}

export function sensorNik(nik = '') {
    const bersih = String(nik).replace(/\D/g, '');

    if (bersih.length < 8) return bersih;

    return `${bersih.slice(0, 4)}•••••••${bersih.slice(-4)}`;
}
