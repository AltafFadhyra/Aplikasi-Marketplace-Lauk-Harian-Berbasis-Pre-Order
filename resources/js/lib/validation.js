export const aturan = {
    nama: { wajib: true, min: 3, pesan: 'Nama minimal 3 karakter' },
    email: { wajib: true, email: true, pesan: 'Format email tidak valid' },
    telepon: { wajib: true, telepon: true, pesan: 'Nomor HP harus 10–15 digit' },
    password: { wajib: true, min: 8, kuat: true, pesan: 'Password minimal 8 karakter' },
    konfirmasi: { wajib: true, samaDengan: 'password', pesan: 'Konfirmasi password tidak sama' },
    alamat: { wajib: true, min: 10, pesan: 'Alamat minimal 10 karakter' },
    nik: { wajib: true, nik: true, pesan: 'NIK harus 16 digit' },
    nomor: { wajib: true, nik: true, pesan: 'Nomor dokumen harus 16 digit' },
};

function cekSatu(nilai, aturanSatu) {
    if (aturanSatu?.wajib) {
        const kosong = nilai === undefined || nilai === null || String(nilai).trim() === '';

        if (kosong) return 'Wajib diisi';
    }

    const teks = String(nilai ?? '').trim();

    if (aturanSatu?.min && teks.length < aturanSatu.min) return aturanSatu.pesan ?? `Minimal ${aturanSatu.min} karakter`;
    if (aturanSatu?.max && teks.length > aturanSatu.max) return aturanSatu.pesan ?? `Maksimal ${aturanSatu.max} karakter`;
    if (aturanSatu?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(teks)) return aturanSatu.pesan ?? 'Format email tidak valid';
    if (aturanSatu?.telepon && !/^\+?[0-9]{10,15}$/.test(teks.replace(/[\s-]/g, ''))) {
        return aturanSatu.pesan ?? 'Nomor HP harus 10–15 digit';
    }
    if (aturanSatu?.nik && !/^\d{16}$/.test(teks)) return aturanSatu.pesan ?? 'Harus 16 digit angka';
    if (aturanSatu?.kuota && Number(nilai) < aturanSatu.kuota) return `Minimal ${aturanSatu.kuota}`;

    if (aturanSatu?.kuat) {
        if (!/[a-z]/.test(teks)) return 'Password harus punya huruf kecil';
        if (!/[A-Z]/.test(teks)) return 'Password harus punya huruf besar';
        if (!/\d/.test(teks)) return 'Password harus punya angka';
    }

    return null;
}

export function validasi(data, skema) {
    const galat = {};
    const semua = { ...aturan, ...skema };

    Object.entries(semua).forEach(([kolom, aturanKolom]) => {
        if (typeof aturanKolom === 'function') return;

        const pesan = cekSatu(data[kolom], aturanKolom);

        if (pesan) galat[kolom] = pesan;
    });

    const khusus = skema?.__khusus;

    if (typeof khusus === 'function') {
        Object.assign(galat, khusus(data) ?? {});
    }

    return { valid: Object.keys(galat).length === 0, galat };
}

export function kekuatanPassword(password) {
    const teks = String(password ?? '');
    let skor = 0;

    if (teks.length >= 8) skor += 1;
    if (teks.length >= 12) skor += 1;
    if (/[a-z]/.test(teks) && /[A-Z]/.test(teks)) skor += 1;
    if (/\d/.test(teks)) skor += 1;
    if (/[^\w\s]/.test(teks)) skor += 1;

    const label = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][Math.min(skor, 4)];

    return { skor, label, persen: Math.round((skor / 5) * 100) };
}

export const MAKS_UKURAN_BERKAS = 2 * 1024 * 1024;
export const TIPE_BERKAS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function validasiBerkas(berkas) {
    if (!berkas) return 'Berkas wajib dipilih';

    if (berkas.size > MAKS_UKURAN_BERKAS) return 'Ukuran maksimal 2 MB';
    if (!TIPE_BERKAS.includes(berkas.type)) return 'Format harus JPG, PNG, WEBP, atau PDF';

    return null;
}
