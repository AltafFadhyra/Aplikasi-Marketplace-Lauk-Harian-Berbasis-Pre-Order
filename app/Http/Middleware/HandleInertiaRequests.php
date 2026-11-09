<?php

namespace App\Http\Middleware;

use App\Support\DemoData;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'app' => [
                'name' => config('app.name', 'Preorderly'),
                'maks_hari_preorder' => 3,
                'fase' => 'frontend',
            ],

            // Bundel data demo. Data ini dibaca oleh React dan dipakai
            // seluruh halaman (pembeli, penjual, kurir, admin) sebagai
            // sumber state bersama saat tahap frontend.
            'demo' => DemoData::payload(),
        ];
    }
}
