<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Courier;
use App\Models\Menu;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderSlot;
use App\Models\RegistrationRequest;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\Seller;
use App\Models\User;
use App\Models\VerificationDocument;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Menyusun satu bundel data demo yang dikirim ke React lewat Inertia.
 *
 * Semua data bersifat BACA SAJA di sisi frontend. Perubahan status
 * (pesan dibuat, pesanan maju, kurir klaim, verifikasi admin) ditangani
 * di sisi browser sementara backend belum diimplementasikan.
 */
class DemoData
{
    public static function payload(): array
    {
        return Cache::remember('demo.payload.v2', 300, function () {
            return [
                'kategori' => self::kategori(),
                'restoran' => self::restoran(),
                'slot' => self::slot(),
                'akun' => self::akun(),
                'notifikasi' => self::notifikasi(),
                'pengajuan' => self::pengajuan(),
                'pesanan' => self::pesanan(),
                'ulasan' => self::ulasan(),
                'kurir' => self::kurir(),
                'statistik' => self::statistik(),
            ];
        });
    }

    private static function kategori(): array
    {
        return Category::orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'icon', 'color'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'nama' => $c->name,
                'slug' => $c->slug,
                'ikon' => $c->icon,
                'warna' => $c->color,
            ])
            ->all();
    }

    private static function restoran(): array
    {
        $pembeli = User::where('role', 'pembeli')->where('email', 'buyer@preorderly.id')->first();

        return Restaurant::with(['menus' => fn ($q) => $q->where('is_active', true), 'category', 'seller'])
            ->whereHas('seller', fn ($q) => $q->where('status', 'approved'))
            ->orderByDesc('rating_avg')
            ->get()
            ->map(function ($r) use ($pembeli) {
                $menu = $r->menus->map(fn ($m) => [
                    'id' => $m->id,
                    'restoran_id' => $m->restaurant_id,
                    'kategori_id' => $m->category_id,
                    'nama' => $m->name,
                    'deskripsi' => $m->description,
                    'harga' => $m->price,
                    'harga_efektif' => $m->effectivePrice(),
                    'gambar' => $m->image,
                    'lead_time_menit' => $m->lead_time_minutes,
                    'lead_time_label' => self::leadTimeLabel($m->lead_time_minutes),
                    'maks_harian' => $m->max_daily_qty,
                    'hanya_preorder' => $m->is_preorder_only,
                    'catatan_masak' => $m->prep_note,
                    'rating' => (float) $m->rating_avg,
                    'jumlah_rating' => $m->rating_count,
                    'terjual' => $m->sold_count,
                    'kategori' => $m->category?->name,
                ])->values()->all();

                $slotTersedia = OrderSlot::where('restaurant_id', $r->id)
                    ->where('status', 'tersedia')
                    ->whereDate('date', '<=', Carbon::today()->addDays(3))
                    ->where('cutoff_at', '>', now())
                    ->count();

                return [
                    'id' => $r->id,
                    'slug' => $r->slug,
                    'nama' => $r->name,
                    'deskripsi' => $r->description,
                    'alamat' => $r->address,
                    'latitude' => $r->latitude,
                    'longitude' => $r->longitude,
                    'jarak_km' => $pembeli ? self::jarak($pembeli, $r) : null,
                    'min_order' => $r->min_order,
                    'rata2_persiapan' => $r->avg_prep_minutes,
                    'persiapan_label' => self::leadTimeLabel($r->avg_prep_minutes),
                    'gratis_ongkir' => $r->free_shipping,
                    'banner' => $r->banner,
                    'logo' => $r->logo,
                    'rating' => (float) $r->rating_avg,
                    'jumlah_rating' => $r->rating_count,
                    'terjual' => $r->sold_count,
                    'buka' => $r->is_open,
                    'kategori' => $r->category?->name,
                    'kategori_slug' => $r->category?->slug,
                    'kategori_ikon' => $r->category?->icon,
                    'sorotan' => $r->highlights ?? [],
                    'jam_buka' => $r->opening_hours ?? [],
                    'slot_tersedia' => $slotTersedia,
                    'jumlah_menu' => $r->menus->count(),
                    'dibuat_pada' => $r->created_at?->toIso8601String(),
                    'penjual' => [
                        'nama' => $r->seller?->user?->name,
                        'avatar' => $r->seller?->user?->avatar,
                        'toko' => $r->seller?->store_name,
                        'status' => $r->seller?->status,
                    ],
                    'menu' => $menu,
                ];
            })
            ->all();
    }

    private static function slot(): array
    {
        return OrderSlot::where('status', 'tersedia')
            ->whereDate('date', '<=', Carbon::today()->addDays(3))
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'restoran_id' => $s->restaurant_id,
                'tanggal' => $s->date->toDateString(),
                'tanggal_label' => $s->date->translatedFormat('D, d M'),
                'jam_mulai' => substr($s->start_time, 0, 5),
                'jam_selesai' => substr($s->end_time, 0, 5),
                'label' => $s->label,
                'kapasitas' => $s->capacity,
                'terisi' => $s->taken,
                'sisa' => max(0, $s->capacity - $s->taken),
                'batas_pesan' => $s->cutoff_at->toIso8601String(),
                'status' => $s->status,
                'waktu' => Carbon::parse($s->date->toDateString().' '.$s->start_time)->toIso8601String(),
            ])
            ->all();
    }

    private static function akun(): array
    {
        $peta = [
            'pembeli' => 'buyer@preorderly.id',
            'penjual' => 'penjual1@preorderly.id',
            'kurir' => 'courier@preorderly.id',
            'admin' => 'admin@preorderly.id',
        ];

        $hasil = [];

        foreach ($peta as $peran => $email) {
            $user = User::with(['seller.restaurant', 'courier'])->where('email', $email)->first();

            if (! $user) {
                continue;
            }

            $hasil[$peran] = [
                'id' => $user->id,
                'nama' => $user->name,
                'email' => $user->email,
                'telepon' => $user->phone,
                'peran' => $user->role,
                'avatar' => $user->avatar,
                'alamat' => $user->address,
                'patokan' => $user->patokan,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
                'restoran_id' => $user->seller?->restaurant?->id,
                'toko' => $user->seller?->store_name,
                'nik_tersensor' => $user->courier?->maskedNik(),
            ];
        }

        return $hasil;
    }

    private static function notifikasi(): array
    {
        $daftar = Notification::orderByDesc('created_at')->limit(40)->get();

        if ($daftar->isEmpty()) {
            return [];
        }

        // Notifikasi awal dibagi rata ke keempat akun demo.
        $akun = User::whereIn('email', [
            'buyer@preorderly.id', 'penjual1@preorderly.id', 'courier@preorderly.id', 'admin@preorderly.id',
        ])->pluck('id')->all();

        $hasil = [];

        foreach ($akun as $i => $userId) {
            foreach ($daftar as $n) {
                $hasil[] = [
                    'id' => $n->id.'-'.$i,
                    'pengguna_id' => $userId,
                    'tipe' => $n->type,
                    'judul' => $n->title,
                    'isi' => $n->body,
                    'link' => $n->link,
                    'dibaca' => $n->read_at !== null,
                    'dibuat_pada' => $n->created_at->toIso8601String(),
                ];
            }
        }

        return $hasil;
    }

    private static function pengajuan(): array
    {
        return RegistrationRequest::with(['user', 'reviewer'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($p) {
                $dokumen = VerificationDocument::where('user_id', $p->user_id)->first();

                return [
                    'id' => $p->id,
                    'peran' => $p->role,
                    'status' => $p->status,
                    'form' => $p->form_data,
                    'catatan_admin' => $p->admin_note,
                    'diproses_oleh' => $p->reviewer?->name,
                    'diproses_pada' => $p->reviewed_at?->toIso8601String(),
                    'dibuat_pada' => $p->created_at->toIso8601String(),
                    'pengguna' => [
                        'id' => $p->user->id,
                        'nama' => $p->user->name,
                        'email' => $p->user->email,
                        'telepon' => $p->user->phone,
                        'avatar' => $p->user->avatar,
                    ],
                    'dokumen' => $dokumen ? [
                        'id' => $dokumen->id,
                        'nik' => $dokumen->maskedNik(),
                        'nama_lengkap' => $dokumen->full_name,
                        'tempat_lahir' => $dokumen->birth_place,
                        'tanggal_lahir' => $dokumen->birth_date?->toDateString(),
                        'jenis_sertifikat' => $dokumen->certificate_type,
                        'nomor_sertifikat' => $dokumen->certificate_number,
                        'status' => $dokumen->status,
                        'alasan_tolak' => $dokumen->reject_reason,
                        'terarsip' => $dokumen->archived_at !== null,
                        'disimpan_sampai' => $dokumen->retained_until?->toDateString(),
                        'jumlah_akses' => $dokumen->accessLogs()->count(),
                    ] : null,
                ];
            })
            ->all();
    }

    private static function pesanan(): array
    {
        $SEMUA_STATUS = [
            Order::STATUS_MENUNGGU_PEMBAYARAN, Order::STATUS_DIPROSES, Order::STATUS_SIAP_DIANTAR,
            Order::STATUS_DIAMBIL_KURIR, Order::STATUS_DALAM_PENGIRIMAN, Order::STATUS_SELESAI,
            Order::STATUS_DIBATALKAN,
        ];

        $labelTimeline = [
            Order::STATUS_MENUNGGU_PEMBAYARAN => 'Pesanan dibuat',
            Order::STATUS_DIPROSES => 'Pembayaran diterima, masuk dapur',
            Order::STATUS_SIAP_DIANTAR => 'Makanan siap, menunggu kurir',
            Order::STATUS_DIAMBIL_KURIR => 'Kurir mengambil pesanan',
            Order::STATUS_DALAM_PENGIRIMAN => 'Pesanan dalam pengiriman',
            Order::STATUS_SELESAI => 'Pesanan diterima pembeli',
        ];

        return Order::with(['items', 'restaurant', 'buyer', 'courier', 'slot', 'delivery'])
            ->whereIn('status', $SEMUA_STATUS)
            ->orderByDesc('created_at')
            ->limit(60)
            ->get()
            ->map(function ($o) use ($labelTimeline) {
                $timeline = [];
                $sumber = [
                    Order::STATUS_MENUNGGU_PEMBAYARAN => $o->created_at,
                    Order::STATUS_DIPROSES => $o->paid_at ?? $o->created_at,
                    Order::STATUS_SIAP_DIANTAR => $o->paid_at ?? $o->created_at,
                    Order::STATUS_DIAMBIL_KURIR => $o->delivery?->picked_up_at,
                    Order::STATUS_DALAM_PENGIRIMAN => $o->delivery?->claimed_at,
                    Order::STATUS_SELESAI => $o->delivered_at,
                ];

                foreach ($labelTimeline as $status => $label) {
                    $pada = $sumber[$status] ?? null;

                    if (! $pada) {
                        continue;
                    }

                    $timeline[] = [
                        'status' => $status,
                        'label' => $label,
                        'pada' => $pada->toIso8601String(),
                        'oleh' => match ($status) {
                            Order::STATUS_MENUNGGU_PEMBAYARAN => $o->buyer?->name ?? 'Pembeli',
                            Order::STATUS_SELESAI => $o->buyer?->name ?? 'Pembeli',
                            Order::STATUS_DIAMBIL_KURIR, Order::STATUS_DALAM_PENGIRIMAN => $o->courier?->name ?? 'Kurir',
                            default => 'Sistem',
                        },
                    ];
                }

                $dibayar = $o->payment_status === 'lunas' || $o->payment_status === 'menunggu_di_tempat';

                return [
                    'id' => $o->id,
                    'kode' => $o->order_code,
                    'pembeli_id' => $o->buyer_id,
                    'pembeli_nama' => $o->buyer?->name,
                    'pembeli_avatar' => $o->buyer?->avatar,
                    'pembeli_telepon' => $o->buyer?->phone,
                    'pembeli_alamat' => $o->buyer?->address,
                    'restoran_id' => $o->restaurant_id,
                    'restoran_nama' => $o->restaurant?->name,
                    'kurir_id' => $o->courier_id,
                    'kurir_nama' => $o->courier?->name,
                    'slot_id' => $o->order_slot_id,
                    'slot_label' => $o->slot?->label,
                    'items' => $o->items->map(fn ($i) => [
                        'menu_id' => $i->menu_id,
                        'nama' => $i->menu_name,
                        'harga' => (int) $i->price,
                        'qty' => $i->qty,
                        'catatan' => $i->note,
                        'gambar' => $i->menu_image,
                    ])->values()->all(),
                    'subtotal' => (int) $o->subtotal,
                    'ongkir' => (int) $o->delivery_fee,
                    'ongkir_gratis' => (int) $o->delivery_fee === 0,
                    'biaya_layanan' => (int) $o->service_fee,
                    'diskon' => (int) $o->discount,
                    'total' => (int) $o->total,
                    'metode_bayar' => $o->payment_method,
                    'dibayar_sebesar' => $dibayar ? (int) $o->total : 0,
                    'sisa_tagihan' => $dibayar ? 0 : (int) $o->total,
                    'status_bayar' => $o->payment_status,
                    'status' => $o->status,
                    'catatan' => $o->buyer_note,
                    'alasan_batal' => $o->cancel_reason,
                    'alamat' => $o->address_snapshot,
                    'jarak_km' => (float) $o->distance_km,
                    'dibuat_pada' => $o->created_at->toIso8601String(),
                    'eta' => $o->eta_at?->toIso8601String(),
                    'kedaluwarsa' => $o->expires_at?->toIso8601String(),
                    'timeline' => $timeline,
                    'simulated' => true,
                ];
            })
            ->all();
    }

    private static function ulasan(): array
    {
        return Review::with(['buyer', 'restaurant', 'menu'])
            ->whereNotNull('comment')
            ->orderByDesc('created_at')
            ->limit(40)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'order_id' => $r->order_id,
                'restoran_id' => $r->restaurant_id,
                'restoran_nama' => $r->restaurant?->name,
                'menu_id' => $r->menu_id,
                'menu_nama' => $r->menu?->name,
                'nama' => $r->buyer?->name,
                'avatar' => $r->buyer?->avatar,
                'rating' => (float) $r->rating,
                'isi' => $r->comment,
                'balasan' => $r->seller_reply_text,
                'dibuat_pada' => $r->created_at->toIso8601String(),
            ])
            ->all();
    }

    private static function kurir(): array
    {
        return Courier::with('user')
            ->where('status', 'approved')
            ->orderByDesc('rating_avg')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->user_id,
                'nama' => $c->user?->name,
                'avatar' => $c->user?->avatar,
                'kendaraan' => $c->vehicle_type,
                'plat' => $c->vehicle_plate,
                'rating' => (float) $c->rating_avg,
                'jumlah_rating' => $c->rating_count,
                'total_pengiriman' => $c->total_deliveries,
                'status' => $c->status,
                'aktif' => $c->is_available,
            ])
            ->all();
    }

    private static function statistik(): array
    {
        $restoranAktif = Restaurant::count();
        $pendapatan = Order::whereNotIn('status', ['dibatalkan', 'kedaluwarsa', 'menunggu_pembayaran'])
            ->sum('total');

        return [
            'total_pengguna' => User::count(),
            'total_pembeli' => User::where('role', 'pembeli')->count(),
            'total_penjual' => Seller::where('status', 'approved')->count(),
            'total_kurir' => Courier::where('status', 'approved')->count(),
            'total_restoran' => $restoranAktif,
            'total_menu' => Menu::count(),
            'total_pesanan' => Order::count(),
            'pesanan_aktif' => Order::whereIn('status', [
                Order::STATUS_DIPROSES, Order::STATUS_SIAP_DIANTAR,
                Order::STATUS_DIAMBIL_KURIR, Order::STATUS_DALAM_PENGIRIMAN,
            ])->count(),
            'pendapatan' => (int) $pendapatan,
            'rata2_rating' => round((float) Review::avg('rating'), 2),
            'menunggu_verifikasi' => RegistrationRequest::where('status', 'pending')->count(),
        ];
    }

    private static function leadTimeLabel(int $menit): string
    {
        if ($menit < 60) {
            return $menit.' menit';
        }

        $jam = intdiv($menit, 60);
        $sisa = $menit % 60;

        return $sisa ? "{$jam} jam {$sisa} menit" : "{$jam} jam";
    }

    private static function jarak(User $pembeli, Restaurant $restoran): float
    {
        $dLat = deg2rad($restoran->latitude - $pembeli->latitude);
        $dLon = deg2rad($restoran->longitude - $pembeli->longitude);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($pembeli->latitude)) * cos(deg2rad($restoran->latitude)) * sin($dLon / 2) ** 2;

        return round(2 * 6371 * asin(sqrt($a)), 1);
    }
}
