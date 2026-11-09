<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Review;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function home()
    {
        return inertia('Buyer/Home', [
            'statistik' => [
                'restoran' => Restaurant::where('is_open', true)->count(),
                'menu' => \App\Models\Menu::where('is_active', true)->count(),
                'pembeli' => \App\Models\User::where('role', 'pembeli')->count(),
            ],
        ]);
    }

    public function search(Request $request)
    {
        return inertia('Buyer/Search', [
            'filterAwal' => [
                'q' => $request->string('q')->toString(),
                'kategori' => $request->string('kategori')->toString(),
                'urutkan' => $request->string('urutkan')->toString() ?: 'rekomendasi',
            ],
        ]);
    }

    public function restaurant(string $slug)
    {
        $restoran = Restaurant::where('slug', $slug)->firstOrFail();

        if (! $restoran->is_open) {
            return inertia('errors/404')->with(['message' => 'Restoran tidak ditemukan atau tidak aktif.']);
        }

        $ulasan = Review::where('restaurant_id', $restoran->id)
            ->with('buyer')
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'nama' => $r->buyer?->name,
                'avatar' => $r->buyer?->avatar,
                'rating' => $r->rating,
                'komentar' => $r->comment,
                'balasan' => $r->seller_reply_text,
                'dibuat_pada' => $r->created_at->toIso8601String(),
            ]);

        return inertia('Buyer/RestaurantDetail', [
            'slug' => $restoran->slug,
            'restoranId' => $restoran->id,
            'ulasan' => $ulasan,
        ]);
    }

    public function menuDetail(int $menu)
    {
        return inertia('Buyer/MenuDetail', ['menuId' => $menu]);
    }

    public function cart()
    {
        return inertia('Buyer/Cart');
    }

    public function checkout()
    {
        return inertia('Buyer/Checkout');
    }

    public function orderSuccess()
    {
        return inertia('Buyer/OrderSuccess');
    }

    public function orders()
    {
        return inertia('Buyer/Orders', [
            'riwayatAwal' => Order::with('items')->latest()->limit(20)->get()
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'kode' => $o->order_code,
                    'status' => $o->status,
                    'total' => $o->total,
                    'restoran' => $o->restaurant?->name,
                    'dibuat_pada' => $o->created_at->toIso8601String(),
                ]),
        ]);
    }

    public function orderDetail(string $kode)
    {
        return inertia('Buyer/OrderDetail', ['kode' => $kode]);
    }

    public function notifications()
    {
        return inertia('Buyer/Notifications');
    }

    public function profile()
    {
        return inertia('Buyer/Profile');
    }

    public function tentang()
    {
        return inertia('Public/About');
    }

    public function kebijakanPrivasi()
    {
        return inertia('Public/Privacy');
    }
}
