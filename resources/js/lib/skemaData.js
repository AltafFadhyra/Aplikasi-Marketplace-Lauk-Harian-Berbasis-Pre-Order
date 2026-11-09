import { STATUS_PESANAN } from './constants.js';

export const KUNCI_DATA = 'souorder.data.v1';
export const KUNCI_SESI = 'souorder.sesi.v1';
export const KUNCI_KERANJANG = 'souorder.keranjang.v1';
export const KUNCI_MIGRASI = 'souorder.migrasi.v1';
export const PREFIX_BACKUP = 'souorder.backup.v1.';
export const VERSI_SKEMA = 2;

const STATUS_DIKENAL = new Set(Object.keys(STATUS_PESANAN));

const ALIAS_STATUS = new Map([
    ['dibayar', 'diproses'],
    ['dikonfirmasi', 'diproses'],
    ['sedang_dimasak', 'diproses'],
    ['siap_diambil', 'siap_diantar'],
    ['dibuat_untuk_kurir', 'siap_diantar'],
]);

const ARRAY_STORE = [
    'restoran',
    'kategori',
    'slot',
    'pesanan',
    'pengiriman',
    'pengajuan',
    'notifikasi',
    'ulasan',
    'akun_lokal',
    'nonaktif',
];

const OBJEK_STORE = ['pengaturan', 'meta'];

const STATUS_SLOT_DIKENAL = new Set(['tersedia', 'penuh', 'ditutup']);

const STATUS_PENGAJUAN_DIKENAL = new Set(['pending', 'approved', 'rejected', 'suspended']);

export const FIELD_ARRAY_STORE = [...ARRAY_STORE];

export const FIELD_OBJEK_STORE = [...OBJEK_STORE];

export function adalahObjek(nilai) {
    return nilai !== null && typeof nilai === 'object' && !Array.isArray(nilai);
}

function salinObjek(nilai) {
    return adalahObjek(nilai) ? { ...nilai } : nilai;
}

function angkaValid(nilai) {
    if (nilai === null || nilai === undefined || nilai === '') return null;

    const angka = Number(nilai);

    return Number.isFinite(angka) ? angka : null;
}

function waktuValid(nilai) {
    if (typeof nilai !== 'string' || !nilai.trim()) return null;

    const waktu = Date.parse(nilai);

    return Number.isFinite(waktu) ? waktu : null;
}

export function sidik(...bagian) {
    let nilai = 2166136261;

    for (const bagianNilai of bagian) {
        const teks = String(bagianNilai ?? '');

        for (let i = 0; i < teks.length; i += 1) {
            nilai ^= teks.charCodeAt(i);
            nilai = Math.imul(nilai, 16777619);
        }
    }

    return (nilai >>> 0).toString(36);
}

export function normalisasiStatus(status) {
    if (typeof status !== 'string' || !status) return status;

    if (STATUS_DIKENAL.has(status)) return status;

    return ALIAS_STATUS.get(status) ?? status;
}

export function normalisasiAlamat(alamat) {
    if (typeof alamat === 'string') {
        return { detail: alamat };
    }

    if (!adalahObjek(alamat)) return alamat;

    const hasil = { ...alamat };

    if (
        (hasil.detail === undefined || hasil.detail === null) &&
        typeof alamat.alamat === 'string'
    ) {
        hasil.detail = alamat.alamat;
    }

    return hasil;
}

function waktuTerakhirPesanan(pesanan) {
    const dariTimeline = Array.isArray(pesanan.timeline)
        ? pesanan.timeline
              .map((item) => (adalahObjek(item) ? waktuValid(item.pada) : null))
              .filter((item) => item !== null)
        : [];

    const kandidat = [
        waktuValid(pesanan.diperbarui_pada),
        ...dariTimeline,
        waktuValid(pesanan.dibuat_pada),
    ].filter((item) => item !== null);

    return kandidat.length ? Math.max(...kandidat) : null;
}

