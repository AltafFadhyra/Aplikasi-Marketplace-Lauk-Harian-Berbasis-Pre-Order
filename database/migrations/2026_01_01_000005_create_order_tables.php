<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Slot pre-order yang dibuat penjual. Pembeli memilih slot yang tersedia.
        Schema::create('order_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('label');
            $table->unsignedInteger('capacity')->default(10);
            $table->unsignedInteger('taken')->default(0);
            $table->timestamp('cutoff_at');
            $table->enum('status', ['tersedia', 'penuh', 'ditutup'])->default('tersedia')->index();
            $table->timestamps();

            $table->unique(['restaurant_id', 'date', 'start_time'], 'slots_restoran_jam_unik');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 30)->unique();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('order_slot_id')->nullable()->constrained('order_slots')->nullOnDelete();

            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('delivery_fee');
            $table->unsignedInteger('service_fee')->default(2000);
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('total');

            $table->enum(
                'status',
                [
                    'menunggu_pembayaran',
                    'diproses',
                    'siap_diantar',
                    'diambil_kurir',
                    'dalam_pengiriman',
                    'selesai',
                    'dibatalkan',
                    'kedaluwarsa',
                ]
            )->default('menunggu_pembayaran')->index();

            $table->enum('payment_method', ['qris', 'transfer', 'dp', 'cod'])->default('qris');
            $table->enum('payment_status', ['menunggu', 'lunas', 'menunggu_di_tempat', 'gagal', 'dikembalikan'])->default('menunggu');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('eta_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            $table->decimal('distance_km', 5, 2)->nullable();
            $table->json('address_snapshot')->nullable();
            $table->text('buyer_note')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamps();

            $table->index(['buyer_id', 'status']);
            $table->index(['restaurant_id', 'status']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('menu_id')->nullable()->constrained()->nullOnDelete();
            $table->string('menu_name');
            $table->string('menu_image')->nullable();
            $table->unsignedInteger('price');
            $table->unsignedInteger('qty');
            $table->unsignedInteger('subtotal');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('qty')->default(1);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['buyer_id', 'menu_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('order_slots');
    }
};
