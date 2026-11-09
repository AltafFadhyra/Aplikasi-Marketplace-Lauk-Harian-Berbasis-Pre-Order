<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    public const STATUS_MENUNGGU_PEMBAYARAN = 'menunggu_pembayaran';
    public const STATUS_DIPROSES = 'diproses';
    public const STATUS_SIAP_DIANTAR = 'siap_diantar';
    public const STATUS_DIAMBIL_KURIR = 'diambil_kurir';
    public const STATUS_DALAM_PENGIRIMAN = 'dalam_pengiriman';
    public const STATUS_SELESAI = 'selesai';
    public const STATUS_DIBATALKAN = 'dibatalkan';

    protected $fillable = [
        'order_code', 'buyer_id', 'restaurant_id', 'courier_id', 'order_slot_id',
        'subtotal', 'delivery_fee', 'service_fee', 'discount', 'total',
        'status', 'payment_method', 'payment_status', 'paid_at', 'expires_at',
        'eta_at', 'delivered_at', 'distance_km', 'address_snapshot',
        'buyer_note', 'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'address_snapshot' => 'array',
            'distance_km' => 'float',
            'paid_at' => 'datetime',
            'expires_at' => 'datetime',
            'eta_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(OrderSlot::class, 'order_slot_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
