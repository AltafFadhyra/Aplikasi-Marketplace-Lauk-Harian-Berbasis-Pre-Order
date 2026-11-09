<?php

namespace App\Http\Controllers;

class CourierController extends Controller
{
    public function dashboard()
    {
        return inertia('Courier/Dashboard');
    }

    public function available()
    {
        return inertia('Courier/Available');
    }

    public function deliveries()
    {
        return inertia('Courier/Deliveries');
    }

    public function deliveryDetail(string $kode)
    {
        return inertia('Courier/DeliveryDetail', ['kode' => $kode]);
    }

    public function history()
    {
        return inertia('Courier/History');
    }

    public function profile()
    {
        return inertia('Courier/Profile');
    }
}