export function normalisasiPesanan(pesanan) {
    if (!adalahObjek(pesanan)) return pesanan;

    const hasil = { ...pesanan };
    const status = normalisasiStatus(pesanan.status);

    if (status !== undefined) {
        hasil.status = status;

        if (status !== pesanan.status && hasil.status_asal === undefined) {
            hasil.status_asal = pesanan.status;
        }
    }

    const sumberAlamat = pesanan.alamat ?? pesanan.address_snapshot;

    if (sumberAlamat !== undefined) {
        hasil.alamat = normalisasiAlamat(sumberAlamat);

        if (typeof sumberAlamat === 'string' && hasil.alamat_asal === undefined) {
            hasil.alamat_asal = sumberAlamat;
        }
    }

    if (Array.isArray(pesanan.items)) {
        hasil.items = pesanan.items.map((item) => salinObjek(item));
    }

    if (Array.isArray(pesanan.timeline)) {
        hasil.timeline = pesanan.timeline.map((item) => salinObjek(item));
    }

    if (hasil.diperbarui_pada === undefined || hasil.diperbarui_pada === null) {
        const waktu = waktuTerakhirPesanan(pesanan);

        if (waktu !== null) {
            hasil.diperbarui_pada = new Date(waktu).toISOString();
        }
    }

    if (hasil.asal === undefined && typeof pesanan.simulated === 'boolean') {
        hasil.asal = pesanan.simulated ? 'seed' : 'lokal';
    }

    return hasil;
}

function gabungTanggalJam(tanggal, jamMulai) {
    if (typeof tanggal !== 'string' || typeof jamMulai !== 'string') return null;

    const jam = jamMulai.slice(0, 5);

    if (!/^\d{2}:\d{2}$/.test(jam)) return null;

    const waktu = new Date(`${tanggal}T${jam}:00`);

    return Number.isNaN(waktu.getTime()) ? null : waktu.toISOString();
}

export function normalisasiSlot(slot) {
    if (!adalahObjek(slot)) return slot;

    const hasil = { ...slot };
    const kapasitas = angkaValid(slot.kapasitas);
    const terisi = angkaValid(slot.terisi);

    if (
        (hasil.sisa === undefined || hasil.sisa === null) &&
        kapasitas !== null &&
        terisi !== null
    ) {
        hasil.sisa = Math.max(0, kapasitas - terisi);
    }

    if (
        (hasil.waktu === undefined || hasil.waktu === null) &&
        typeof slot.tanggal === 'string' &&
        typeof slot.jam_mulai === 'string'
    ) {
        const waktu = gabungTanggalJam(slot.tanggal, slot.jam_mulai);

        if (waktu !== null) {
            hasil.waktu = waktu;
        }
    }

    return hasil;
}

export function normalisasiPengiriman(pengiriman) {
    return salinObjek(pengiriman);
}

export function normalisasiPengajuan(pengajuan) {
    if (!adalahObjek(pengajuan)) return pengajuan;

    const hasil = { ...pengajuan };

    if (adalahObjek(pengajuan.form)) hasil.form = { ...pengajuan.form };
    if (adalahObjek(pengajuan.pengguna)) hasil.pengguna = { ...pengajuan.pengguna };
    if (adalahObjek(pengajuan.dokumen)) hasil.dokumen = { ...pengajuan.dokumen };

    return hasil;
}

export function normalisasiNotifikasi(notifikasi, pemilikAkunId = null) {
    if (!adalahObjek(notifikasi)) return notifikasi;

    const hasil = { ...notifikasi };

    if (
        (hasil.pengguna_id === undefined || hasil.pengguna_id === null || hasil.pengguna_id === '') &&
        pemilikAkunId !== null &&
        pemilikAkunId !== undefined
    ) {
        hasil.pengguna_id = pemilikAkunId;
    }

    return hasil;
}

export function kunciUlasan(ulasan) {
    if (!adalahObjek(ulasan)) return null;

    if (ulasan.order_id !== undefined && ulasan.order_id !== null) {
        return `order:${ulasan.order_id}|${ulasan.nama ?? ''}`;
    }

    return `id:${ulasan.id ?? ''}`;
}

