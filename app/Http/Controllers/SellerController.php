<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderSlot;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SellerController extends Controller
{
    public function dashboard()
    {
        return inertia('Seller/Dashboard');
    }

    public function orders()
    {
        return inertia('Seller/Orders');
    }

    public function orderDetail(string $kode)
    {
        return inertia('Seller/OrderDetail', ['kode' => $kode]);
    }

    public function menus()
    {
        return inertia('Seller/Menus');
    }

    public function menuForm(int $menu)
    {
        return inertia('Seller/MenuForm', ['menuId' => $menu]);
    }

    public function slots(Request $request)
    {
        $restoranId = (int) $request->integer('restoran', 0);

        $slotAwal = OrderSlot::where('restaurant_id', $restoranId)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'tanggal' => $s->date->toDateString(),
                'tanggal_label' => $s->date->translatedFormat('D, d M'),
                'label' => $s->label,
                'jam_mulai' => substr($s->start_time, 0, 5),
                'jam_selesai' => substr($s->end_time, 0, 5),
                'kapasitas' => $s->capacity,
                'terisi' => $s->taken,
                'batas_pesan' => $s->cutoff_at->toIso8601String(),
            ]);

        // Validasi: restoran harus exist dan active
        $restoranValid = Restaurant::where('id', $restoranId)
            ->where('is_open', true)
            ->exists();

        return inertia('Seller/Slots', [
            'restoranId' => $restoranId ?: null,
            'slotAwal' => $slotAwal,
            'restoranValid' => $restoranValid,
        ]);
    }

    public function storeProfile()
    {
        return inertia('Seller/StoreProfile');
    }
}
