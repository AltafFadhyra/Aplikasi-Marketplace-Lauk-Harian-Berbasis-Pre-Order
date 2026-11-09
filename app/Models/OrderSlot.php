<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderSlot extends Model
{
    protected $fillable = [
        'restaurant_id', 'date', 'start_time', 'end_time',
        'label', 'capacity', 'taken', 'cutoff_at', 'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'cutoff_at' => 'datetime',
        ];
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function sisaKuota(): int
    {
        return max(0, $this->capacity - $this->taken);
    }

    public function isPenuh(): bool
    {
        return $this->taken >= $this->capacity;
    }

    public function batasTanggal(): \Carbon\Carbon
    {
        return \Carbon\Carbon::parse($this->date)
            ->setTimeFromTimeString($this->start_time);
    }
}