export function normalisasiUlasan(ulasan) {
    if (!adalahObjek(ulasan)) return ulasan;

    const hasil = { ...ulasan };

    if (hasil.id === undefined || hasil.id === null || hasil.id === '') {
        hasil.id = `ulasan-${sidik(
            hasil.order_id,
            hasil.restoran_id,
            hasil.nama,
            hasil.dibuat_pada,
            hasil.isi ?? hasil.komentar,
        )}`;
    }

    return hasil;
}

export function normalisasiAkunLokal(akun) {
    if (!adalahObjek(akun)) return akun;

    const hasil = { ...akun };

    if (
        (hasil.dibuat_pada === undefined || hasil.dibuat_pada === null) &&
        typeof akun.terdaftar === 'string'
    ) {
        hasil.dibuat_pada = akun.terdaftar;
    }

    return hasil;
}

export function normalisasiMenu(menu) {
    return salinObjek(menu);
}

export function normalisasiRestoran(restoran) {
    if (!adalahObjek(restoran)) return restoran;

    const hasil = { ...restoran };

    if (Array.isArray(restoran.menu)) {
        hasil.menu = restoran.menu.map((menu) => normalisasiMenu(menu));
    }

    if (adalahObjek(restoran.penjual)) {
        hasil.penjual = { ...restoran.penjual };
    }

    return hasil;
}

export function normalisasiKategori(kategori) {
    return salinObjek(kategori);
}

export function normalisasiPengaturan(pengaturan) {
    return salinObjek(pengaturan);
}

export function normalisasiStore(store) {
    if (!adalahObjek(store)) return store;

    const hasil = { ...store };

    for (const field of ARRAY_STORE) {
        if (!Array.isArray(store[field])) continue;

        if (field === 'restoran') {
            hasil[field] = store[field].map((item) => normalisasiRestoran(item));
        } else if (field === 'kategori') {
            hasil[field] = store[field].map((item) => normalisasiKategori(item));
        } else if (field === 'slot') {
            hasil[field] = store[field].map((item) => normalisasiSlot(item));
        } else if (field === 'pesanan') {
            hasil[field] = store[field].map((item) => normalisasiPesanan(item));
        } else if (field === 'pengiriman') {
            hasil[field] = store[field].map((item) => normalisasiPengiriman(item));
        } else if (field === 'pengajuan') {
            hasil[field] = store[field].map((item) => normalisasiPengajuan(item));
        } else if (field === 'notifikasi') {
            hasil[field] = store[field].map((item) => normalisasiNotifikasi(item));
        } else if (field === 'ulasan') {
            hasil[field] = store[field].map((item) => normalisasiUlasan(item));
        } else if (field === 'akun_lokal') {
            hasil[field] = store[field].map((item) => normalisasiAkunLokal(item));
        } else {
            hasil[field] = store[field].slice();
        }
    }

    if (adalahObjek(store.pengaturan)) {
        hasil.pengaturan = { ...store.pengaturan };
    }

    if (adalahObjek(store.meta)) {
        hasil.meta = { ...store.meta };
    }

    return hasil;
}

export function buatStoreKosong() {
    return {
        versi: VERSI_SKEMA,
        seed_versi: null,
        revisi: 0,
        restoran: [],
        kategori: [],
        slot: [],
        pesanan: [],
        pengiriman: [],
        pengajuan: [],
        notifikasi: [],
        ulasan: [],
        akun_lokal: [],
        nonaktif: [],
        pengaturan: {},
        meta: {},
    };
}

