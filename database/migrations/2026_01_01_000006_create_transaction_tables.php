<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->enum('method', ['qris', 'transfer', 'dp', 'cod']);
            $table->unsignedInteger('amount');
            $table->string('reference', 60)->nullable();
            $table->enum('status', ['menunggu', 'lunas', 'gagal', 'dikembalikan'])->default('menunggu');
            $table->string('proof_path')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // Satu pesanan hanya boleh punya satu pengiriman aktif (unique order_id).
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['available', 'claimed', 'picked_up', 'on_the_way', 'delivered', 'cancelled'])
                ->default('available')
                ->index();
            $table->decimal('distance_km', 5, 2)->nullable();
            $table->unsignedInteger('delivery_fee')->nullable();
            $table->string('proof_photo_path')->nullable();
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['pesanan', 'verifikasi', 'pengiriman', 'promo', 'sistem'])->default('pesanan');
            $table->string('title');
            $table->text('body');
            $table->string('link')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->boolean('seller_reply')->default(false);
            $table->text('seller_reply_text')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('payments');
    }
};
