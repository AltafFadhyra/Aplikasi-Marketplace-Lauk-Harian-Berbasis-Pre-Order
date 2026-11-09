<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    protected $fillable = [
        'order_id', 'courier_id', 'status', 'distance_km',
        'delivery_fee', 'proof_photo_path', 'claimed_at', 'picked_up_at', 'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'distance_km' => 'float',
            'claimed_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }
}