export function buatStoreDariSeed(seed = {}) {
    const sumber = adalahObjek(seed) ? seed : {};
    const store = buatStoreKosong();

    store.seed_versi = hitungSeedVersi(sumber);
    store.restoran = Array.isArray(sumber.restoran)
        ? sumber.restoran.map((item) => normalisasiRestoran(item))
        : [];
    store.kategori = Array.isArray(sumber.kategori)
        ? sumber.kategori.map((item) => normalisasiKategori(item))
        : [];
    store.slot = Array.isArray(sumber.slot) ? sumber.slot.map((item) => normalisasiSlot(item)) : [];
    store.pesanan = Array.isArray(sumber.pesanan)
        ? sumber.pesanan.map((item) => normalisasiPesanan(item))
        : [];
    store.pengajuan = Array.isArray(sumber.pengajuan)
        ? sumber.pengajuan.map((item) => normalisasiPengajuan(item))
        : [];
    store.notifikasi = Array.isArray(sumber.notifikasi)
        ? sumber.notifikasi.map((item) => normalisasiNotifikasi(item))
        : [];
    store.ulasan = Array.isArray(sumber.ulasan)
        ? sumber.ulasan.map((item) => normalisasiUlasan(item))
        : [];

    return store;
}

export function hitungSeedVersi(seed) {
    try {
        const sumber = adalahObjek(seed) ? seed : {};

        return sidik(
            JSON.stringify({
                kategori: Array.isArray(sumber.kategori) ? sumber.kategori.length : 0,
                restoran: Array.isArray(sumber.restoran) ? sumber.restoran.length : 0,
                slot: Array.isArray(sumber.slot) ? sumber.slot.length : 0,
                pesanan: Array.isArray(sumber.pesanan) ? sumber.pesanan.length : 0,
                pengajuan: Array.isArray(sumber.pengajuan) ? sumber.pengajuan.length : 0,
                notifikasi: Array.isArray(sumber.notifikasi) ? sumber.notifikasi.length : 0,
                ulasan: Array.isArray(sumber.ulasan) ? sumber.ulasan.length : 0,
            }),
        );
    } catch {
        return null;
    }
}

export function gabungUnik(daftar, kunci, pilih = (lama, baru) => baru) {
    const peta = new Map();

    (Array.isArray(daftar) ? daftar : []).forEach((item, indeks) => {
        let id = kunci(item);

        if (id === null || id === undefined || id === '') {
            id = `__tanpa_kunci__${indeks}`;
        }

        if (peta.has(id)) {
            peta.set(id, pilih(peta.get(id), item));
        } else {
            peta.set(id, item);
        }
    });

    return [...peta.values()];
}

function punyaNilai(nilai) {
    return nilai !== undefined && nilai !== null && nilai !== '';
}

function angkaFinite(nilai) {
    return typeof nilai === 'number' && Number.isFinite(nilai);
}

function punyaIdentitas(item, fields) {
    return fields.some((field) => punyaNilai(item[field]));
}

function tipePrimitif(nilai) {
    return typeof nilai === 'string' || typeof nilai === 'number';
}

function teksTidakKosong(nilai) {
    return typeof nilai === 'string' && nilai.trim() !== '';
}

function angkaTakNegatif(nilai) {
    return angkaFinite(nilai) && nilai >= 0;
}

function validasiAngka(item, fields, galat, { takNegatif = true } = {}) {
    for (const field of fields) {
        if (item[field] === undefined || item[field] === null) continue;

        if (!angkaFinite(item[field])) {
            galat.push(`${field} harus berupa angka.`);
        } else if (takNegatif && item[field] < 0) {
            galat.push(`${field} tidak boleh negatif.`);
        }
    }
}

function validasiWaktu(item, fields, galat) {
    for (const field of fields) {
        if (item[field] === undefined || item[field] === null) continue;

        if (waktuValid(item[field]) === null) {
            galat.push(`${field} harus berupa tanggal yang valid.`);
        }
    }
}

