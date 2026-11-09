export const MAKS_HARI_PREORDER = 3;

export const ROLES = {
    PEMBELI: 'pembeli',
    PENJUAL: 'penjual',
    KURIR: 'kurir',
    ADMIN: 'admin',
};

export const LABEL_ROLE = {
    pembeli: 'Pembeli',
    penjual: 'Penjual',
    kurir: 'Kurir',
    admin: 'Admin',
};

export const STATUS_AKTIFITAS = {
    aktif: { label: 'Aktif', tone: 'success' },
    nonaktif: { label: 'Nonaktif', tone: 'neutral' },
    tutup: { label: 'Tutup', tone: 'danger' },
};

export const STATUS_VERIFIKASI = {
    pending: { label: 'Menunggu Verifikasi', tone: 'warning', short: 'Menunggu' },
    approved: { label: 'Terverifikasi', tone: 'success', short: 'Terverifikasi' },
    rejected: { label: 'Ditolak', tone: 'danger', short: 'Ditolak' },
    suspended: { label: 'Ditangguhkan', tone: 'danger', short: 'Ditangguhkan' },
};

export const ALUR_STATUS_PESANAN = [
    { key: 'menunggu_pembayaran', label: 'Menunggu Pembayaran', short: 'Menunggu Bayar' },
    { key: 'diproses', label: 'Sedang Dimasak', short: 'Sedang Masak' },
    { key: 'siap_diantar', label: 'Siap Diantar', short: 'Siap Diantar' },
    { key: 'diambil_kurir', label: 'Kurir Mengambil', short: 'Kurir Ambil' },
    { key: 'dalam_pengiriman', label: 'Dalam Pengiriman', short: 'Diantar' },
    { key: 'selesai', label: 'Pesanan Selesai', short: 'Selesai' },
];

export const STATUS_PESANAN = {
    menunggu_pembayaran: { label: 'Menunggu Pembayaran', tone: 'warning' },
    diproses: { label: 'Sedang Dimasak', tone: 'info' },
    siap_diantar: { label: 'Siap Diantar', tone: 'info' },
    diambil_kurir: { label: 'Kurir Mengambil', tone: 'info' },
    dalam_pengiriman: { label: 'Dalam Pengiriman', tone: 'info' },
    selesai: { label: 'Selesai', tone: 'success' },
    dibatalkan: { label: 'Dibatalkan', tone: 'danger' },
    kedaluwarsa: { label: 'Kedaluwarsa', tone: 'neutral' },
};

export const URUTAN_STATUS = ALUR_STATUS_PESANAN.map((s) => s.key);

/**
 * STATUS_PESANAN memakai nama tone generik (warning/success/danger),
 * sedangkan <Badge> memakai nama tone Bahasa Indonesia. Mapper ini
 * menjembatani keduanya supaya tidak ada bug warna diam-diam.
 */
export const TONE_BADGE = {
    warning: 'peringatan',
    success: 'sukses',
    danger: 'bahaya',
    info: 'info',
    neutral: 'netral',
    powder: 'powder',
    butter: 'butter',
    navy: 'navy',
    dark: 'gelap',
};

export function toneBadge(tone) {
    return TONE_BADGE[tone] ?? 'netral';
}

/** Tone Badge untuk status pesanan, mis. toneBadgeStatus('selesai'). */
export function toneBadgeStatus(status) {
    return toneBadge(STATUS_PESANAN[status]?.tone);
}

export function indeksStatus(status) {
    return URUTAN_STATUS.indexOf(status);
}

export function bisaMajukanStatus(status, peran) {
    const i = indeksStatus(status);

    if (i < 0) return false;

    const next = URUTAN_STATUS[i + 1];

    if (!next) return false;

    if (i === 0) return ['penjual', 'pembeli'].includes(peran);
    if (next === 'dalam_pengiriman') return ['kurir', 'admin'].includes(peran);
    if (next === 'selesai') return ['kurir', 'pembeli', 'admin'].includes(peran);

    return ['penjual', 'admin'].includes(peran);
}

export function aksiBerikutnya(status) {
    const i = indeksStatus(status);

    if (i < 0 || i >= URUTAN_STATUS.length - 1) return null;

    return {
        key: URUTAN_STATUS[i + 1],
        label: STATUS_PESANAN[URUTAN_STATUS[i + 1]].label,
    };
}

export const METODE_PEMBAYARAN = [
    {
        key: 'qris',
        label: 'QRIS',
        deskripsi: 'Scan QRIS dari m-banking apa pun',
        warna: 'info',
        instantly: true,
    },
    {
        key: 'transfer',
        label: 'Transfer Bank',
        deskripsi: 'Virtual account atau transfer manual',
        warna: 'powder',
        instantly: true,
    },
    {
        key: 'dp',
        label: 'Bayar DP',
        deskripsi: 'Uang muka 30%, sisanya saat pesanan diterima',
        warna: 'butter',
        instantly: true,
    },
    {
        key: 'cod',
        label: 'Bayar di Tempat',
        deskripsi: 'Tunai atau QRIS kepada kurir saat tiba',
        warna: 'success',
        instantly: false,
    },
];

export function metodePembayaran(key) {
    return METODE_PEMBAYARAN.find((m) => m.key === key) ?? METODE_PEMBAYARAN[0];
}

export const BIAYA_LAYANAN = 2000;
export const MIN_BELANJA_GRATIS_ONGKIR = 75000;
export const ONGKIR_DASAR = 5000;
export const ONGKIR_PER_KM = 2500;

/** Halaman masuk tiap role, dipakai menu akun dan pengalih peran. */
export const DASHBOARD_ROLE = {
    pembeli: '/',
    penjual: '/seller',
    kurir: '/courier',
    admin: '/admin',
};

/** Ikon lucide per role (disimpan sebagai nama agar tidak mengikat import). */
export const IKON_ROLE = {
    pembeli: 'user',
    penjual: 'utensils',
    kurir: 'truck',
    admin: 'shield',
};

export const JENIS_KENDARAAN = ['Motor', 'Sepeda', 'Mobil', 'Sepeda Motor Listrik'];

export const JENIS_SERTIFIKAT = [
    'Sertifikat Higiene Cuisine',
    'Sertifikat PIRT',
    'Sertifikat Keamanan Pangan',
    'Sertifikat Standar Olahan',
];

export const JENIS_USAHA = ['Kuliner Rumahan', 'Kafe', 'Rumah Makan', 'Katering', 'Kedai', 'Food Truck'];

export const TIPE_DOKUMEN = {
    ktp: 'Foto KTP',
    selfie: 'Foto Diri dengan KTP',
    sertifikat: 'Sertifikat',
    usaha: 'Dokumen Usaha',
    motor: 'Foto Kendaraan',
    sim: 'Foto SIM',
};

export const SLOT_JAM = [
    { key: 'pagi', label: 'Pagi', mulai: '06:00', selesai: '10:00' },
    { key: 'siang', label: 'Siang', mulai: '11:00', selesai: '14:00' },
    { key: 'sore', label: 'Sore/Malam', mulai: '17:00', selesai: '20:00' },
];

export const NOTIFIKASI_TIPE = {
    pesanan: 'pesanan',
    verifikasi: 'verifikasi',
    pengiriman: 'pengiriman',
    promo: 'promo',
    sistem: 'sistem',
};
