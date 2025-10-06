<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            // Laravel defaults
            $table->uuid('id')->primary();
            $table->string('type'); // Notification class
            $table->morphs('notifiable'); // notifiable_type + notifiable_id
            $table->text('data'); // JSON payload
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // ✅ Your custom field
            $table->enum('status', ['unread', 'read', 'archived'])->default('unread');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