function validasiRestoran(item, ketat = false) {
    const galat = [];
    const peringatan = [];

    if (!punyaNilai(item.id)) galat.push('harus memiliki id.');
    if (item.nama !== undefined && typeof item.nama !== 'string') {
        galat.push('nama harus berupa string.');
    }
    if (item.slug !== undefined && typeof item.slug !== 'string') {
        galat.push('slug harus berupa string.');
    }
    if (item.menu !== undefined && !Array.isArray(item.menu)) {
        galat.push('menu harus berupa array.');
    } else if (Array.isArray(item.menu) && item.menu.some((menu) => !adalahObjek(menu))) {
        galat.push('setiap menu harus berupa objek.');
    }
    if (item.penjual !== undefined && !adalahObjek(item.penjual)) {
        galat.push('penjual harus berupa objek.');
    }
    if (item.buka !== undefined && typeof item.buka !== 'boolean') {
        galat.push('buka harus berupa boolean.');
    }

    validasiAngka(
        item,
        ['latitude', 'longitude', 'jarak_km', 'min_order', 'rating', 'jumlah_rating', 'terjual'],
        galat,
    );

    if (ketat && Array.isArray(item.menu)) {
        const idMenu = item.menu
            .map((menu) => (adalahObjek(menu) ? menu.id : null))
            .filter((id) => punyaNilai(id));

        if (new Set(idMenu.map((id) => String(id))).size !== idMenu.length) {
            galat.push('id menu tidak boleh duplikat.');
        }
    }

    return { galat, peringatan };
}

function validasiKategori(item, ketat = false) {
    const galat = [];

    if (!punyaIdentitas(item, ['id', 'slug', 'nama'])) {
        galat.push('harus memiliki id, slug, atau nama.');
    }
    if (item.id !== undefined && !tipePrimitif(item.id)) {
        galat.push('id harus berupa string atau angka.');
    }
    if (item.slug !== undefined && typeof item.slug !== 'string') {
        galat.push('slug harus berupa string.');
    }
    if (item.nama !== undefined && typeof item.nama !== 'string') {
        galat.push('nama harus berupa string.');
    }
    if (ketat && item.nama !== undefined && !teksTidakKosong(item.nama)) {
        galat.push('nama tidak boleh kosong.');
    }

    return { galat, peringatan: [] };
}

function validasiSlot(item, ketat = false) {
    const galat = [];
    const peringatan = [];

    if (!punyaNilai(item.id)) galat.push('harus memiliki id.');
    if (!punyaNilai(item.restoran_id)) galat.push('harus memiliki restoran_id.');
    if (item.restoran_id !== undefined && !tipePrimitif(item.restoran_id)) {
        galat.push('restoran_id harus berupa string atau angka.');
    }

    for (const field of ['kapasitas', 'terisi']) {
        if (!angkaFinite(item[field])) {
            galat.push(`${field} harus berupa angka.`);
        } else if (item[field] < 0) {
            galat.push(`${field} tidak boleh negatif.`);
        }
    }

    if (item.sisa !== undefined) {
        if (!angkaFinite(item.sisa)) {
            galat.push('sisa harus berupa angka.');
        } else if (item.sisa < 0) {
            galat.push('sisa tidak boleh negatif.');
        }
    }
    if (item.status !== undefined && typeof item.status !== 'string') {
        galat.push('status harus berupa string.');
    } else if (ketat && item.status !== undefined && !STATUS_SLOT_DIKENAL.has(item.status)) {
        galat.push('status slot tidak dikenal.');
    }
    if (item.tanggal !== undefined && typeof item.tanggal !== 'string') {
        galat.push('tanggal harus berupa string.');
    }
    for (const field of ['jam_mulai', 'jam_selesai']) {
        if (item[field] !== undefined && typeof item[field] !== 'string') {
            galat.push(`${field} harus berupa string.`);
        }
    }
    validasiWaktu(item, ['waktu', 'batas_pesan'], galat);

    if (angkaFinite(item.kapasitas) && angkaFinite(item.terisi) && item.terisi > item.kapasitas) {
        peringatan.push('terisi melebihi kapasitas.');
    }

    return { galat, peringatan };
}

