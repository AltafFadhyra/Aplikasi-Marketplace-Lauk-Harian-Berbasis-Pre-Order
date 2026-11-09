<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'address',
        'patokan',
        'latitude',
        'longitude',
        'avatar',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function seller(): HasOne
    {
        return $this->hasOne(Seller::class);
    }

    public function courier(): HasOne
    {
        return $this->hasOne(Courier::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->whereNull('read_at')->count();
    }

    public function isSeller(): bool
    {
        return $this->role === 'penjual';
    }

    public function isCourier(): bool
    {
        return $this->role === 'kurir';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
