import { ONGKIR_DASAR, ONGKIR_PER_KM, MIN_BELANJA_GRATIS_ONGKIR } from './constants';

const RADIUS_BUMI_KM = 6371;

function toRad(derajat) {
    return (derajat * Math.PI) / 180;
}

export function jarakKm(awal, akhir) {
    if (!awal || !akhir) return 0;

    const lat1 = Number(awal.latitude ?? awal.lat);
    const lon1 = Number(awal.longitude ?? awal.lng ?? awal.lon);
    const lat2 = Number(akhir.latitude ?? akhir.lat);
    const lon2 = Number(akhir.longitude ?? akhir.lng ?? akhir.lon);

    if ([lat1, lon1, lat2, lon2].some((v) => Number.isNaN(v) || v === undefined)) return 0;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return Math.round(2 * RADIUS_BUMI_KM * Math.asin(Math.sqrt(a)) * 10) / 10;
}

export function hitungOngkir(jarak, subtotal) {
    const jarakAngka = Number(jarak) || 0;
    const angkaSubtotal = Number(subtotal) || 0;

    const gratis = angkaSubtotal >= MIN_BELANJA_GRATIS_ONGKIR && jarakAngka <= 12;
    const dasar = gratis ? 0 : ONGKIR_DASAR + Math.round(ONGKIR_PER_KM * jarakAngka);

    return {
        gratis,
        dasar,
        label: gratis ? 'Gratis ongkir' : `Rp${dasar.toLocaleString('id-ID')}`,
    };
}

export function ringkasanBiaya({ subtotal = 0, jarak = 0, biayaLayanan = 2000, diskon = 0 }) {
    const ongkir = hitungOngkir(jarak, subtotal);
    const total = Math.max(0, subtotal + ongkir.dasar + biayaLayanan - diskon);

    return {
        subtotal,
        ongkir: ongkir.dasar,
        ongkirGratis: ongkir.gratis,
        ongkirLabel: ongkir.label,
        biayaLayanan,
        diskon,
        total,
    };
}