function validasiPesanan(item, ketat = false) {
    const galat = [];

    if (!punyaIdentitas(item, ['id', 'kode'])) {
        galat.push('harus memiliki id atau kode.');
    }
    if (typeof item.status !== 'string' || !item.status.trim()) {
        galat.push('status harus berupa string yang tidak kosong.');
    } else if (ketat && !STATUS_DIKENAL.has(item.status)) {
        galat.push('status pesanan tidak dikenal.');
    }
    for (const field of ['items', 'timeline']) {
        if (item[field] !== undefined && !Array.isArray(item[field])) {
            galat.push(`${field} harus berupa array.`);
        } else if (Array.isArray(item[field]) && item[field].some((baris) => !adalahObjek(baris))) {
            galat.push(`setiap ${field} harus berupa objek.`);
        }
    }
    if (
        item.alamat !== undefined &&
        item.alamat !== null &&
        typeof item.alamat !== 'string' &&
        !adalahObjek(item.alamat) &&
        !Array.isArray(item.alamat)
    ) {
        galat.push('alamat harus berupa string, objek, array, atau null.');
    }

    validasiAngka(
        item,
        [
            'subtotal',
            'ongkir',
            'biaya_layanan',
            'diskon',
            'total',
            'dibayar_sebesar',
            'sisa_tagihan',
            'jarak_km',
        ],
        galat,
    );
    validasiWaktu(item, ['dibuat_pada', 'diperbarui_pada', 'eta'], galat);

    if (ketat && Array.isArray(item.items)) {
        item.items.forEach((baris, indeks) => {
            if (!adalahObjek(baris)) return;

            const galatItem = [];

            validasiAngka(baris, ['harga'], galatItem);

            for (const pesan of galatItem) {
                galat.push(`items[${indeks}].${pesan}`);
            }

            if (baris.qty !== undefined && (!Number.isInteger(baris.qty) || baris.qty <= 0)) {
                galat.push(`items[${indeks}].qty harus berupa bilangan bulat positif.`);
            }
        });
    }

    if (ketat && Array.isArray(item.timeline)) {
        item.timeline.forEach((baris, indeks) => {
            if (!adalahObjek(baris)) return;
            if (baris.pada !== undefined && waktuValid(baris.pada) === null) {
                galat.push(`timeline[${indeks}].pada harus berupa tanggal yang valid.`);
            }
        });
    }

    return { galat, peringatan: [] };
}

function validasiPengiriman(item, ketat = false) {
    const galat = [];

    if (!punyaIdentitas(item, ['id', 'pesanan_id'])) {
        galat.push('harus memiliki id atau pesanan_id.');
    }
    if (item.pesanan_id !== undefined && !tipePrimitif(item.pesanan_id)) {
        galat.push('pesanan_id harus berupa string atau angka.');
    }
    if (item.status !== undefined && typeof item.status !== 'string') {
        galat.push('status harus berupa string.');
    }
    validasiAngka(item, ['ongkir', 'jarak_km'], galat);
    validasiWaktu(item, ['diambil_pada', 'selesai_pada', 'diperbarui_pada'], galat);

    if (ketat && item.status !== undefined && !teksTidakKosong(item.status)) {
        galat.push('status tidak boleh kosong.');
    }

    return { galat, peringatan: [] };
}

function validasiPengajuan(item, ketat = false) {
    const galat = [];

    if (!punyaNilai(item.id)) galat.push('harus memiliki id.');
    if (item.status !== undefined && typeof item.status !== 'string') {
        galat.push('status harus berupa string.');
    } else if (ketat && item.status !== undefined && !STATUS_PENGAJUAN_DIKENAL.has(item.status)) {
        galat.push('status pengajuan tidak dikenal.');
    }
    for (const field of ['form', 'pengguna', 'dokumen']) {
        if (
            item[field] !== undefined &&
            item[field] !== null &&
            !adalahObjek(item[field]) &&
            !(field === 'form' && Array.isArray(item[field]))
        ) {
            galat.push(
                `${field} harus berupa objek${field === 'form' ? ' atau array' : ''} atau null.`,
            );
        }
    }
    validasiWaktu(item, ['dibuat_pada', 'diproses_pada', 'diperbarui_pada'], galat);

    return { galat, peringatan: [] };
}

function validasiNotifikasi(item, ketat = false) {
    const galat = [];

    if (
        !punyaNilai(item.id) &&
        !(punyaNilai(item.judul) && punyaNilai(item.dibuat_pada))
    ) {
        galat.push('harus memiliki id atau judul beserta dibuat_pada.');
    }
    if (item.pengguna_id !== undefined && item.pengguna_id !== null) {
        if (!tipePrimitif(item.pengguna_id)) {
            galat.push('pengguna_id harus berupa string, angka, atau null.');
        }
    }
    if (item.dibaca !== undefined && typeof item.dibaca !== 'boolean') {
        galat.push('dibaca harus berupa boolean.');
    }
    if (item.dibuat_pada !== undefined && typeof item.dibuat_pada !== 'string') {
        galat.push('dibuat_pada harus berupa string.');
    }
    validasiWaktu(item, ['dibuat_pada'], galat);
    if (item.judul !== undefined && typeof item.judul !== 'string') {
        galat.push('judul harus berupa string.');
    }
    if (ketat && item.judul !== undefined && !teksTidakKosong(item.judul)) {
        galat.push('judul tidak boleh kosong.');
    }
    if (item.tipe !== undefined && typeof item.tipe !== 'string') {
        galat.push('tipe harus berupa string.');
    }

    return { galat, peringatan: [] };
}

function validasiUlasan(item, ketat = false) {
    const galat = [];

    if (!punyaIdentitas(item, ['id', 'order_id'])) {
        galat.push('harus memiliki id atau order_id.');
    }
    if (item.order_id !== undefined && !tipePrimitif(item.order_id)) {
        galat.push('order_id harus berupa string atau angka.');
    }
    if (item.rating !== undefined) {
        if (!angkaFinite(item.rating)) {
            galat.push('rating harus berupa angka.');
        } else if (ketat && (item.rating < 1 || item.rating > 5)) {
            galat.push('rating harus berada di antara 1 dan 5.');
        }
    }
    if (item.isi !== undefined && typeof item.isi !== 'string') {
        galat.push('isi harus berupa string.');
    }
    if (item.komentar !== undefined && typeof item.komentar !== 'string') {
        galat.push('komentar harus berupa string.');
    }
    validasiWaktu(item, ['dibuat_pada'], galat);

    return { galat, peringatan: [] };
}

function validasiAkunLokal(item, ketat = false) {
    const galat = [];

    if (!punyaIdentitas(item, ['id', 'email'])) {
        galat.push('harus memiliki id atau email.');
    }
    if (item.id !== undefined && !tipePrimitif(item.id)) {
        galat.push('id harus berupa string atau angka.');
    }
    if (item.email !== undefined) {
        if (typeof item.email !== 'string') {
            galat.push('email harus berupa string.');
        } else if (ketat && !item.email.includes('@')) {
            galat.push('email tidak valid.');
        }
    }

    return { galat, peringatan: [] };
}

export function validasiNonaktif(item) {
    const galat = [];

    if (typeof item !== 'string' && !angkaFinite(item)) {
        galat.push('harus berupa string atau angka.');
    } else if (typeof item === 'string' && !item.trim()) {
        galat.push('tidak boleh berupa string kosong.');
    }

    return { galat, peringatan: [] };
}

function validasiRecord(field, item, ketat = false) {
    switch (field) {
        case 'restoran':
            return validasiRestoran(item, ketat);
        case 'kategori':
            return validasiKategori(item, ketat);
        case 'slot':
            return validasiSlot(item, ketat);
        case 'pesanan':
            return validasiPesanan(item, ketat);
        case 'pengiriman':
            return validasiPengiriman(item, ketat);
        case 'pengajuan':
            return validasiPengajuan(item, ketat);
        case 'notifikasi':
            return validasiNotifikasi(item, ketat);
        case 'ulasan':
            return validasiUlasan(item, ketat);
        case 'akun_lokal':
            return validasiAkunLokal(item, ketat);
        case 'nonaktif':
            return validasiNonaktif(item);
        default:
            return { galat: [], peringatan: [] };
    }
}

export function lengkapiFieldArray(store) {
    if (!adalahObjek(store)) {
        return {
            store,
            field_diinisialisasi: [],
            objek_diinisialisasi: [],
        };
    }

    const hasil = { ...store };
    const field_diinisialisasi = [];
    const objek_diinisialisasi = [];

    for (const field of ARRAY_STORE) {
        if (
            !Object.prototype.hasOwnProperty.call(hasil, field) ||
            hasil[field] === undefined
        ) {
            hasil[field] = [];
            field_diinisialisasi.push(field);
        }
    }

    for (const field of OBJEK_STORE) {
        if (
            !Object.prototype.hasOwnProperty.call(hasil, field) ||
            hasil[field] === undefined
        ) {
            hasil[field] = {};
            objek_diinisialisasi.push(field);
        }
    }

    return {
        store: hasil,
        field_diinisialisasi,
        objek_diinisialisasi,
    };
}

function opsiValidasi(opsi) {
    if (typeof opsi === 'boolean') return { ketat: opsi };

    return adalahObjek(opsi) ? opsi : {};
}

export function validasiStore(store, opsi = {}) {
    const galat = [];
    const peringatan = [];
    const { ketat = false } = opsiValidasi(opsi);

    if (!adalahObjek(store)) {
        return { ok: false, galat: ['Store bukan objek.'], peringatan };
    }

    if (!angkaFinite(store.versi) || !Number.isInteger(store.versi) || store.versi < 0) {
        galat.push('Field "versi" harus berupa bilangan bulat tidak negatif.');
    } else if (ketat && store.versi !== VERSI_SKEMA) {
        galat.push(`Field "versi" harus bernilai ${VERSI_SKEMA}.`);
    }

    if (
        store.revisi !== undefined &&
        (!angkaFinite(store.revisi) || !Number.isInteger(store.revisi) || store.revisi < 0)
    ) {
        galat.push('Field "revisi" harus berupa bilangan bulat tidak negatif.');
    }

    if (store.seed_versi !== undefined && store.seed_versi !== null) {
        if (typeof store.seed_versi !== 'string' || (ketat && !store.seed_versi.trim())) {
            galat.push('Field "seed_versi" harus berupa string tidak kosong atau null.');
        }
    }

    for (const field of ARRAY_STORE) {
        if (
            !Object.prototype.hasOwnProperty.call(store, field) ||
            store[field] === undefined
        ) {
            galat.push(`Field array "${field}" tidak ada.`);
            continue;
        }

        if (!Array.isArray(store[field])) {
            galat.push(`Field "${field}" harus berupa array.`);
            continue;
        }

        store[field].forEach((item, indeks) => {
            if (field !== 'nonaktif' && !adalahObjek(item)) {
                galat.push(`Field "${field}[${indeks}]" harus berupa objek.`);
                return;
            }

            const hasil = validasiRecord(field, item, ketat);

            for (const pesan of hasil.galat) {
                galat.push(`Field "${field}[${indeks}]": ${pesan}`);
            }
            for (const pesan of hasil.peringatan) {
                peringatan.push(`Field "${field}[${indeks}]": ${pesan}`);
            }
        });
    }

    for (const field of OBJEK_STORE) {
        if (store[field] === undefined) {
            if (ketat) galat.push(`Field "${field}" tidak ada.`);
            continue;
        }

        if (!adalahObjek(store[field])) {
            galat.push(`Field "${field}" harus berupa objek.`);
        }
    }

    return { ok: galat.length === 0, galat, peringatan };
}

export function validasiStoreV2(store) {
    return validasiStore(store, { ketat: true });
}
